
import { neon } from '@neondatabase/serverless';

const STORAGE_KEY_DATABASE_URL = 'orca_voz_neon_url';

const getEnv = (name: string): string | undefined => {
  try {
    if (typeof process !== 'undefined' && process.env && process.env[name]) return process.env[name];
    // @ts-ignore
    if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env[name]) return import.meta.env[name];
    const fallbackName = name.replace('VITE_', '');
    if (typeof process !== 'undefined' && process.env && process.env[fallbackName]) return process.env[fallbackName];
    if (typeof window !== 'undefined' && (window as any)[name]) return (window as any)[name];
  } catch (e) {}
  return undefined;
};

/**
 * Limpa a URL de conexão do Neon caso o usuário tenha colado o comando psql inteiro
 * Ex: psql 'postgresql://user:pass@host/db' -> postgresql://user:pass@host/db
 */
const sanitizeUrl = (url: string | null): string | null => {
  if (!url) return null;
  let cleaned = url.trim();
  
  // Remove o prefixo "psql " se existir
  cleaned = cleaned.replace(/^psql\s+/, '');
  
  // Extrai o conteúdo dentro de aspas simples ou duplas se houver
  const match = cleaned.match(/['"](postgresql?:\/\/.*?)['"]/);
  if (match) {
    cleaned = match[1];
  } else {
    // Remove aspas remanescentes e espaços
    cleaned = cleaned.replace(/['"]/g, '').trim();
  }
  
  return cleaned;
};

const rawUrl = localStorage.getItem(STORAGE_KEY_DATABASE_URL) || getEnv('VITE_NEON_DATABASE_URL');
const databaseUrl = sanitizeUrl(rawUrl || null);

export const isConfigured = !!databaseUrl && databaseUrl.startsWith('postgres');

// Inicialização segura para evitar tela branca por erro de parsing da URL
let sqlClient = null;
if (isConfigured) {
  try {
    sqlClient = neon(databaseUrl!);
  } catch (e) {
    console.error("Erro ao inicializar driver Neon:", e);
  }
}

export const sql = sqlClient;

export const configureNeon = (url: string) => {
  localStorage.setItem(STORAGE_KEY_DATABASE_URL, url.trim());
  window.location.reload();
};

export const clearNeonConfig = () => {
  localStorage.removeItem(STORAGE_KEY_DATABASE_URL);
  window.location.reload();
};
