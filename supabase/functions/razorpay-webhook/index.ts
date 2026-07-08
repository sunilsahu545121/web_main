import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.0'
import crypto from "node:crypto";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-razorpay-signature',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const signature = req.headers.get('x-razorpay-signature');
    if (!signature) {
      return new Response('Missing signature', { status: 400, headers: corsHeaders })
    }

    const payload = await req.text();
    const secret = Deno.env.get('RAZORPAY_WEBHOOK_SECRET') || 'dummy_secret';

    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(payload)
      .digest('hex');

    if (expectedSignature !== signature) {
      return new Response('Invalid signature', { status: 400, headers: corsHeaders })
    }

    const event = JSON.parse(payload);
    
    // Connect to Supabase
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    if (event.event === 'payment.captured' || event.event === 'order.paid') {
      const paymentEntity = event.payload.payment.entity;
      const orderId = paymentEntity.notes?.order_id;
      const amount = paymentEntity.amount / 100; // Razorpay sends in paise

      if (orderId) {
        // Update Order status
        await supabase
          .from('orders')
          .update({ payment_status: 'paid', status: 'processing' })
          .eq('id', orderId);

        // Fetch order details for split logic
        const { data: orderData } = await supabase
          .from('orders')
          .select('seller_id, total_amount, shipping_charge')
          .eq('id', orderId)
          .single();

        if (orderData) {
          // Calculate 4-way split
          // Example: Platform fee 5% of subtotal
          const subtotal = orderData.total_amount - orderData.shipping_charge;
          const platformFee = subtotal * 0.05;
          const sellerPayout = subtotal - platformFee;
          
          // Log transactions in ledger
          const transactions = [
            {
              profile_id: orderData.seller_id,
              amount: sellerPayout,
              type: 'credit',
              status: 'completed',
              description: `Payout for Order ${orderId}`
            },
            {
              profile_id: orderData.seller_id, // System/Admin representation
              amount: platformFee,
              type: 'credit',
              status: 'completed',
              description: `Platform Fee for Order ${orderId}`
            }
          ];

          await supabase.from('wallet_transactions').insert(transactions);
        }
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})
