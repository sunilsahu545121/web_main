-- ============================================================
-- Krixify RLS Hardening: Replaces client-side service_role usage
-- ============================================================

-- Enable RLS on every privileged table
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE zones ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE seller_kyc ENABLE ROW LEVEL SECURITY;
ALTER TABLE returns ENABLE ROW LEVEL SECURITY;
ALTER TABLE refunds ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE hubs ENABLE ROW LEVEL SECURITY;
ALTER TABLE delivery_centers ENABLE ROW LEVEL SECURITY;
ALTER TABLE franchises ENABLE ROW LEVEL SECURITY;
ALTER TABLE field_agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE geocoded_pincodes ENABLE ROW LEVEL SECURITY;

-- Helper: is the caller a privileged role?
CREATE OR REPLACE FUNCTION public.is_privileged()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND role IN ('super_admin', 'zone_manager')
  );
$$;

-- PROFILES
CREATE POLICY "profiles_select_own" ON profiles
  FOR SELECT TO authenticated
  USING (id = auth.uid() OR is_privileged());

CREATE POLICY "profiles_update_own" ON profiles
  FOR UPDATE TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- SELLER KYC
CREATE POLICY "kyc_select_owner_or_admin" ON seller_kyc
  FOR SELECT TO authenticated
  USING (seller_id = auth.uid() OR is_privileged());

-- INSERT/UPDATE/DELETE on kyc only via SECURITY DEFINER function (approve_kyc)

-- ORDERS
CREATE POLICY "orders_select_relevant" ON orders
  FOR SELECT TO authenticated
  USING (
    customer_id = auth.uid()
    OR seller_id = auth.uid()
    OR is_privileged()
  );

CREATE POLICY "orders_update_seller_or_admin" ON orders
  FOR UPDATE TO authenticated
  USING (seller_id = auth.uid() OR is_privileged())
  WITH CHECK (seller_id = auth.uid() OR is_privileged());

-- ZONES
CREATE POLICY "zones_select_all" ON zones
  FOR SELECT TO authenticated
  USING (true);
-- INSERT/UPDATE/DELETE on zones only via create-zone Edge Function

-- RETURNS & REFUNDS: only readable by owner, seller, or privileged; modifications via Edge Function
CREATE POLICY "returns_select_relevant" ON returns
  FOR SELECT TO authenticated
  USING (
    customer_id = auth.uid()
    OR EXISTS (SELECT 1 FROM orders o WHERE o.id = returns.order_id AND o.seller_id = auth.uid())
    OR is_privileged()
  );

-- AUDIT LOGS: only super_admin can read; inserts only by service_role (Edge Functions)
CREATE POLICY "audit_select_admin" ON audit_logs
  FOR SELECT TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'super_admin')
  );

-- GEOCODED PINCODES: readable by authenticated, writable only by service_role
CREATE POLICY "geocoded_pincodes_select" ON geocoded_pincodes
  FOR SELECT TO authenticated USING (true);
