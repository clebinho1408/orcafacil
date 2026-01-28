
import { createClient } from '@supabase/supabase-js';

const getEnv = (key: string) => {
  try {
    // Tenta process.env padrão (Vercel/Node)
    if (typeof process !== 'undefined' && process.env && process.env[key]) {
      return process.env[key];
    }
    // Tenta objeto global window.process (alguns runners)
    if ((window as any).process?.env?.[key]) {
      return (window as any).process.env[key];
    }
    // Caso especial para Vercel Edge/Client
    return (import.meta as any).env?.[key] || null;
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

export const missingVars = [
  !supabaseUrl && 'SUPABASE_URL',
  !supabaseAnonKey && 'SUPABASE_ANON_KEY'
].filter(Boolean) as string[];
