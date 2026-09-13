import { createClient } from '@supabase/supabase-js';

/**
 * Supabase Client Initialization for NTB Lab Portal
 * Reads environment variables VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.
 */

const SUPABASE_URL = import.meta.env?.VITE_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = import.meta.env?.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(
  SUPABASE_URL && 
  SUPABASE_ANON_KEY && 
  !SUPABASE_URL.includes('your-project-ref') && 
  !SUPABASE_ANON_KEY.includes('your-anon-key')
);

// Instantiate Supabase client safely with fallback dummy values if unconfigured
const fallbackUrl = 'https://placeholder.supabase.co';
const fallbackKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.placeholder';

export const supabase = createClient(
  isSupabaseConfigured ? SUPABASE_URL : fallbackUrl,
  isSupabaseConfigured ? SUPABASE_ANON_KEY : fallbackKey,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    }
  }
);

export const supabaseConfig = {
  url: SUPABASE_URL,
  key: SUPABASE_ANON_KEY,
  isConfigured: isSupabaseConfigured
};
