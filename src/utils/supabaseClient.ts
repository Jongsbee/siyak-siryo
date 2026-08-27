import { createClient, SupabaseClient } from '@supabase/supabase-js';

const STORAGE_KEY_URL = 'supabase_custom_url';
const STORAGE_KEY_KEY = 'supabase_custom_key';

export function getStoredSupabaseConfig(): { url: string; key: string } {
  const url = localStorage.getItem(STORAGE_KEY_URL) || import.meta.env.VITE_SUPABASE_URL || '';
  const key = localStorage.getItem(STORAGE_KEY_KEY) || import.meta.env.VITE_SUPABASE_ANON_KEY || '';
  return { url, key };
}

export function saveSupabaseConfig(url: string, key: string) {
  localStorage.setItem(STORAGE_KEY_URL, url.trim());
  localStorage.setItem(STORAGE_KEY_KEY, key.trim());
}

export function clearSupabaseConfig() {
  localStorage.removeItem(STORAGE_KEY_URL);
  localStorage.removeItem(STORAGE_KEY_KEY);
}

let cachedClient: SupabaseClient | null = null;
let cachedUrl = '';
let cachedKey = '';

export function getSupabaseClient(): SupabaseClient | null {
  const { url, key } = getStoredSupabaseConfig();
  if (!url || !key || url.includes('your-project-id') || key.includes('your-supabase-anon-key')) {
    return null;
  }

  if (cachedClient && cachedUrl === url && cachedKey === key) {
    return cachedClient;
  }

  try {
    cachedClient = createClient(url, key, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
      }
    });
    cachedUrl = url;
    cachedKey = key;
    return cachedClient;
  } catch (e) {
    console.error('Failed to create Supabase client:', e);
    return null;
  }
}
