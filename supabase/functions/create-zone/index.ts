import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

interface CreateZoneBody {
  name: string;
  polygon: GeoJSON.Polygon;
  pincodes: string[];
  delivery_charge: number;
  min_order_value: number;
  eta_minutes: number;
  free_delivery_threshold: number | null;
  manager_id: string | null;
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

    const { data: profile } = await userClient.from('profiles').select('role').eq('id', user.id).single();
    if (!profile || !['super_admin', 'zone_manager'].includes(profile.role)) {
      throw new Error('Forbidden');
    }

    const adminClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const body: CreateZoneBody = await req.json();
    if (!body.name || !body.polygon || !Array.isArray(body.pincodes)) {
      throw new Error('Invalid zone payload');
    }

    const { data, error } = await adminClient
      .from('zones')
      .insert({
        name: body.name,
        polygon: body.polygon,
        pincodes: body.pincodes,
        delivery_charge: body.delivery_charge,
        min_order_value: body.min_order_value,
        eta_minutes: body.eta_minutes,
        free_delivery_threshold: body.free_delivery_threshold,
        manager_id: body.manager_id,
      })
      .select()
      .single();

    if (error) throw error;

    return new Response(JSON.stringify({ success: true, zone: data }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
