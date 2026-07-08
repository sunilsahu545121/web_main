-- Orders table (assuming it exists, but making sure schema is as required or extending it)
-- Since orders table already exists in our previous migrations, we'll just ensure the new enums or columns are covered.
-- The prompt's schema includes 'expected_delivery' which might be new.
ALTER TABLE orders ADD COLUMN IF NOT EXISTS expected_delivery TIMESTAMPTZ;

-- Return requests
CREATE TABLE IF NOT EXISTS return_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES orders(id),
  customer_id UUID REFERENCES profiles(id),
  vendor_id UUID REFERENCES profiles(id), -- Changed from vendors(id) to profiles(id) as vendors are stored in profiles table in this app.
  product_name TEXT,
  quantity INT,
  amount NUMERIC,
  reason TEXT,
  description TEXT,
  status TEXT CHECK (status IN ('pending', 'approved', 'rejected', 'refunded')),
  images TEXT[],
  refund_amount NUMERIC,
  refund_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Conversations for support chat
CREATE TABLE IF NOT EXISTS conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID REFERENCES profiles(id),
  status TEXT DEFAULT 'open',
  last_message_at TIMESTAMPTZ DEFAULT NOW()
);

-- Chat messages
CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID REFERENCES conversations(id),
  sender_id UUID,
  sender_type TEXT CHECK (sender_type IN ('customer', 'support', 'vendor')),
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Support tickets
CREATE TABLE IF NOT EXISTS support_tickets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ticket_number TEXT UNIQUE NOT NULL,
  customer_id UUID REFERENCES profiles(id),
  subject TEXT,
  description TEXT,
  category TEXT,
  priority TEXT CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  status TEXT CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
  assigned_to UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies (Enable realtime for chat)
-- Only superadmins/support can read/write all chats.
-- Customers can read/write their own chats.

ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE return_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    -- RLS for conversations
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view their own conversations') THEN
        CREATE POLICY "Users can view their own conversations" ON conversations
            FOR SELECT USING (auth.uid() = customer_id OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'superadmin'));
    END IF;

    -- RLS for chat_messages
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can read messages in their conversations') THEN
        CREATE POLICY "Users can read messages in their conversations" ON chat_messages
            FOR SELECT USING (
                EXISTS (SELECT 1 FROM conversations WHERE id = chat_messages.conversation_id AND customer_id = auth.uid()) OR
                EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'superadmin')
            );
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can insert messages in their conversations') THEN
        CREATE POLICY "Users can insert messages in their conversations" ON chat_messages
            FOR INSERT WITH CHECK (
                EXISTS (SELECT 1 FROM conversations WHERE id = chat_messages.conversation_id AND customer_id = auth.uid()) OR
                EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'superadmin')
            );
    END IF;
END $$;

-- Enable realtime for chat_messages and conversations if not already enabled
BEGIN;
  DROP PUBLICATION IF EXISTS supabase_realtime CASCADE;
  CREATE PUBLICATION supabase_realtime FOR ALL TABLES;
COMMIT;
