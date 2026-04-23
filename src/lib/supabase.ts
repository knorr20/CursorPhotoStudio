import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Database } from '../types/database';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

/** False when VITE_* vars were missing at build time (e.g. Vercel env not applied before build). */
export const isSupabaseConfigured = Boolean(supabaseUrl?.trim() && supabaseAnonKey?.trim());

/** Use only when `isSupabaseConfigured`; otherwise null — hooks must no-op. */
export const supabase: SupabaseClient<Database> | null = isSupabaseConfigured
  ? createClient(supabaseUrl!, supabaseAnonKey!)
  : null;
