
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

// URL de conexão completa do Neon (postgresql://user:pass@host/db)
let databaseUrl = localStorage.getItem(STORAGE_KEY_DATABASE_URL) || getEnv('VITE_NEON_DATABASE_URL');

export const isConfigured = !!databaseUrl;

// O driver neon() retorna uma função para executar SQL via HTTP
export const sql = isConfigured ? neon(databaseUrl!) : null;

export const configureNeon = (url: string) => {
  localStorage.setItem(STORAGE_KEY_DATABASE_URL, url.trim());
  window.location.reload();
};

export const clearNeonConfig = () => {
  localStorage.removeItem(STORAGE_KEY_DATABASE_URL);
  window.location.reload();
};
