
import { createClient } from '@supabase/supabase-js';

// Tenta pegar de várias formas possíveis dependendo do ambiente (Vite, Vercel, etc)
const supabaseUrl = process.env.SUPABASE_URL || (window as any)._env_?.SUPABASE_URL || (import.meta as any).env?.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || (window as any)._env_?.SUPABASE_ANON_KEY || (import.meta as any).env?.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn("⚠️ ATENÇÃO: Credenciais do Supabase não encontradas. Verifique as variáveis de ambiente.");
}

export const supabase = (supabaseUrl && supabaseAnonKey) 
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : null;
