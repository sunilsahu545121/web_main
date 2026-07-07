import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

interface RefundBody {
  order_id: string;
  method: 'wallet' | 'bank_transfer' | 'razorpay_original';
  amount: number;
  reason: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405, headers: corsHeaders });

  try {
    const authHeader = req.headers.get('Authorization')!;
    const userClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user } } = await userClient.auth.getUser();
    if (!user) throw new Error('Unauthenticated');

    const { data: profile } = await userClient.from('profiles').select('role').eq('id', user.id).single();
    if (!profile || !['super_admin', 'zone_manager'].includes(profile.role)) {
      throw new Error('Forbidden');
    }

    const adminClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const body: RefundBody = await req.json();

    // Razorpay integration for original-source refunds
    if (body.method === 'razorpay_original') {
      const razorpayKeyId = Deno.env.get('RAZORPAY_KEY_ID')!;
      const razorpayKeySecret = Deno.env.get('RAZORPAY_KEY_SECRET')!;
      const auth = btoa(`${razorpayKeyId}:${razorpayKeySecret}`);

      const { data: order } = await adminClient
        .from('orders')
        .select('razorpay_payment_id')
        .eq('id', body.order_id)
        .single();

      if (!order?.razorpay_payment_id) throw new Error('No Razorpay payment ID for this order');

      const refundResponse = await fetch(`https://api.razorpay.com/v1/payments/${order.razorpay_payment_id}/refund`, {
        method: 'POST',
        headers: { Authorization: `Basic ${auth}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: body.amount * 100, notes: { reason: body.reason } }),
      });
      if (!refundResponse.ok) throw new Error('Razorpay refund failed');
    }

    const { error } = await adminClient.rpc('process_refund', {
      order_id: body.order_id,
      refund_method: body.method,
      amount: body.amount,
      reason: body.reason,
      actor_id: user.id,
    });

    if (error) throw error;

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
