-- Submissions Table
CREATE TABLE IF NOT EXISTS submissions (
  id SERIAL PRIMARY KEY,
  
  -- Business Info
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
  
  -- Services
  services JSONB NOT NULL,
  service_areas TEXT,
  
  -- Brand
  logo_url TEXT,
  primary_color VARCHAR(7),
  secondary_color VARCHAR(7),
  hero_image_url TEXT,
  photos JSONB,
  
  -- Additional Info
  years_experience INTEGER,
  emergency BOOLEAN DEFAULT false,
  financing BOOLEAN DEFAULT false,
  warranty TEXT,
  certifications JSONB,
  
  -- Payment & Generation
  payment_status VARCHAR(50) DEFAULT 'pending', -- pending, paid, failed
  stripe_session_id VARCHAR(255),
  stripe_payment_intent_id VARCHAR(255),
  amount_paid INTEGER DEFAULT 0,
  paid_at TIMESTAMP,
  
  -- Generated Website
  generated_html TEXT,
  generated_at TIMESTAMP,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index for quick lookups
CREATE INDEX IF NOT EXISTS idx_stripe_session ON submissions(stripe_session_id);
CREATE INDEX IF NOT EXISTS idx_email ON submissions(email);
CREATE INDEX IF NOT EXISTS idx_payment_status ON submissions(payment_status);
CREATE INDEX IF NOT EXISTS idx_created_at ON submissions(created_at DESC);

-- Update timestamp trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_submissions_updated_at BEFORE UPDATE
ON submissions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
