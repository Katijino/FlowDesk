-- Leads table
CREATE TABLE IF NOT EXISTS leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  phone text NOT NULL,
  email text,
  description text,
  preferred_time text,
  status text NOT NULL DEFAULT 'new' CHECK (status IN ('new','contacted','scheduled','closed')),
  created_at timestamptz DEFAULT now()
);

-- Add lead_id + customer_name snapshot to invoices
ALTER TABLE invoices
  ADD COLUMN IF NOT EXISTS lead_id uuid REFERENCES leads(id),
  ADD COLUMN IF NOT EXISTS customer_name text,
  ADD COLUMN IF NOT EXISTS customer_phone text;

-- Add booking_slug + email to business_profiles
ALTER TABLE business_profiles
  ADD COLUMN IF NOT EXISTS email text,
  ADD COLUMN IF NOT EXISTS booking_slug text UNIQUE;

-- Backfill booking_slug from existing slug
UPDATE business_profiles SET booking_slug = slug WHERE booking_slug IS NULL;

-- RLS for leads
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "leads_owner" ON leads USING (user_id = auth.uid());
