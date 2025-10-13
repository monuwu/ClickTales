// Debug Supabase Connection
import { supabase } from '../services/supabase';

export async function debugSupabase() {
  console.log('🔍 Debugging Supabase Connection...');
  
  try {
    // Test basic connection
    if (!supabase) throw new Error('Supabase not available')
    
    const { data: { session }, error } = await supabase.auth.getSession();
    console.log('📡 Supabase connection:', session ? 'Connected' : 'Not authenticated');
    
    if (error) {
      console.error('❌ Session error:', error);
    }

    // Test user creation (this will help us understand the flow)
    console.log('🧪 Testing signup flow...');
    
    const testEmail = 'test@example.com';
    console.log('📧 Attempting to send OTP to:', testEmail);
    
    // Try to send OTP
    if (!supabase) throw new Error('Supabase not available')
    
    const { data: otpData, error: otpError } = await supabase.auth.signInWithOtp({
      email: testEmail,
      options: {
        shouldCreateUser: false // Don't create user, just test OTP
      }
    });
    
    console.log('🔐 OTP Response:', { data: otpData, error: otpError });
    
    return {
      connected: !error,
      otpWorking: !otpError,
      error: error || otpError
    };
  } catch (err) {
    console.error('💥 Debug error:', err);
    return {
      connected: false,
      otpWorking: false,
      error: err
    };
  }
}