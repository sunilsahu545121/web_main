import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

serve(async (req) => {
  const { payoutId } = await req.json();
  
  try {
    // Get payout
    const { data: payout, error } = await supabase
      .from('payouts')
      .select('*')
      .eq('id', payoutId)
      .single();
    if (error) throw error;
    
    // Call Razorpay/Payment gateway here
    // const transfer = await razorpay.payouts.create({...});
    
    // For demo, generate reference
    const referenceId = `PAY-${Date.now()}-${payoutId.slice(0, 8)}`;
    
    // Update status
    await supabase
      .from('payouts')
      .update({
        status: 'completed',
        reference_id: referenceId,
        completed_at: new Date().toISOString(),
      })
      .eq('id', payoutId);
    
    return new Response(
      JSON.stringify({ success: true, reference_id: referenceId }),
      { headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }
});
