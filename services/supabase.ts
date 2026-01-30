
import { createClient, SupabaseClient } from '@supabase/supabase-js';

const STORAGE_KEY_URL = 'orca_voz_supabase_url';
const STORAGE_KEY_KEY = 'orca_voz_supabase_key';

const getEnv = (name: string): string | undefined => {
  try {
    // 1. Tenta process.env
    if (typeof process !== 'undefined' && process.env && process.env[name]) return process.env[name];
    
    // 2. Tenta import.meta.env
    // @ts-ignore
    if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env[name]) return import.meta.env[name];

    // 3. Fallbacks de nomes comuns
    const fallbackName = name.replace('VITE_', '');
    if (typeof process !== 'undefined' && process.env && process.env[fallbackName]) return process.env[fallbackName];
    
    // 4. Tenta window
    if (typeof window !== 'undefined' && (window as any)[name]) return (window as any)[name];
  } catch (e) {}
  return undefined;
};

// Inicialização resiliente
let url = localStorage.getItem(STORAGE_KEY_URL) || getEnv('VITE_SUPABASE_URL');
let key = localStorage.getItem(STORAGE_KEY_KEY) || getEnv('VITE_SUPABASE_ANON_KEY');

export const isConfigured = !!(url && key);

export const supabase: SupabaseClient | null = isConfigured 
  ? createClient(url!, key!) 
  : null;

/**
 * Permite configurar o Supabase manualmente se as variáveis de ambiente falharem
 */
export const configureSupabase = (newUrl: string, newKey: string) => {
  localStorage.setItem(STORAGE_KEY_URL, newUrl.trim());
  localStorage.setItem(STORAGE_KEY_KEY, newKey.trim());
  window.location.reload(); // Recarrega para reinicializar o cliente
};

export const clearSupabaseConfig = () => {
  localStorage.removeItem(STORAGE_KEY_URL);
  localStorage.removeItem(STORAGE_KEY_KEY);
  window.location.reload();
};

export const missingVars = [
  !url && 'VITE_SUPABASE_URL',
  !key && 'VITE_SUPABASE_ANON_KEY'
].filter(Boolean) as string[];
