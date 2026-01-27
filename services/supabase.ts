
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

// Inicializa como null se as chaves estiverem ausentes para evitar o erro "supabaseUrl is required" ao carregar o app.
// O erro será tratado nas chamadas de serviço em db.ts
export const supabase = (supabaseUrl && supabaseAnonKey) 
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : null;
