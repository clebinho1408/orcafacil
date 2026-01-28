
import { createClient } from '@supabase/supabase-js';

// No Vite + Vercel, precisamos acessar diretamente para o compilador substituir
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

export const isConfigured = !!(supabaseUrl && supabaseAnonKey);

export const supabase = isConfigured 
  ? createClient(supabaseUrl!, supabaseAnonKey!) 
  : null;

export const missingVars = [
  !supabaseUrl && 'SUPABASE_URL',
  !supabaseAnonKey && 'SUPABASE_ANON_KEY'
].filter(Boolean) as string[];

if (!isConfigured && typeof window !== 'undefined') {
  console.warn("Aguardando configuração das variáveis de ambiente na Vercel.");
}
