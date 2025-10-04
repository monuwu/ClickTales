import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import OTPInput from '../components/OTPInput';

interface LocationState {
  email?: string;
  flow?: 'signup' | 'login';
  message?: string;
}

export function OTPVerificationPage() {
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);
  const [isResending, setIsResending] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();
  const { verifyOTP, resendOTP, verifyLoginOTP, sendLoginOTP } = useAuth();
  
  const state = location.state as LocationState;
  const email = state?.email;
  const flow = state?.flow || 'signup';
  const initialMessage = state?.message;

  // Set initial success message if provided
  useEffect(() => {
    if (initialMessage) {
      setSuccess(initialMessage);
      // Clear success message after 3 seconds
      const timer = setTimeout(() => setSuccess(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [initialMessage]);

  // Redirect if no email provided
  useEffect(() => {
    if (!email) {
      navigate('/login');
    }
  }, [email, navigate]);

  // Cooldown timer for resend
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => {
        setResendCooldown(resendCooldown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handleOTPChange = (value: string) => {
    setOtp(value);
    setError('');
    setSuccess('');
    
    // Auto-submit when OTP is complete
    if (value.length === 6) {
      handleVerifyOTP(value);
    }
  };

  const handleVerifyOTP = async (otpCode: string = otp) => {
    if (!otpCode || otpCode.length !== 6) {
      setError('Please enter a 6-digit verification code');
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      if (flow === 'login') {
        const success = await verifyLoginOTP(email!, otpCode);
        if (success) {
          setSuccess('Login successful! Redirecting...');
          setTimeout(() => navigate('/'), 1000);
        } else {
          setError('Invalid verification code. Please try again.');
        }
      } else {
        await verifyOTP(email!, otpCode);
        setSuccess('Account verified successfully! Redirecting...');
        setTimeout(() => navigate('/'), 1000);
      }
    } catch (err: any) {
      console.error('OTP verification error:', err);
      setError(err.message || 'Invalid verification code. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (resendCooldown > 0 || isResending) return;

    setIsResending(true);
    setError('');
    setSuccess('');

    try {
      if (flow === 'login') {
        await sendLoginOTP(email!);
      } else {
        await resendOTP(email!);
      }
      setSuccess('Verification code sent successfully!');
      setResendCooldown(60); // 60 second cooldown
      setOtp(''); // Clear current OTP
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      console.error('Resend OTP error:', err);
      setError(err.message || 'Failed to resend verification code');
    } finally {
      setIsResending(false);
    }
  };

  const handleGoBack = () => {
    navigate('/login');
  };

  if (!email) {
    return null; // Will redirect via useEffect
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 w-full max-w-md"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2 }}
            className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4"
          >
            <svg className="w-8 h-8 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 7.89a2 2 0 002.83 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </motion.div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {flow === 'login' ? 'Verify Login Code' : 'Verify Your Email'}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            We've sent a 6-digit verification code to
          </p>
          <p className="font-semibold text-blue-600 dark:text-blue-400 mt-1 break-all">
            {email}
          </p>
        </div>

        {/* Success Message */}
        {success && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg"
          >
            <p className="text-sm text-green-600 dark:text-green-400 text-center">
              {success}
            </p>
          </motion.div>
        )}

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg"
          >
            <p className="text-sm text-red-600 dark:text-red-400 text-center">
              {error}
            </p>
          </motion.div>
        )}

        {/* OTP Input */}
        <div className="mb-6">
          <OTPInput
            onChange={handleOTPChange}
            disabled={isLoading}
            error={!!error}
            loading={isLoading}
          />
        </div>

        {/* Actions */}
        <div className="space-y-4">
          {/* Verify Button */}
          <motion.button
            whileHover={{ scale: isLoading || otp.length !== 6 ? 1 : 1.02 }}
            whileTap={{ scale: isLoading || otp.length !== 6 ? 1 : 0.98 }}
            onClick={() => handleVerifyOTP()}
            disabled={isLoading || otp.length !== 6}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center"
          >
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Verifying...
              </>
            ) : (
              'Verify Code'
            )}
          </motion.button>

          {/* Resend Code */}
          <div className="text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              Didn't receive the code?
            </p>
            <button
              onClick={handleResendOTP}
              disabled={resendCooldown > 0 || isResending}
              className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-semibold text-sm disabled:text-gray-400 disabled:cursor-not-allowed transition-colors duration-200"
            >
              {isResending ? (
                'Sending...'
              ) : resendCooldown > 0 ? (
                `Resend in ${resendCooldown}s`
              ) : (
                'Resend Code'
              )}
            </button>
          </div>

          {/* Go Back */}
          <div className="text-center pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={handleGoBack}
              className="text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 text-sm transition-colors duration-200"
            >
              ← Back to Login
            </button>
          </div>
          {/* Go Back */}
          <div className="text-center pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={handleGoBack}
              className="text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 text-sm transition-colors duration-200"
            >
              Back to Login
            </button>
          </div>
        </div>

        {/* Footer Note */}
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500 dark:text-gray-500">
            The verification code will expire in 10 minutes
          </p>
        </div>
      </motion.div>
    </div>
  );
}