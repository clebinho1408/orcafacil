
import { createClient } from '@supabase/supabase-js';

// Acesso direto ao process.env para evitar problemas de escopo em módulos ESM
const supabaseUrl = typeof process !== 'undefined' ? process.env.SUPABASE_URL : undefined;
const supabaseAnonKey = typeof process !== 'undefined' ? process.env.SUPABASE_ANON_KEY : undefined;

export const isConfigured = !!(supabaseUrl && supabaseAnonKey);

export const supabase = isConfigured 
  ? createClient(supabaseUrl!, supabaseAnonKey!) 
  : null;

// Variáveis que o sistema não conseguiu encontrar
export const missingVars = [
  !supabaseUrl && 'SUPABASE_URL',
  !supabaseAnonKey && 'SUPABASE_ANON_KEY'
].filter(Boolean) as string[];

// Debug para o console (ajuda a identificar problemas na Vercel)
if (!isConfigured && typeof window !== 'undefined') {
  console.warn("Configuração Supabase ausente. Verifique as variáveis de ambiente na Vercel.");
}
