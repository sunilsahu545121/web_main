import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

interface ScanLogBody {
  product_id: string;
  movement_type: 'receive' | 'putaway' | 'pick' | 'pack' | 'ship' | 'return' | 'adjust' | 'transfer';
  from_location_id?: string;
  to_location_id?: string;
  quantity: number;
  reference_type?: string;
  reference_id?: string;
  barcode_scanned: string;
  scan_method: 'camera' | 'usb_hid' | 'bluetooth' | 'mobile_app' | 'manual';
  metadata?: Record<string, unknown>;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  try {
    const authHeader = req.headers.get('Authorization')!;
    const userClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    );
    const { data: { user } } = await userClient.auth.getUser();
    if (!user) throw new Error('Unauthenticated');

    const adminClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const body: ScanLogBody = await req.json();

    // Verify the product exists and the user has access
    const { data: product, error: productError } = await adminClient
      .from('products')
      .select('id, seller_id, stock_quantity, name')
      .eq('id', body.product_id)
      .single();
    if (productError || !product) throw new Error('Product not found');

    // Log the movement
    const { data: movement, error: movementError } = await adminClient
      .from('stock_movements')
      .insert({
        product_id: body.product_id,
        movement_type: body.movement_type,
        from_location_id: body.from_location_id,
        to_location_id: body.to_location_id,
        quantity: body.quantity,
        reference_type: body.reference_type,
        reference_id: body.reference_id,
        scanned_by: user.id,
        barcode_scanned: body.barcode_scanned,
        scan_method: body.scan_method,
        metadata: body.metadata ?? {},
      })
      .select()
      .single();
    if (movementError) throw movementError;

    // Update stock atomically
    const stockDelta = ['receive', 'putaway', 'return'].includes(body.movement_type) ? body.quantity
      : ['pick', 'pack', 'ship'].includes(body.movement_type) ? -body.quantity : 0;

    if (stockDelta !== 0) {
      const { error: stockError } = await adminClient.rpc('adjust_product_stock', {
        p_product_id: body.product_id,
        p_delta: stockDelta,
      });
      if (stockError) throw stockError;
    }

    return new Response(JSON.stringify({ success: true, movement_id: movement.id }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
