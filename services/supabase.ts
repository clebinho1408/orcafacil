
import { createClient } from '@supabase/supabase-js';

// Função auxiliar para buscar variáveis em qualquer lugar (process.env ou import.meta.env)
const getEnv = (name: string): string | undefined => {
  try {
    // Tenta process.env (padrão Node/Vercel shim)
    if (typeof process !== 'undefined' && process.env && process.env[name]) {
      return process.env[name];
    }
    // Tenta import.meta.env (padrão Vite)
    // @ts-ignore
    if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env[name]) {
      // @ts-ignore
      return import.meta.env[name];
    }
  } catch (e) {
    console.warn(`Erro ao acessar variável ${name}:`, e);
  }
  return undefined;
};

const supabaseUrl = getEnv('VITE_SUPABASE_URL');
const supabaseAnonKey = getEnv('VITE_SUPABASE_ANON_KEY');

export const isConfigured = !!(supabaseUrl && supabaseAnonKey);

export const supabase = isConfigured 
  ? createClient(supabaseUrl!, supabaseAnonKey!) 
  : null;

export const missingVars = [
  !supabaseUrl && 'VITE_SUPABASE_URL',
  !supabaseAnonKey && 'VITE_SUPABASE_ANON_KEY'
].filter(Boolean) as string[];
