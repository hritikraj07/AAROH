import { createClient, SupabaseClient } from '@supabase/supabase-js';

const rawUrl = import.meta.env.VITE_SUPABASE_URL;
const rawKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const url = typeof rawUrl === 'string' ? rawUrl.replace(/^["']|["']$/g, '').trim() : '';
const key = typeof rawKey === 'string' ? rawKey.replace(/^["']|["']$/g, '').trim() : '';

export const supabase: SupabaseClient | null =
  url && key && url.length > 0 && key.length > 0
    ? createClient(url, key)
    : null;
