// Supabase connection client setup
// Once you register a database on supabase.com, add a .env file with your variables:
// VITE_SUPABASE_URL=your_supabase_url
// VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

// Uncomment the block below to run the live database sync:

/*
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
*/

// For fallback, we export a mock client object:
export const supabase = {
  auth: {
    signUp: async (credentials) => ({ data: { user: { email: credentials.email } }, error: null }),
    signInWithPassword: async (credentials) => ({ data: { user: { email: credentials.email } }, error: null }),
    signOut: async () => ({ error: null })
  }
};
