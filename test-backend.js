// Quick backend connectivity test
import { supabase } from './src/services/supabase.ts';

async function testBackend() {
  console.log('🔍 Testing backend connection...');
  
  try {
    if (!supabase) {
      console.log('❌ Supabase client not available');
      return;
    }

    // Test basic connection
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      console.log('❌ Backend connection failed:', error.message);
    } else {
      console.log('✅ Backend is LIVE! Connection successful');
      console.log('📡 Session status:', session ? 'Authenticated' : 'Not authenticated');
    }

    // Test database connectivity
    const { data, error: dbError } = await supabase
      .from('photos')
      .select('count')
      .limit(1);
      
    if (dbError) {
      console.log('⚠️  Database query failed:', dbError.message);
    } else {
      console.log('✅ Database is accessible');
    }

  } catch (error) {
    console.log('❌ Backend connection error:', error.message);
  }
}

testBackend();