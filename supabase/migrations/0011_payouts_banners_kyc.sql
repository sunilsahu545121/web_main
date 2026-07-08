-- Payouts table
CREATE TABLE IF NOT EXISTS payouts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  recipient_id UUID NOT NULL,
  recipient_type TEXT CHECK (recipient_type IN ('vendor', 'rider', 'franchisee')),
  gross_amount DECIMAL(12,2) NOT NULL,
  platform_commission DECIMAL(12,2) DEFAULT 0,
  tds_amount DECIMAL(12,2) DEFAULT 0,
  net_amount DECIMAL(12,2) NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  reference_id TEXT,
  orders_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- Wallet Transactions
CREATE TABLE IF NOT EXISTS wallet_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  type TEXT CHECK (type IN ('credit', 'debit')),
  description TEXT,
  reference_id UUID,
  reference_type TEXT,
  balance_after DECIMAL(12,2),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Banners
CREATE TABLE IF NOT EXISTS banners (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  image_url TEXT NOT NULL,
  link_url TEXT,
  position TEXT CHECK (position IN ('home_top', 'home_middle', 'category', 'checkout')),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'scheduled', 'expired', 'draft')),
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  clicks INT DEFAULT 0,
  impressions INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Promotions
CREATE TABLE IF NOT EXISTS promotions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT UNIQUE NOT NULL,
  description TEXT,
  discount_type TEXT CHECK (discount_type IN ('percentage', 'flat')),
  discount_value DECIMAL(10,2) NOT NULL,
  min_order_amount DECIMAL(10,2) DEFAULT 0,
  max_discount_amount DECIMAL(10,2),
  usage_limit INT DEFAULT 0,
  usage_count INT DEFAULT 0,
  valid_from TIMESTAMPTZ DEFAULT NOW(),
  valid_until TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seller KYC
CREATE TABLE IF NOT EXISTS seller_kyc (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  seller_id UUID NOT NULL,
  business_name TEXT NOT NULL,
  owner_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  pan_number TEXT,
  aadhaar_number TEXT,
  gst_number TEXT,
  business_address TEXT,
  city TEXT,
  state TEXT,
  pincode TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ,
  reviewer_notes TEXT
);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'seller_kyc_seller_id_key'
  ) THEN
    ALTER TABLE seller_kyc ADD CONSTRAINT seller_kyc_seller_id_key UNIQUE (seller_id);
  END IF;
END $$;

-- KYC Documents
CREATE TABLE IF NOT EXISTS kyc_documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  seller_id UUID REFERENCES seller_kyc(seller_id),
  aadhaar_front_url TEXT,
  aadhaar_back_url TEXT,
  pan_card_url TEXT,
  gst_certificate_url TEXT,
  bank_statement_url TEXT,
  uploaded_at TIMESTAMPTZ DEFAULT NOW()
);

-- Set up RLS for all new tables
ALTER TABLE payouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE wallet_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE banners ENABLE ROW LEVEL SECURITY;
ALTER TABLE promotions ENABLE ROW LEVEL SECURITY;
ALTER TABLE seller_kyc ENABLE ROW LEVEL SECURITY;
ALTER TABLE kyc_documents ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
  -- We wrap in exceptions just in case the policy already exists to avoid errors.
  BEGIN
    CREATE POLICY "Public Access for payouts" ON payouts FOR ALL USING (true);
  EXCEPTION WHEN OTHERS THEN NULL; END;
  BEGIN
    CREATE POLICY "Public Access for wallet_transactions" ON wallet_transactions FOR ALL USING (true);
  EXCEPTION WHEN OTHERS THEN NULL; END;
  BEGIN
    CREATE POLICY "Public Access for banners" ON banners FOR ALL USING (true);
  EXCEPTION WHEN OTHERS THEN NULL; END;
  BEGIN
    CREATE POLICY "Public Access for promotions" ON promotions FOR ALL USING (true);
  EXCEPTION WHEN OTHERS THEN NULL; END;
  BEGIN
    CREATE POLICY "Public Access for seller_kyc" ON seller_kyc FOR ALL USING (true);
  EXCEPTION WHEN OTHERS THEN NULL; END;
  BEGIN
    CREATE POLICY "Public Access for kyc_documents" ON kyc_documents FOR ALL USING (true);
  EXCEPTION WHEN OTHERS THEN NULL; END;
END $$;
