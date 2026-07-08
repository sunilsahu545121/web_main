-- Alter staff_members to add user_id
ALTER TABLE staff_members
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);

-- System Settings
CREATE TABLE IF NOT EXISTS system_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category TEXT UNIQUE NOT NULL,
  -- General
  platform_commission DECIMAL(5,2),
  min_order_value DECIMAL(10,2),
  max_order_value DECIMAL(10,2),
  delivery_base_fee DECIMAL(10,2),
  tax_rate DECIMAL(5,2),
  support_email TEXT,
  support_phone TEXT,
  customer_care_whatsapp TEXT,
  maintenance_mode BOOLEAN DEFAULT false,
  -- Payment
  razorpay_key_id TEXT,
  razorpay_key_secret TEXT,
  stripe_publishable_key TEXT,
  stripe_secret_key TEXT,
  enable_cod BOOLEAN DEFAULT true,
  enable_online BOOLEAN DEFAULT true,
  enable_wallet BOOLEAN DEFAULT true,
  cod_max_amount DECIMAL(10,2),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- API Keys
CREATE TABLE IF NOT EXISTS api_keys (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  key_hash TEXT NOT NULL,
  key_prefix TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  last_used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  revoked_at TIMESTAMPTZ
);

-- App Versions
CREATE TABLE IF NOT EXISTS app_versions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  platform TEXT CHECK (platform IN ('ios', 'android', 'web')),
  version TEXT NOT NULL,
  build_number INT NOT NULL,
  is_force_update BOOLEAN DEFAULT false,
  update_message TEXT,
  release_notes TEXT,
  released_at TIMESTAMPTZ DEFAULT NOW(),
  is_active BOOLEAN DEFAULT false
);

-- Set up RLS
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_versions ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
  BEGIN
    CREATE POLICY "Public Access for system_settings" ON system_settings FOR ALL USING (true);
  EXCEPTION WHEN OTHERS THEN NULL; END;
  BEGIN
    CREATE POLICY "Public Access for api_keys" ON api_keys FOR ALL USING (true);
  EXCEPTION WHEN OTHERS THEN NULL; END;
  BEGIN
    CREATE POLICY "Public Access for app_versions" ON app_versions FOR ALL USING (true);
  EXCEPTION WHEN OTHERS THEN NULL; END;
END $$;
