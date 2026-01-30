
import { createClient } from '@supabase/supabase-js';

/**
 * Busca variáveis de ambiente em múltiplos locais possíveis 
 * para garantir compatibilidade entre Vercel, Local e outros ambientes.
 */
const getEnv = (name: string): string | undefined => {
  try {
    // 1. Tenta process.env (Vercel/Node/Deno shim)
    if (typeof process !== 'undefined' && process.env && process.env[name]) {
      return process.env[name];
    }
    
    // 2. Tenta import.meta.env (Padrão Vite/Modern Browsers)
    // @ts-ignore
    if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env[name]) {
      // @ts-ignore
      return import.meta.env[name];
    }

    // 3. Tenta window._env_ (Fallback comum em containers)
    if (typeof window !== 'undefined' && (window as any)._env_ && (window as any)._env_[name]) {
      return (window as any)._env_[name];
    }

    // 4. Fallback: Se estiver na Vercel, às vezes as variáveis VITE_ perdem o prefixo no process.env
    const fallbackName = name.replace('VITE_', '');
    if (typeof process !== 'undefined' && process.env && process.env[fallbackName]) {
      return process.env[fallbackName];
    }
  } catch (e) {
    console.warn(`Falha ao ler variável ${name}:`, e);
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
