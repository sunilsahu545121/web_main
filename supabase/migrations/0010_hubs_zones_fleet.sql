-- Add missing columns to delivery_partners if they don't exist
DO $$ 
BEGIN
  ALTER TABLE delivery_partners ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);
  ALTER TABLE delivery_partners ADD COLUMN IF NOT EXISTS full_name TEXT;
  ALTER TABLE delivery_partners ADD COLUMN IF NOT EXISTS phone TEXT;
  ALTER TABLE delivery_partners ADD COLUMN IF NOT EXISTS email TEXT;
  ALTER TABLE delivery_partners ADD COLUMN IF NOT EXISTS avatar_url TEXT;
  ALTER TABLE delivery_partners ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'offline';
  ALTER TABLE delivery_partners ADD COLUMN IF NOT EXISTS is_approved BOOLEAN DEFAULT false;
  ALTER TABLE delivery_partners ADD COLUMN IF NOT EXISTS is_rejected BOOLEAN DEFAULT false;
  ALTER TABLE delivery_partners ADD COLUMN IF NOT EXISTS earnings DECIMAL(10,2) DEFAULT 0;
  ALTER TABLE delivery_partners ADD COLUMN IF NOT EXISTS current_lat DECIMAL(10,6);
  ALTER TABLE delivery_partners ADD COLUMN IF NOT EXISTS current_lng DECIMAL(10,6);
  ALTER TABLE delivery_partners ADD COLUMN IF NOT EXISTS hub_id UUID;
  ALTER TABLE delivery_partners ADD COLUMN IF NOT EXISTS approved_at TIMESTAMPTZ;
  ALTER TABLE delivery_partners ADD COLUMN IF NOT EXISTS rejected_at TIMESTAMPTZ;
  ALTER TABLE delivery_partners ADD COLUMN IF NOT EXISTS last_active_at TIMESTAMPTZ DEFAULT NOW();
  ALTER TABLE delivery_partners ADD COLUMN IF NOT EXISTS license_number TEXT;
EXCEPTION WHEN OTHERS THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS delivery_hubs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  code TEXT UNIQUE NOT NULL,
  address TEXT,
  city TEXT,
  state TEXT,
  pincode TEXT,
  lat DECIMAL(10,6),
  lng DECIMAL(10,6),
  manager_name TEXT,
  manager_phone TEXT,
  capacity_orders_per_day INT DEFAULT 500,
  total_riders INT DEFAULT 0,
  active_riders INT DEFAULT 0,
  serviceable_zones TEXT[],
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'delivery_partners_hub_id_fkey'
  ) THEN
    ALTER TABLE delivery_partners ADD CONSTRAINT delivery_partners_hub_id_fkey FOREIGN KEY (hub_id) REFERENCES delivery_hubs(id);
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS hub_performance (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  hub_id UUID REFERENCES delivery_hubs(id),
  date DATE DEFAULT CURRENT_DATE,
  orders_today INT DEFAULT 0,
  avg_delivery_time INT DEFAULT 0,
  success_rate DECIMAL(5,2) DEFAULT 0,
  revenue_today DECIMAL(10,2) DEFAULT 0
);

CREATE TABLE IF NOT EXISTS franchisees (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  full_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  hub_id UUID REFERENCES delivery_hubs(id),
  investment_amount DECIMAL(10,2),
  commission_rate DECIMAL(5,2),
  total_earnings DECIMAL(10,2) DEFAULT 0,
  status TEXT DEFAULT 'pending' CHECK (status IN ('active', 'pending', 'inactive')),
  joined_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS zones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  code TEXT UNIQUE NOT NULL,
  city TEXT,
  polygon JSONB NOT NULL,
  delivery_fee DECIMAL(10,2) DEFAULT 0,
  min_order_amount DECIMAL(10,2) DEFAULT 0,
  estimated_time_min INT DEFAULT 30,
  is_active BOOLEAN DEFAULT true,
  hub_id UUID REFERENCES delivery_hubs(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE delivery_partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE delivery_hubs ENABLE ROW LEVEL SECURITY;
ALTER TABLE zones ENABLE ROW LEVEL SECURITY;
ALTER TABLE franchisees ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
  -- We wrap in exceptions just in case the policy already exists to avoid errors.
  BEGIN
    CREATE POLICY "Public Access for delivery_partners" ON delivery_partners FOR ALL USING (true);
  EXCEPTION WHEN OTHERS THEN NULL; END;
  BEGIN
    CREATE POLICY "Public Access for delivery_hubs" ON delivery_hubs FOR ALL USING (true);
  EXCEPTION WHEN OTHERS THEN NULL; END;
  BEGIN
    CREATE POLICY "Public Access for zones" ON zones FOR ALL USING (true);
  EXCEPTION WHEN OTHERS THEN NULL; END;
  BEGIN
    CREATE POLICY "Public Access for franchisees" ON franchisees FOR ALL USING (true);
  EXCEPTION WHEN OTHERS THEN NULL; END;
  BEGIN
    CREATE POLICY "Public Access for hub_performance" ON hub_performance FOR ALL USING (true);
  EXCEPTION WHEN OTHERS THEN NULL; END;
END $$;

CREATE INDEX IF NOT EXISTS idx_riders_status ON delivery_partners(status) WHERE is_approved = true;
CREATE INDEX IF NOT EXISTS idx_riders_hub ON delivery_partners(hub_id);
CREATE INDEX IF NOT EXISTS idx_zones_city ON zones(city);
CREATE INDEX IF NOT EXISTS idx_zones_active ON zones(is_active) WHERE is_active = true;
