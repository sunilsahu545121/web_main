-- ============================================================
-- SECURITY DEFINER functions: the ONLY way privileged writes
-- happen on the server, callable from Edge Functions
-- ============================================================

-- KYC Approval
CREATE OR REPLACE FUNCTION public.approve_kyc(
  seller_id uuid,
  approved boolean,
  reason text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  caller_role text;
BEGIN
  -- Caller must be privileged
  SELECT role INTO caller_role FROM profiles WHERE id = auth.uid();
  IF caller_role IS NULL OR caller_role NOT IN ('super_admin', 'zone_manager') THEN
    RAISE EXCEPTION 'Forbidden: insufficient privileges';
  END IF;

  UPDATE seller_kyc
  SET status = CASE WHEN approved THEN 'approved' ELSE 'rejected' END,
      reviewed_at = now(),
      reviewed_by = auth.uid(),
      review_reason = reason
  WHERE seller_kyc.seller_id = approve_kyc.seller_id;

  UPDATE profiles
  SET kyc_status = CASE WHEN approved THEN 'approved' ELSE 'rejected' END
  WHERE id = seller_id;
END;
$$;

-- Refund Processing
CREATE OR REPLACE FUNCTION public.process_refund(
  order_id uuid,
  refund_method text,
  amount numeric,
  reason text,
  actor_id uuid
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  caller_role text;
BEGIN
  SELECT role INTO caller_role FROM profiles WHERE id = auth.uid();
  IF caller_role IS NULL OR caller_role NOT IN ('super_admin', 'zone_manager') THEN
    RAISE EXCEPTION 'Forbidden: insufficient privileges';
  END IF;

  INSERT INTO refunds (order_id, method, amount, reason, status, processed_by, created_at)
  VALUES (order_id, refund_method, amount, reason, 'completed', actor_id, now());

  UPDATE orders
  SET status = CASE WHEN refund_method = 'razorpay_original' THEN 'refunded' ELSE 'returned' END
  WHERE id = order_id;
END;
$$;

-- Parameter Reset
CREATE OR REPLACE FUNCTION public.reset_parameter(
  p_scope text,
  p_target_id uuid,
  p_parameter text,
  p_new_value jsonb,
  p_actor_id uuid
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  caller_role text;
BEGIN
  SELECT role INTO caller_role FROM profiles WHERE id = auth.uid();
  IF caller_role != 'super_admin' THEN
    RAISE EXCEPTION 'Forbidden: super_admin only';
  END IF;

  INSERT INTO audit_logs (actor_id, action, target_id, metadata, created_at)
  VALUES (
    p_actor_id,
    'reset_parameter',
    p_target_id,
    jsonb_build_object('scope', p_scope, 'parameter', p_parameter, 'new_value', p_new_value),
    now()
  );
END;
$$;
