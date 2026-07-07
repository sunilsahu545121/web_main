import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

interface ApproveKYCBody {
  seller_id: string;
  approved: boolean;
  reason?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405, headers: corsHeaders });

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) throw new Error('Missing Authorization header');

    // User-scoped client to verify caller identity
    const userClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: userError } = await userClient.auth.getUser();
    if (userError || !user) throw new Error('Unauthenticated');

    // Privilege check via RLS-aware profile fetch
    const { data: callerProfile } = await userClient
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!callerProfile || !['super_admin', 'zone_manager'].includes(callerProfile.role)) {
      throw new Error('Forbidden: insufficient privileges');
    }

    // Service-role client ONLY on the server, never exposed to client
    const adminClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const body: ApproveKYCBody = await req.json();
    if (!body.seller_id) throw new Error('seller_id is required');

    // Use SECURITY DEFINER function for the actual update (audit trail)
    const { error: updateError } = await adminClient.rpc('approve_kyc', {
      seller_id: body.seller_id,
      approved: body.approved,
      reason: body.reason ?? null,
    });

    if (updateError) throw updateError;

    // Audit log
    await adminClient.from('audit_logs').insert({
      actor_id: user.id,
      action: body.approved ? 'kyc_approved' : 'kyc_rejected',
      target_id: body.seller_id,
      metadata: { reason: body.reason ?? null },
    });

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: (err as Error).message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
