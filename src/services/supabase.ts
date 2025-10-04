import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Use environment variables for Supabase configuration
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Create a single Supabase client instance to avoid multiple instances warning
let supabaseInstance: SupabaseClient | null = null;

const createSupabaseClient = (): SupabaseClient | null => {
  // Return existing instance if already created
  if (supabaseInstance) {
    return supabaseInstance;
  }
  
  try {
    if (SUPABASE_URL && SUPABASE_ANON_KEY) {
      supabaseInstance = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
        auth: {
          persistSession: true,
          storageKey: 'clicktales-auth-token', // Use unique storage key
        },
      });
      console.log('✅ Supabase client initialized');
      return supabaseInstance;
    } else {
      console.warn('⚠️ Missing Supabase environment variables, using mock auth');
      return null;
    }
  } catch (error) {
    console.error('❌ Failed to initialize Supabase client:', error);
    return null;
  }
};

export const supabase = createSupabaseClient();

// Helper function to safely get auth service
export const getAuthService = () => {
  if (!supabase) {
    throw new Error('Supabase client not available');
  }
  return supabase.auth;
};

// Helper function to safely get storage service
export const getStorageService = () => {
  if (!supabase) {
    throw new Error('Supabase client not available');
  }
  return supabase.storage;
};

// Helper function to safely get database service
export const getDbService = () => {
  if (!supabase) {
    throw new Error('Supabase client not available');
  }
  return supabase;
};

export async function uploadImageToSupabase(file: File | Blob, filePath: string, bucket: string): Promise<{ data: any; error: any }> {
  if (!supabase) {
    return { data: null, error: { message: 'Supabase client not available' } };
  }
  
  const { data, error } = await supabase.storage.from(bucket).upload(filePath, file, {
    cacheControl: '3600',
    upsert: true, // Allow overwrite for easier testing
    contentType: file.type || 'image/jpeg',
  });
  // Log for debugging
  console.log('Supabase upload result:', { data, error });
  return { data, error };
}
