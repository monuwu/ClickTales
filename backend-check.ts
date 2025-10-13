import { supabase } from './src/services/supabase';
import { isSupabaseAvailable } from './src/services/mockAuth';

async function checkBackendStatus() {
  console.log('🔍 Checking backend status...');
  
  // Check if Supabase client is available
  const available = await isSupabaseAvailable();
  
  if (available && supabase) {
    console.log('✅ Backend is LIVE!');
    console.log('🌐 Supabase URL: https://yssclplclymzguvnkogo.supabase.co');
    
    try {
      // Test auth session
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) {
        console.log('⚠️ Auth check failed:', error.message);
      } else {
        console.log('🔐 Auth service:', session ? 'Authenticated' : 'Ready');
      }
      
      // Test database connectivity with a simple query
      const { data, error: dbError } = await supabase
        .from('photos')
        .select('id')
        .limit(1);
        
      if (dbError) {
        console.log('⚠️ Database query failed:', dbError.message);
      } else {
        console.log('💾 Database: Connected and accessible');
      }
      
    } catch (error) {
      console.log('❌ Connection test failed:', error);
    }
  } else {
    console.log('❌ Backend is OFFLINE or not configured');
    console.log('🔄 Falling back to mock authentication');
  }
}

// Run the check
checkBackendStatus();