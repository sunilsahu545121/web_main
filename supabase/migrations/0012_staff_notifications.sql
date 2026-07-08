-- Roles table
CREATE TABLE IF NOT EXISTS roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  permissions TEXT[] DEFAULT '{}',
  is_system BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Staff Members table
CREATE TABLE IF NOT EXISTS staff_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  full_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT,
  role_id UUID REFERENCES roles(id),
  status TEXT DEFAULT 'invited' CHECK (status IN ('active', 'invited', 'suspended')),
  invite_token TEXT,
  invited_at TIMESTAMPTZ,
  last_login_at TIMESTAMPTZ,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type TEXT NOT NULL CHECK (type IN ('push', 'email')),
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  audience TEXT NOT NULL CHECK (audience IN ('all_users', 'all_vendors', 'all_riders', 'active_customers', 'inactive_users', 'custom_segment')),
  audience_count INT DEFAULT 0,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'sent', 'failed')),
  sent_count INT DEFAULT 0,
  open_count INT DEFAULT 0,
  click_count INT DEFAULT 0,
  scheduled_at TIMESTAMPTZ,
  sent_at TIMESTAMPTZ,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Set up RLS
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
  -- We wrap in exceptions just in case the policy already exists to avoid errors.
  BEGIN
    CREATE POLICY "Public Access for roles" ON roles FOR ALL USING (true);
  EXCEPTION WHEN OTHERS THEN NULL; END;
  BEGIN
    CREATE POLICY "Public Access for staff_members" ON staff_members FOR ALL USING (true);
  EXCEPTION WHEN OTHERS THEN NULL; END;
  BEGIN
    CREATE POLICY "Public Access for notifications" ON notifications FOR ALL USING (true);
  EXCEPTION WHEN OTHERS THEN NULL; END;
END $$;
