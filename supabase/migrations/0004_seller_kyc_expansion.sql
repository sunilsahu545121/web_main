-- Expand profiles table
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS dob date,
  ADD COLUMN IF NOT EXISTS gender text CHECK (gender IN ('male', 'female', 'other', ''));

-- Create seller_kyc table if it doesn't exist
CREATE TABLE IF NOT EXISTS seller_kyc (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Expand seller_kyc table
ALTER TABLE seller_kyc
  ADD COLUMN IF NOT EXISTS business_type text,
  ADD COLUMN IF NOT EXISTS category text,
  ADD COLUMN IF NOT EXISTS fssai_number text,
  ADD COLUMN IF NOT EXISTS years_in_business text,
  ADD COLUMN IF NOT EXISTS employees text,
  ADD COLUMN IF NOT EXISTS monthly_revenue text,
  ADD COLUMN IF NOT EXISTS description text,
  
  -- Address
  ADD COLUMN IF NOT EXISTS address_line1 text,
  ADD COLUMN IF NOT EXISTS address_line2 text,
  ADD COLUMN IF NOT EXISTS landmark text,
  ADD COLUMN IF NOT EXISTS pincode text,
  ADD COLUMN IF NOT EXISTS city text,
  ADD COLUMN IF NOT EXISTS state text,
  ADD COLUMN IF NOT EXISTS latitude numeric,
  ADD COLUMN IF NOT EXISTS longitude numeric,
  
  -- Bank details
  ADD COLUMN IF NOT EXISTS account_holder text,
  ADD COLUMN IF NOT EXISTS branch text,
  ADD COLUMN IF NOT EXISTS account_type text,
  
  -- KYC Documents
  ADD COLUMN IF NOT EXISTS aadhar_front_url text,
  ADD COLUMN IF NOT EXISTS aadhar_back_url text,
  ADD COLUMN IF NOT EXISTS storefront_photo_url text,
  ADD COLUMN IF NOT EXISTS owner_photo_url text,
  
  -- Subscription
  ADD COLUMN IF NOT EXISTS plan_selected text,
  ADD COLUMN IF NOT EXISTS payment_method text;

-- Enable RLS
ALTER TABLE seller_kyc ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Sellers can view own kyc" ON seller_kyc
  FOR SELECT USING (seller_id = auth.uid());

CREATE POLICY "Sellers can insert own kyc" ON seller_kyc
  FOR INSERT WITH CHECK (seller_id = auth.uid());

CREATE POLICY "Sellers can update own kyc" ON seller_kyc
  FOR UPDATE USING (seller_id = auth.uid());
