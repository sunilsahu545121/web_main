import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { orderId, fallbackRadiusKm = 5 } = await req.json()
    
    if (!orderId) {
      throw new Error('Missing orderId')
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Fetch order details
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('id, store_lat, store_lng, status')
      .eq('id', orderId)
      .single()

    if (orderError || !order) {
      throw new Error('Order not found')
    }

    if (order.status !== 'processing' && order.status !== 'pending') {
      return new Response(JSON.stringify({ message: 'Order is not in a state to be assigned' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      })
    }

    // Find nearest available delivery partner (using PostGIS or Haversine approximation in Edge Function)
    // For simplicity without PostGIS on profiles, we use a basic query if bounding box is known,
    // or we fetch active drivers and calculate distance
    const { data: drivers } = await supabase
      .from('delivery_partners')
      .select('id, current_lat, current_lng')
      .eq('status', 'online')
      .gte('last_ping_at', new Date(Date.now() - 15 * 60 * 1000).toISOString()) // active in last 15 mins

    if (!drivers || drivers.length === 0) {
      return new Response(JSON.stringify({ message: 'No delivery partners available' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 404,
      })
    }

    // Calculate distance (Haversine)
    const R = 6371; // Earth radius in km
    let nearestDriver = null;
    let minDistance = fallbackRadiusKm;

    for (const driver of drivers) {
      if (!driver.current_lat || !driver.current_lng) continue;
      
      const dLat = (driver.current_lat - order.store_lat) * (Math.PI/180);
      const dLon = (driver.current_lng - order.store_lng) * (Math.PI/180);
      const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(order.store_lat * (Math.PI/180)) * Math.cos(driver.current_lat * (Math.PI/180)) * 
        Math.sin(dLon/2) * Math.sin(dLon/2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
      const distance = R * c;

      if (distance < minDistance) {
        minDistance = distance;
        nearestDriver = driver;
      }
    }

    if (!nearestDriver) {
      return new Response(JSON.stringify({ message: 'No drivers within radius' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 404,
      })
    }

    // Assign order to nearest driver
    await supabase
      .from('orders')
      .update({ 
        delivery_agent_id: nearestDriver.id,
        status: 'out_for_pickup'
      })
      .eq('id', orderId)

    // TODO: Trigger Push Notification to the Flutter App via FCM using nearestDriver.id

    return new Response(JSON.stringify({ 
      success: true, 
      assigned_to: nearestDriver.id,
      distance_km: minDistance.toFixed(2)
    }), {
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
