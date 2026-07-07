import { supabase } from './client';

const FUNCTIONS_URL = import.meta.env.VITE_SUPABASE_FUNCTIONS_URL;

export interface EdgeFunctionOptions<TBody = unknown> {
  functionName: string;
  body?: TBody;
  method?: 'POST' | 'GET' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
}

/**
 * Invokes a Supabase Edge Function with the user's auth token.
 * All privileged operations (KYC approval, batch writes, etc.)
 * MUST go through this layer instead of direct DB queries.
 */
export async function invokeEdgeFunction<TResponse, TBody = unknown>({
  functionName,
  body,
  method = 'POST',
  headers = {},
}: EdgeFunctionOptions<TBody>): Promise<TResponse> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    throw new Error('Authentication required for privileged operations.');
  }

  const response = await fetch(`${FUNCTIONS_URL}/${functionName}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${session.access_token}`,
      apikey: import.meta.env.VITE_SUPABASE_ANON_KEY!,
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: response.statusText }));
    throw new Error(error.message || `Edge function ${functionName} failed.`);
  }

  return response.json();
}
