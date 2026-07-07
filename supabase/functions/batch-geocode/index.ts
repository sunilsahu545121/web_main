import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

interface GeocodeBatchItem {
  pincode: string;
  address?: string;
}

interface GeocodeBatchBody {
  items: GeocodeBatchItem[];
  save_to_db: boolean;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405, headers: corsHeaders });

  try {
    const authHeader = req.headers.get('Authorization')!;
    const adminClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const body: GeocodeBatchBody = await req.json();
    const results: Array<{ pincode: string; lat: number | null; lon: number | null; error?: string }> = [];

    // 1 req/sec rate limit (Nominatim policy)
    for (const item of body.items) {
      try {
        const query = encodeURIComponent(item.address || item.pincode);
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${query},India&format=json&limit=1`,
          { headers: { 'User-Agent': 'KrixifyGeocoder/2.0' } }
        );

        if (!response.ok) throw new Error(`Nominatim ${response.status}`);
        const data = await response.json();

        if (data && data.length > 0) {
          results.push({
            pincode: item.pincode,
            lat: parseFloat(data[0].lat),
            lon: parseFloat(data[0].lon),
          });
        } else {
          results.push({ pincode: item.pincode, lat: null, lon: null, error: 'not_found' });
        }
      } catch (err) {
        results.push({ pincode: item.pincode, lat: null, lon: null, error: (err as Error).message });
      }

      // Respect Nominatim's 1 req/sec policy
      await new Promise((r) => setTimeout(r, 1100));
    }

    if (body.save_to_db) {
      const valid = results.filter((r) => r.lat !== null && r.lon !== null);
      if (valid.length > 0) {
        await adminClient.from('geocoded_pincodes').upsert(
          valid.map((r) => ({ pincode: r.pincode, latitude: r.lat, longitude: r.lon, geocoded_at: new Date().toISOString() })),
          { onConflict: 'pincode' }
        );
      }
    }

    return new Response(JSON.stringify({ results }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
