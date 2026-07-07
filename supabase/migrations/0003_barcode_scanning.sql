-- ============================================================
-- Barcode & Inventory Scanning Schema
-- ============================================================

-- Enhanced products table (add columns if not present)
ALTER TABLE products
  ADD COLUMN IF NOT EXISTS barcode_format text DEFAULT 'CODE128',
  ADD COLUMN IF NOT EXISTS barcode_value text UNIQUE,
  ADD COLUMN IF NOT EXISTS hsn_code text,
  ADD COLUMN IF NOT EXISTS country_of_origin text DEFAULT 'India',
  ADD COLUMN IF NOT EXISTS weight text,
  ADD COLUMN IF NOT EXISTS batch_number text,
  ADD COLUMN IF NOT EXISTS expiry_date date,
  ADD COLUMN IF NOT EXISTS manufactured_date date,
  ADD COLUMN IF NOT EXISTS label_config jsonb DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS stock_location text,
  ADD COLUMN IF NOT EXISTS bin_location text;

CREATE INDEX IF NOT EXISTS idx_products_barcode ON products(barcode_value);
CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku);
CREATE INDEX IF NOT EXISTS idx_products_expiry ON products(expiry_date);

-- Inventory locations (for multi-warehouse scanning)
CREATE TABLE IF NOT EXISTS inventory_locations(
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    hub_id uuid REFERENCES hubs(id) ON DELETE CASCADE,
    name text NOT NULL,
    type text NOT NULL CHECK(type IN('warehouse', 'shelf', 'bin', 'cold_storage', 'quarantine')),
    capacity integer,
    metadata jsonb DEFAULT '{}'::jsonb,
    created_at timestamptz DEFAULT now()
);

-- Stock movements (audit trail for every scan)
CREATE TABLE IF NOT EXISTS stock_movements(
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id uuid REFERENCES products(id) ON DELETE CASCADE,
    movement_type text NOT NULL CHECK(movement_type IN('receive', 'putaway', 'pick', 'pack', 'ship', 'return', 'adjust', 'transfer')),
    from_location_id uuid REFERENCES inventory_locations(id),
    to_location_id uuid REFERENCES inventory_locations(id),
    quantity integer NOT NULL,
    reference_type text,
    reference_id text,
    scanned_by uuid REFERENCES profiles(id),
    barcode_scanned text NOT NULL,
    scan_method text CHECK(scan_method IN('camera', 'usb_hid', 'bluetooth', 'mobile_app', 'manual')),
    metadata jsonb DEFAULT '{}'::jsonb,
    created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_stock_movements_product ON stock_movements(product_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_stock_movements_scanner ON stock_movements(scanned_by);
CREATE INDEX IF NOT EXISTS idx_stock_movements_reference ON stock_movements(reference_type, reference_id);

-- Print queue (for batch label printing)
CREATE TABLE IF NOT EXISTS print_jobs(
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    seller_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
    product_ids uuid[] NOT NULL,
    design_config jsonb NOT NULL,
    copies_per_product integer DEFAULT 1,
    status text DEFAULT 'pending' CHECK(status IN('pending', 'printing', 'completed', 'failed')),
    printed_count integer DEFAULT 0,
    error_message text,
    created_at timestamptz DEFAULT now(),
    completed_at timestamptz
);

-- RLS Policies
ALTER TABLE inventory_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE print_jobs ENABLE ROW LEVEL SECURITY;

-- Inventory locations: sellers see their hub; admins see all
CREATE POLICY "locations_select_privileged_or_hub" ON inventory_locations
  FOR SELECT TO authenticated
USING(is_privileged() OR hub_id IN(SELECT hub_id FROM field_agents WHERE user_id = auth.uid()));

-- Stock movements: insert via Edge Function (scan-logger), select for own products
CREATE POLICY "movements_select_relevant" ON stock_movements
  FOR SELECT TO authenticated
USING(
    is_privileged()
    OR EXISTS(SELECT 1 FROM products p WHERE p.id = stock_movements.product_id AND p.seller_id = auth.uid())
    OR scanned_by = auth.uid()
);

-- Print jobs: own jobs only
CREATE POLICY "print_jobs_select_own" ON print_jobs
  FOR SELECT TO authenticated USING(seller_id = auth.uid() OR is_privileged());

CREATE OR REPLACE FUNCTION public.adjust_product_stock(
    p_product_id uuid,
    p_delta integer
)
RETURNS void
    LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE products
  SET stock_quantity = GREATEST(0, stock_quantity + p_delta),
    updated_at = now()
  WHERE id = p_product_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Product % not found', p_product_id;
  END IF;
END;
$$;
