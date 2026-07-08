-- Enable PostGIS extension for geo-spatial queries
CREATE EXTENSION IF NOT EXISTS postgis;

-- 1. GIS Core: Add geometry column to zones for ST_Contains queries
ALTER TABLE zones ADD COLUMN IF NOT EXISTS geom geometry(Polygon, 4326);

-- Function to automatically update geom when polygon JSON is updated
CREATE OR REPLACE FUNCTION update_zone_geom()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.polygon IS NOT NULL THEN
    NEW.geom = ST_GeomFromGeoJSON(NEW.polygon::text);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_update_zone_geom ON zones;
CREATE TRIGGER trg_update_zone_geom
BEFORE INSERT OR UPDATE OF polygon ON zones
FOR EACH ROW EXECUTE FUNCTION update_zone_geom();

-- Function to check if a lat/lng is serviceable and return the zone ID and delivery charge
CREATE OR REPLACE FUNCTION check_serviceability(check_lat double precision, check_lng double precision)
RETURNS TABLE (zone_id uuid, name text, delivery_charge numeric, eta_minutes integer) AS $$
BEGIN
  RETURN QUERY
  SELECT z.id, z.name, z.delivery_charge, z.eta_minutes
  FROM zones z
  WHERE ST_Contains(z.geom, ST_SetSRID(ST_Point(check_lng, check_lat), 4326))
  LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- 2. Logistics Core: Delivery Partners Table
CREATE TABLE IF NOT EXISTS delivery_partners (
  id uuid PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  status text DEFAULT 'offline' CHECK (status IN ('offline', 'online', 'busy')),
  current_lat double precision,
  current_lng double precision,
  last_ping_at timestamptz DEFAULT now(),
  vehicle_type text,
  vehicle_number text
);
ALTER TABLE delivery_partners ENABLE ROW LEVEL SECURITY;

-- 3. Catalog Core: Inventory Locking Function (Race Condition Prevention)
CREATE OR REPLACE FUNCTION reserve_inventory(p_product_id uuid, p_quantity integer)
RETURNS boolean AS $$
DECLARE
  v_current_stock integer;
BEGIN
  -- Lock the row for update so no other transaction can read the old value
  SELECT stock INTO v_current_stock 
  FROM products 
  WHERE id = p_product_id 
  FOR UPDATE;

  IF v_current_stock >= p_quantity THEN
    UPDATE products 
    SET stock = stock - p_quantity 
    WHERE id = p_product_id;
    RETURN true;
  ELSE
    RETURN false;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add delivery_otp to orders
ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivery_otp text;
