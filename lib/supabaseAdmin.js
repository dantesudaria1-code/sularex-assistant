import { createClient } from "@supabase/supabase-js";

// Server-side Supabase client using the SERVICE ROLE key.
// Never import this into client components.
let _client = null;
export function supabaseAdmin() {
  if (_client) return _client;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null; // allows the app to run before Supabase is configured
  _client = createClient(url, key, { auth: { persistSession: false } });
  return _client;
}
