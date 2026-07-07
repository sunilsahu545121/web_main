import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Database } from './database.types';

// CRITICAL: Only the ANON key is bundled with the frontend
// All privileged actions go through Edge Functions
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    '[SECURITY] Missing Supabase environment variables. ' +
    'Only VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY may be used in the frontend.'
  );
}

// Guard: ensure service_role key never gets bundled
if (supabaseAnonKey.includes('service_role') || (supabaseAnonKey.startsWith('eyJ') && supabaseAnonKey.length > 400)) {
  // service_role JWTs are typically longer and start with a different role claim
  const decoded = JSON.parse(atob(supabaseAnonKey.split('.')[1]));
  if (decoded.role === 'service_role') {
    throw new Error('[SECURITY BLOCK] service_role key detected in frontend bundle. Aborting.');
  }
}

export const supabase: SupabaseClient<Database> = createClient<Database>(
  supabaseUrl,
  supabaseAnonKey,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storage: window.localStorage,
    },
    realtime: {
      params: { eventsPerSecond: 10 },
    },
  }
);
