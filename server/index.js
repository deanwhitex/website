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

// ─── Initialize Database ──────────────────────────────────────────────────────
app.get('/api/setup-database', async (req, res) => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS submissions (
        id SERIAL PRIMARY KEY,
        business_name VARCHAR(255) NOT NULL,
        business_type VARCHAR(100) NOT NULL,
        email VARCHAR(255) NOT NULL,
        phone VARCHAR(50) NOT NULL,
        city VARCHAR(100) NOT NULL,
        state VARCHAR(50) NOT NULL,
        zip VARCHAR(20),
        address TEXT,
        description TEXT,
        tagline TEXT,
        services JSONB NOT NULL,
        service_areas TEXT,
        logo_url TEXT,
        primary_color VARCHAR(7),
        secondary_color VARCHAR(7),
        hero_image_url TEXT,
        photos JSONB,
        years_experience INTEGER,
        emergency BOOLEAN DEFAULT false,
        financing BOOLEAN DEFAULT false,
        warranty TEXT,
        certifications JSONB,
        payment_status VARCHAR(50) DEFAULT 'pending',
        stripe_session_id VARCHAR(255),
        stripe_payment_intent_id VARCHAR(255),
        amount_paid INTEGER DEFAULT 0,
        paid_at TIMESTAMP,
        generated_html TEXT,
        generated_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      
      CREATE INDEX IF NOT EXISTS idx_stripe_session ON submissions(stripe_session_id);
      CREATE INDEX IF NOT EXISTS idx_email ON submissions(email);
      CREATE INDEX IF NOT EXISTS idx_payment_status ON submissions(payment_status);
      CREATE INDEX IF NOT EXISTS idx_created_at ON submissions(created_at DESC);
    `);
    
    res.json({ success: true, message: 'Database tables created successfully!' });
  } catch (err) {
    console.error('Database setup error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ─── Save Submission ──────────────────────────────────────────────────────────
app.post('/api/submissions', async (req, res) => {
  const { business, services, brand } = req.body;

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
        business.description, business.tagline, JSON.stringify(services),
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
          unit_amount: 9700,
        },
        quantity: 1,
      }],
      mode: 'payment',
      metadata: { submission_id: submissionId.toString() },
      success_url: `${req.headers.origin || 'http://localhost:3000'}/?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.origin || 'http://localhost:3000'}/?canceled=true`,
    });

    await pool.query('UPDATE submissions SET stripe_session_id = $1 WHERE id = $2', [session.id, submissionId]);

    res.json({ url: session.url });
  } catch (err) {
    console.error('Checkout session error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ─── Verify Payment & Get Data (STRICT - ONLY PAID) ──────────────────────────
app.get('/api/verify-payment/:sessionId', async (req, res) => {
  try {
    const session = await stripe.checkout.sessions.retrieve(req.params.sessionId);
    
    if (session.payment_status !== 'paid') {
      return res.json({ paid: false, error: 'Payment not completed' });
    }

    const submissionId = session.metadata.submission_id;
    const result = await pool.query('SELECT * FROM submissions WHERE id = $1', [submissionId]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Submission not found' });
    }

    const sub = result.rows[0];

    // Mark as paid if not already
    if (sub.payment_status !== 'paid') {
      await pool.query(
        `UPDATE submissions 
         SET payment_status = 'paid', 
             stripe_payment_intent_id = $1,
             amount_paid = $2,
             paid_at = CURRENT_TIMESTAMP
         WHERE id = $3`,
        [session.payment_intent, session.amount_total, submissionId]
      );
    }

    // Return data for generation
    res.json({ 
      paid: true,
      submissionId: submissionId,
      businessName: sub.business_name,
      data: {
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
          serviceAreas: sub.service_areas,
          years: sub.years_experience,
          emergency: sub.emergency,
          financing: sub.financing,
          warranty: sub.warranty,
          certs: sub.certifications
        },
        services: sub.services,
        brand: {
          logo: sub.logo_url,
          primary: sub.primary_color,
          secondary: sub.secondary_color,
          hero: sub.hero_image_url,
          photos: sub.photos
        }
      }
    });
  } catch (err) {
    console.error('Payment verification error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ─── Claude API Proxy (WITH PAYMENT CHECK) ────────────────────────────────────
app.post('/api/claude/:submissionId', async (req, res) => {
  const { submissionId } = req.params;
  const apiKey = process.env.ANTHROPIC_API_KEY;
  
  if (!apiKey) {
    return res.status(500).json({ error: { message: 'ANTHROPIC_API_KEY not configured' } });
  }

  // STRICT: Verify payment before allowing AI generation
  try {
    const check = await pool.query('SELECT payment_status FROM submissions WHERE id = $1', [submissionId]);
    if (check.rows.length === 0 || check.rows[0].payment_status !== 'paid') {
      return res.status(403).json({ error: { message: 'Payment required to generate website' } });
    }
  } catch (err) {
    return res.status(500).json({ error: { message: 'Database error' } });
  }

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify(req.body),
    });

    const data = await response.json();
    res.status(response.status).json(data);
  } catch (err) {
    console.error('Claude API error:', err);
    res.status(500).json({ error: { message: err.message } });
  }
});

// ─── Deploy to Netlify ────────────────────────────────────────────────────────
app.post('/api/deploy/:submissionId', async (req, res) => {
  const { submissionId } = req.params;
  const { html, siteName } = req.body;
  const netlifyToken = process.env.NETLIFY_TOKEN;

  if (!netlifyToken) {
    return res.status(500).json({ error: 'NETLIFY_TOKEN not configured' });
  }

  // Verify payment
  try {
    const check = await pool.query('SELECT payment_status FROM submissions WHERE id = $1', [submissionId]);
    if (check.rows.length === 0 || check.rows[0].payment_status !== 'paid') {
      return res.status(403).json({ error: 'Payment required' });
    }
  } catch (err) {
    return res.status(500).json({ error: 'Database error' });
  }

  try {
    // Create site
    const siteResponse = await fetch('https://api.netlify.com/api/v1/sites', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${netlifyToken}`,
      },
      body: JSON.stringify({
        name: siteName.toLowerCase().replace(/[^a-z0-9-]/g, '-'),
      }),
    });

    if (!siteResponse.ok) {
      const error = await siteResponse.text();
      throw new Error(`Site creation failed: ${error}`);
    }

    const site = await siteResponse.json();
    const siteId = site.id;

    // Create zip
    const zip = new JSZip();
    zip.file('index.html', html);
    const zipBlob = await zip.generateAsync({ type: 'nodebuffer' });

    // Deploy
    const deployResponse = await fetch(`https://api.netlify.com/api/v1/sites/${siteId}/deploys`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/zip',
        'Authorization': `Bearer ${netlifyToken}`,
      },
      body: zipBlob,
    });

    if (!deployResponse.ok) {
      const error = await deployResponse.text();
      throw new Error(`Deploy failed: ${error}`);
    }

    const deploy = await deployResponse.json();

    res.json({
      url: site.ssl_url || site.url,
      adminUrl: site.admin_url,
      deployId: deploy.id,
    });
  } catch (err) {
    console.error('Netlify deploy error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ─── Save Generated HTML ──────────────────────────────────────────────────────
app.post('/api/save-website/:submissionId', async (req, res) => {
  const { submissionId } = req.params;
  const { html, netlifyUrl } = req.body;

  try {
    await pool.query(
      `UPDATE submissions 
       SET generated_html = $1, generated_at = CURRENT_TIMESTAMP 
       WHERE id = $2 AND payment_status = 'paid'`,
      [html, submissionId]
    );

    res.json({ success: true });
  } catch (err) {
    console.error('Save website error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ─── Static Files & SPA Fallback ──────────────────────────────────────────────
app.use(express.static(join(__dirname, '../dist')));
app.get('*', (req, res) => {
  res.sendFile(join(__dirname, '../dist/index.html'));
});

app.listen(PORT, async () => {
  console.log(`✓ Server running on port ${PORT}`);
  try {
    await pool.query('SELECT NOW()');
    console.log('✓ Database connected');
  } catch (err) {
    console.error('✗ Database connection failed:', err.message);
  }
});
