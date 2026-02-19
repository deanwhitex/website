// Marketing-grade AI prompts for professional website copy

export function buildMarketingPrompt({ business, services }) {
  const serviceList = services.map(s => s.name).join(', ');
  
  const serviceDescriptions = services.map(s => `"${s.name}": "2-3 sentences about this specific service, focusing on BENEFITS and RESULTS for the homeowner"`).join(',\n    ');
  
  return `You are a world-class marketing copywriter specializing in home services. Write compelling website copy for this business:

BUSINESS: ${business.name}
TYPE: ${business.type}
LOCATION: ${business.city}, ${business.state}
SERVICES: ${serviceList}
DESCRIPTION: ${business.description || 'Professional ' + business.type.toLowerCase() + ' services'}
${business.years ? `EXPERIENCE: ${business.years} years` : ''}
${business.tagline ? `TAGLINE: ${business.tagline}` : ''}

CRITICAL INSTRUCTIONS:
1. You MUST respond with ONLY valid JSON
2. Do NOT include any markdown formatting
3. Do NOT include code blocks or backticks
4. Start your response with { and end with }
5. Nothing else before or after the JSON

Return this EXACT JSON structure:
{
  "headline": "Compelling 5-8 word headline that creates urgency",
  "subheadline": "One powerful sentence about results/benefits",
  "aboutText": "2-3 paragraphs about the company, expertise, and why customers choose them. Focus on trust, experience, and customer satisfaction.",
  "serviceDescriptions": {
    ${serviceDescriptions}
  },
  "faq": [
    {
      "question": "What areas do you serve?",
      "answer": "Relevant answer mentioning ${business.city}, ${business.state} and surrounding areas"
    },
    {
      "question": "Do you offer free estimates?",
      "answer": "Professional answer about estimates and quotes"
    },
    {
      "question": "Are you licensed and insured?",
      "answer": "Assuring answer about licensing and insurance"
    },
    {
      "question": "How long will the project take?",
      "answer": "Honest answer about typical timelines"
    },
    {
      "question": "What makes you different from competitors?",
      "answer": "Strong answer highlighting quality, experience, and customer service"
    }
  ],
  "metaDescription": "SEO meta description under 160 characters with location and main service"
}

CONTENT GUIDELINES:
- Make it sound PROFESSIONAL, not generic
- Use action verbs and power words
- Include the city/state naturally in answers
- NO cliches like "your trusted partner" or "we pride ourselves"
- Write like a human, not an AI
- Focus on OUTCOMES and BENEFITS
- FAQ answers should be 2-3 sentences each, informative and reassuring

RESPOND WITH ONLY THE JSON OBJECT - NO OTHER TEXT.`;
}

export function parseAIResponse(text) {
  let clean = text.trim();
  if (clean.startsWith('```json')) {
    clean = clean.replace(/^```json\n/, '').replace(/\n```$/, '');
  } else if (clean.startsWith('```')) {
    clean = clean.replace(/^```\n/, '').replace(/\n```$/, '');
  }
  
  const jsonMatch = clean.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    clean = jsonMatch[0];
  }
  
  try {
    return JSON.parse(clean);
  } catch (err) {
    console.error('JSON parse error:', err);
    console.error('Raw text:', text);
    throw new Error('Failed to parse AI response as JSON. The AI returned text instead of JSON format.');
  }
}
