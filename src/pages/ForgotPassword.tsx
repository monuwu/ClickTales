import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Camera,
  Mail,
  ArrowRight,
  ArrowLeft
} from '../components/icons'
import Navigation from '../components/Navigation'

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      // TODO: Implement password reset functionality
      // For now, just simulate the process
      await new Promise(resolve => setTimeout(resolve, 1500))
      setIsSubmitted(true)
    } catch (err) {
      console.error('Password reset error:', err)
      setError('Failed to send reset email. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-white font-inter">
        <Navigation />

        <div className="flex items-center justify-center px-4 sm:px-6 lg:px-8 py-20">
          <div className="max-w-md w-full">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center"
            >
              <div className="flex items-center justify-center mb-6">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2 }}
                  className="bg-gradient-to-br from-green-500 to-emerald-500 p-3 rounded-2xl shadow-lg"
                >
                  <Mail className="h-8 w-8 text-white" />
                </motion.div>
              </div>

              <h2 className="text-3xl font-poppins font-bold text-gray-900 mb-4">
                Check Your Email
              </h2>
              
              <div className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 p-8">
                <p className="text-gray-600 mb-6">
                  We've sent a password reset link to
                </p>
                <p className="font-semibold text-purple-600 mb-6">
                  {email}
                </p>
                <p className="text-sm text-gray-500 mb-8">
                  Please check your email and click the link to reset your password. 
                  If you don't see the email, check your spam folder.
                </p>

                <div className="space-y-4">
                  <Link
                    to="/login"
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl inline-flex items-center justify-center"
                  >
                    <ArrowLeft className="mr-2 h-5 w-5" />
                    Back to Login
                  </Link>
                  
                  <button
                    onClick={() => {
                      setIsSubmitted(false)
                      setEmail('')
                    }}
                    className="w-full text-purple-600 hover:text-purple-500 font-medium transition-colors py-2"
                  >
                    Send to different email
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    )
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
                <Camera className="h-8 w-8 text-white" />
              </motion.div>
            </div>

            <h2 className="text-3xl font-poppins font-bold text-gray-900 mb-2">
              Forgot Password?
            </h2>
            <p className="text-gray-600">
              No worries! Enter your email and we'll send you a reset link.
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
              {/* Email */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
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
                      Sending Reset Link...
                    </>
                  ) : (
                    <>
                      Send Reset Link
                      <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
                    </>
                  )}
                </span>
              </motion.button>
            </form>

            {/* Back to Login */}
            <div className="mt-6 text-center">
              <Link
                to="/login"
                className="text-purple-600 hover:text-purple-500 font-medium transition-colors inline-flex items-center"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Login
              </Link>
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