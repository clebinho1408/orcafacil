
import { createClient } from '@supabase/supabase-js';

// No navegador, process.env pode não estar definido globalmente. 
// Tentamos acessar de forma segura.
const getEnv = (key: string) => {
  try {
    return process.env[key] || (window as any).process?.env?.[key] || null;
  } catch {
    return null;
  }
};

const supabaseUrl = getEnv('SUPABASE_URL');
const supabaseAnonKey = getEnv('SUPABASE_ANON_KEY');

export const isConfigured = !!(supabaseUrl && supabaseAnonKey);

export const supabase = isConfigured 
  ? createClient(supabaseUrl!, supabaseAnonKey!) 
  : null;

// Exportamos para ajudar no debug do Auth
export const missingVars = [
  !supabaseUrl && 'SUPABASE_URL',
  !supabaseAnonKey && 'SUPABASE_ANON_KEY'
].filter(Boolean) as string[];
