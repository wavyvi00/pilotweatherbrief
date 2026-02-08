import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://lbrdcwfnqcasttykbrap.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxicmRjd2ZucWNhc3R0eWticmFwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA1MTY3ODgsImV4cCI6MjA4NjA5Mjc4OH0.6NMjE2xeRYxQdvYAwxlRUjhFPkBhcEef9RKY96QbDbM';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
