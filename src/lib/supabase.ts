import { createClient, SupabaseClient } from '@supabase/supabase-js';

const rawUrl = (import.meta.env.VITE_SUPABASE_URL as string | undefined) || 'https://uypyftpzgvgbrnwlrahh.supabase.co';
const rawKey = (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined) || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV5cHlmdHB6Z3ZnYnJud2xyYWhoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTUwNTE4OTgsImV4cCI6MjExMDYyNzg5OH0.fYnjRzMosRl6YT53fFMU84S4R3-fT7DkgKF2ipzDsdE';

const url = typeof rawUrl === 'string' ? rawUrl.replace(/^["']|["']$/g, '').trim() : '';
const key = typeof rawKey === 'string' ? rawKey.replace(/^["']|["']$/g, '').trim() : '';

export const supabase: SupabaseClient | null =
  url && key && url.length > 0 && key.length > 0
    ? createClient(url, key)
    : null;
