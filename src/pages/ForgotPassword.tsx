import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Camera,
  Mail,
  ArrowRight,
  ArrowLeft,
  Lock
} from '../components/icons'
import Navigation from '../components/Navigation'
import { useAuth } from '../contexts/AuthContext'

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [step, setStep] = useState<'email' | 'otp' | 'password'>('email')
  const [error, setError] = useState('')
  
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      if (step === 'email') {
        // Send OTP to email
        await new Promise(resolve => setTimeout(resolve, 1000))
        console.log(`📧 OTP sent to ${email}`)
        setStep('otp')
        
      } else if (step === 'otp') {
        // Verify OTP
        await new Promise(resolve => setTimeout(resolve, 1000))
        // For demo, accept any 6-digit OTP
        if (otp.length === 6) {
          console.log(`✅ OTP verified for ${email}`)
          setStep('password')
        } else {
          setError('Please enter a valid 6-digit OTP')
        }
        
      } else if (step === 'password') {
        // Set new password and login
        if (newPassword !== confirmPassword) {
          setError('Passwords do not match')
          return
        }
        if (newPassword.length < 6) {
          setError('Password must be at least 6 characters')
          return
        }
        
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        // Login with new password
        const success = await login(email, newPassword)
        if (success) {
          console.log(`✅ Password reset successful for ${email}`)
          navigate('/photobooth')
        } else {
          setError('Failed to login with new password')
        }
      }
      
    } catch (err) {
      console.error('Password reset error:', err)
      setError('An error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white font-inter">
      <Navigation />

      <div className="flex items-center justify-center px-4 sm:px-6 lg:px-8 py-20">
        <div className="max-w-md w-full">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-8"
          >
            <div className="flex items-center justify-center mb-6">
              <motion.div
                whileHover={{ rotate: 15, scale: 1.1 }}
                className="bg-gradient-to-br from-purple-500 to-pink-500 p-3 rounded-2xl shadow-lg"
              >
                {step === 'email' && <Mail className="h-8 w-8 text-white" />}
                {step === 'otp' && <Camera className="h-8 w-8 text-white" />}
                {step === 'password' && <Lock className="h-8 w-8 text-white" />}
              </motion.div>
            </div>

            <h2 className="text-3xl font-dm font-bold text-gray-900 mb-2">
              {step === 'email' && 'Reset Password'}
              {step === 'otp' && 'Verify OTP'}
              {step === 'password' && 'New Password'}
            </h2>
            <p className="text-gray-600">
              {step === 'email' && 'Enter your email to receive an OTP'}
              {step === 'otp' && 'Enter the 6-digit code sent to your email'}
              {step === 'password' && 'Create your new password'}
            </p>
          </motion.div>

          {/* Form */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 p-8"
          >
            {error && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Step 1: Email */}
              {step === 'email' && (
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl leading-5 bg-white/50 backdrop-blur-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                      placeholder="Enter your email address"
                    />
                  </div>
                </div>
              )}

              {/* Step 2: OTP */}
              {step === 'otp' && (
                <div>
                  <label htmlFor="otp" className="block text-sm font-medium text-gray-700 mb-2">
                    Verification Code
                  </label>
                  <div className="relative">
                    <input
                      id="otp"
                      name="otp"
                      type="text"
                      required
                      maxLength={6}
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                      className="block w-full px-3 py-3 border border-gray-300 rounded-xl leading-5 bg-white/50 backdrop-blur-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 text-center text-2xl font-mono tracking-widest"
                      placeholder="000000"
                    />
                  </div>
                  <p className="text-sm text-gray-500 mt-2 text-center">
                    OTP sent to {email}
                  </p>
                </div>
              )}

              {/* Step 3: New Password */}
              {step === 'password' && (
                <div className="space-y-4">
                  <div>
                    <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-2">
                      New Password
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Lock className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        id="newPassword"
                        name="newPassword"
                        type="password"
                        required
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl leading-5 bg-white/50 backdrop-blur-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                        placeholder="Enter new password"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Lock className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        id="confirmPassword"
                        name="confirmPassword"
                        type="password"
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl leading-5 bg-white/50 backdrop-blur-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                        placeholder="Confirm new password"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={isLoading}
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-lg font-medium rounded-xl text-white bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="flex items-center">
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      {step === 'email' && 'Sending OTP...'}
                      {step === 'otp' && 'Verifying...'}
                      {step === 'password' && 'Resetting Password...'}
                    </>
                  ) : (
                    <>
                      {step === 'email' && 'Send OTP'}
                      {step === 'otp' && 'Verify OTP'}
                      {step === 'password' && 'Reset Password'}
                      <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
                    </>
                  )}
                </span>
              </motion.button>
            </form>

            {/* Back Button */}
            <div className="mt-6 text-center">
              {step === 'email' ? (
                <Link
                  to="/login"
                  className="text-purple-600 hover:text-purple-500 font-medium transition-colors inline-flex items-center"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Login
                </Link>
              ) : (
                <button
                  onClick={() => {
                    if (step === 'otp') setStep('email')
                    else if (step === 'password') setStep('otp')
                    setError('')
                  }}
                  className="text-purple-600 hover:text-purple-500 font-medium transition-colors inline-flex items-center"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </button>
              )}
            </div>
          </motion.div>

          {/* Back to Home */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-center mt-6"
          >
            <Link
              to="/"
              className="text-gray-600 hover:text-purple-600 transition-colors font-medium"
            >
              ← Back to Home
            </Link>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export default ForgotPassword