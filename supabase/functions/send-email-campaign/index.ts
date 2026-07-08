import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

serve(async (req) => {
  const { subject, preview_text, body, audience } = await req.json();
  
  try {
    // Demo implementation for sending email campaign
    const sentCount = Math.floor(Math.random() * 500) + 50;
    
    // Save to notifications table
    const { data: notification, error } = await supabase
      .from('notifications')
      .insert({
        type: 'email',
        title: subject,
        body: preview_text ? `${preview_text}\n\n${body}` : body,
        audience,
        audience_count: sentCount,
        status: 'sent',
        sent_count: sentCount,
        sent_at: new Date().toISOString(),
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
