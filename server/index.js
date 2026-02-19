import express from 'express';
import pg from 'pg';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import Stripe from 'stripe';
import JSZip from 'jszip';

const { Pool } = pg;
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize services
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

app.use(express.json({ limit: '10mb' }));

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get('/api/health', async (req, res) => {
  let dbConnected = false;
  try {
    await pool.query('SELECT 1');
    dbConnected = true;
  } catch (err) {
    console.error('DB connection failed:', err);
  }

  res.json({
    status: 'ok',
    env: {
      hasAnthropicKey: !!process.env.ANTHROPIC_API_KEY,
      hasStripeKey: !!process.env.STRIPE_SECRET_KEY,
      hasNetlifyToken: !!process.env.NETLIFY_TOKEN,
      hasDatabase: dbConnected,
    }
  });
});

// ─── Save Submission ──────────────────────────────────────────────────────────
app.post('/api/submissions', async (req, res) => {
  const { business, brand } = req.body;

  try {
    const result = await pool.query(
      `INSERT INTO submissions (
        business_name, business_type, email, phone, city, state, zip, address,
        description, tagline, services, service_areas, logo_url, primary_color,
        secondary_color, hero_image_url, photos, years_experience, emergency,
        financing, warranty, certifications
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22)
      RETURNING id`,
      [
        business.name, business.type, business.email, business.phone,
        business.city, business.state, business.zip || null, business.address || null,
        business.description, business.tagline, JSON.stringify(business.services || []),
        business.serviceAreas || null, brand.logo || null, brand.primary || null,
        brand.secondary || null, brand.hero || null, JSON.stringify(brand.photos || []),
        business.years || null, business.emergency || false, business.financing || false,
        business.warranty || null, JSON.stringify(business.certs || [])
      ]
    );

    res.json({ submissionId: result.rows[0].id });
  } catch (err) {
    console.error('Save submission error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ─── Create Stripe Checkout ──────────────────────────────────────────────────
app.post('/api/create-checkout/:submissionId', async (req, res) => {
  const { submissionId } = req.params;

  try {
    const check = await pool.query('SELECT id, email, payment_status FROM submissions WHERE id = $1', [submissionId]);
    if (check.rows.length === 0) {
      return res.status(404).json({ error: 'Submission not found' });
    }

    // Don't allow duplicate payments
    if (check.rows[0].payment_status === 'paid') {
      return res.status(400).json({ error: 'Already paid' });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      customer_email: check.rows[0].email,
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: {
            name: 'AI Website Builder',
            description: 'Professional contractor website with instant deployment',
          },
          unit_amount: 9700, // $97.00
        },
        quantity: 1,
      }],
      mode: 'payment',
      success_url: `${req.headers.origin || 'http://localhost:3000'}?session_id={CHECKOUT_SESSION_ID}&submission_id=${submissionId}`,
      cancel_url: `${req.headers.origin || 'http://localhost:3000'}?canceled=true`,
    });

    res.json({ url: session.url });
  } catch (err) {
    console.error('Checkout error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ─── Verify Payment ───────────────────────────────────────────────────────────
app.get('/api/verify-payment/:sessionId', async (req, res) => {
  const { sessionId } = req.params;

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    
    if (session.payment_status !== 'paid') {
      return res.status(400).json({ error: 'Payment not completed' });
    }

    // Get submission ID from success_url
    const url = new URL(session.success_url);
    const submissionId = url.searchParams.get('submission_id');

    if (!submissionId) {
      return res.status(400).json({ error: 'Submission ID not found' });
    }

    // Update payment status
    await pool.query(
      'UPDATE submissions SET payment_status = $1, stripe_session_id = $2, paid_at = NOW() WHERE id = $3',
      ['paid', sessionId, submissionId]
    );

    // Get submission data
    const result = await pool.query('SELECT * FROM submissions WHERE id = $1', [submissionId]);
    const sub = result.rows[0];

    res.json({
      verified: true,
      submissionId: sub.id,
      business: {
        name: sub.business_name,
        type: sub.business_type,
        email: sub.email,
        phone: sub.phone,
        city: sub.city,
        state: sub.state,
        zip: sub.zip,
        address: sub.address,
        description: sub.description,
        tagline: sub.tagline,
        services: JSON.parse(sub.services || '[]'),
        serviceAreas: sub.service_areas,
        years: sub.years_experience,
        emergency: sub.emergency,
        financing: sub.financing,
        warranty: sub.warranty,
        certs: JSON.parse(sub.certifications || '[]'),
      },
      brand: {
        logo: sub.logo_url,
        hero: sub.hero_image_url,
        photos: JSON.parse(sub.photos || '[]'),
        primary: sub.primary_color,
        secondary: sub.secondary_color,
      }
    });
  } catch (err) {
    console.error('Verify payment error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ─── AI Content Generation ───────────────────────────────────────────────────
app.post('/api/generate-content', async (req, res) => {
  const { business } = req.body;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 4000,
        messages: [{
          role: 'user',
          content: `You are a professional copywriter for home service contractors. Generate website content for this business:

Business: ${business.name}
Type: ${business.type}
Location: ${business.city}, ${business.state}
Description: ${business.description}
Services: ${business.services?.join(', ') || 'General services'}
Years: ${business.years || 'Established'} years
Tagline: ${business.tagline}

Generate ONLY valid JSON (no markdown, no explanation) with this exact structure:
{
  "heroHeadline": "powerful 5-8 word headline focused on the main benefit",
  "heroSub": "supporting tagline that reinforces trust and expertise",
  "aboutHeadline": "About [Business Name]",
  "aboutText": "2-3 compelling paragraphs about the business, incorporating their description, years of experience, and what makes them unique",
  "ctaHeadline": "compelling call-to-action headline",
  "ctaText": "persuasive 1-2 sentence CTA text",
  "services": [
    {
      "name": "service name from their list",
      "description": "2-3 sentences explaining this service and its benefits"
    }
  ],
  "faqs": [
    {
      "question": "common customer question",
      "answer": "detailed helpful answer"
    }
  ],
  "seoTitle": "SEO-optimized title under 60 chars",
  "seoDescription": "compelling meta description under 160 chars"
}`
        }]
      })
    });

    const data = await response.json();
    const content = data.content[0].text;
    
    // Parse JSON response
    let jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON found in response');
    }
    
    const parsed = JSON.parse(jsonMatch[0]);
    res.json(parsed);

  } catch (err) {
    console.error('AI generation error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ─── Deploy to Netlify ────────────────────────────────────────────────────────
app.post('/api/deploy/:submissionId', async (req, res) => {
  const { submissionId } = req.params;
  const { html, siteName } = req.body;

  try {
    // Create ZIP with index.html
    const zip = new JSZip();
    zip.file('index.html', html);
    const zipBuffer = await zip.generateAsync({ type: 'nodebuffer' });

    // Deploy to Netlify
    const deployRes = await fetch('https://api.netlify.com/api/v1/sites', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.NETLIFY_TOKEN}`,
        'Content-Type': 'application/zip',
      },
      body: zipBuffer,
    });

    if (!deployRes.ok) {
      throw new Error('Netlify deployment failed');
    }

    const deployData = await deployRes.json();
    const siteUrl = deployData.ssl_url || deployData.url;

    // Update database with deployment URL
    await pool.query(
      'UPDATE submissions SET site_url = $1, deployed_at = NOW() WHERE id = $2',
      [siteUrl, submissionId]
    );

    res.json({ url: siteUrl });
  } catch (err) {
    console.error('Deploy error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ─── Serve Static Files ───────────────────────────────────────────────────────
app.use(express.static(join(__dirname, '../dist')));
app.get('*', (req, res) => {
  res.sendFile(join(__dirname, '../dist/index.html'));
});

// ─── Start Server ─────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`✓ Server running on port ${PORT}`);
});
