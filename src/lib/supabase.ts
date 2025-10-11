import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://nnpybzpdcrracgczwkiz.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5ucHlienBkY3JyYWNnY3p3a2l6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAxNjQ4MDgsImV4cCI6MjA3NTc0MDgwOH0.2rHoOMJaYQIqghBYYF6E9iukVBucjJ6nfU8w_XXxzrg';

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
