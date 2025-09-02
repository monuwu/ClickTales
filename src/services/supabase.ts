import { createClient } from '@supabase/supabase-js';

// TODO: Replace with your actual Supabase project URL and anon/public key
const SUPABASE_URL = 'https://ctfnempbmjwqtrwvngcz.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN0Zm5lbXBibWp3cXRyd3ZuZ2N6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYxMjQ3MzQsImV4cCI6MjA3MTcwMDczNH0.4D_nLluQU78CFnJF63f2mEcwGwuQroSkBRt0TFNa7Cg';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export async function uploadImageToSupabase(file: File | Blob, filePath: string, bucket: string): Promise<{ data: any; error: any }> {
  const { data, error } = await supabase.storage.from(bucket).upload(filePath, file, {
    cacheControl: '3600',
    upsert: true, // Allow overwrite for easier testing
    contentType: file.type || 'image/jpeg',
  });
  // Log for debugging
  console.log('Supabase upload result:', { data, error });
  return { data, error };
}
