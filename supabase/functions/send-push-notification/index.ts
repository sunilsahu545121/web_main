import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

serve(async (req) => {
  const { title, body, audience, imageUrl, scheduledAt } = await req.json();
  
  try {
    // Demo implementation for sending push notification
    const sentCount = Math.floor(Math.random() * 1000) + 100;
    
    // Save to notifications table
    const { data: notification, error } = await supabase
      .from('notifications')
      .insert({
        type: 'push',
        title,
        body,
        audience,
        audience_count: sentCount,
        status: scheduledAt ? 'scheduled' : 'sent',
        sent_count: scheduledAt ? 0 : sentCount,
        scheduled_at: scheduledAt || null,
        sent_at: scheduledAt ? null : new Date().toISOString(),
        image_url: imageUrl || null,
      })
      .select()
      .single();
      
    if (error) throw error;
    
    return new Response(
      JSON.stringify({ success: true, sent_count: sentCount }),
      { headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }
});
