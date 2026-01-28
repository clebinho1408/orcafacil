
import { createClient } from '@supabase/supabase-js';

// Switch to process.env to avoid ImportMeta property errors and align with environment variable access
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

export const isConfigured = !!(supabaseUrl && supabaseAnonKey);

export const supabase = isConfigured 
  ? createClient(supabaseUrl!, supabaseAnonKey!) 
  : null;

export const missingVars = [
  !supabaseUrl && 'VITE_SUPABASE_URL',
  !supabaseAnonKey && 'VITE_SUPABASE_ANON_KEY'
].filter(Boolean) as string[];
