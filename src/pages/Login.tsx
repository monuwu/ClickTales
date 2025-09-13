import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Camera, Mail, Lock, Eye, EyeOff, User, ArrowRight } from '../components/icons'
import Navigation from '../components/Navigation'
import { useAuth } from '../contexts/AuthContext'

const Login: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const [loginMode, setLoginMode] = useState<'password' | 'otp' | 'webauthn'>('password')
  const [otpStep, setOtpStep] = useState<'send' | 'verify' | '2fa'>('send')
  const [factorId, setFactorId] = useState<string>('')
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    otpEmail: '',
    otpCode: '',
    twoFactorCode: ''
  })
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const { login, register, sendOtp, verifyOtp, enrollTotp, verifyTotp, verifyWebAuthn } = useAuth()
  const navigate = useNavigate()

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()
  setError('')
  setIsLoading(true)

  try {
    if (isLogin) {
      if (loginMode === 'password') {
        // Password login logic
        const result = await login(formData.email, formData.password)
        if (result.success) {
          // Enroll 2FA if required
          const enrollResult = await enrollTotp()
          if (enrollResult.success && enrollResult.data?.id) {
            setFactorId(enrollResult.data.id)
            setOtpStep('2fa')
          } else {
            navigate('/')
          }
        } else {
          setError(result.error || 'Invalid email or password')
        }
        } else if (loginMode === 'webauthn') {
          // WebAuthn login logic
          const result = await verifyWebAuthn('challenge') // Placeholder challenge
          if (result.success) {
            navigate('/')
          } else {
            setError(result.error || 'WebAuthn authentication failed')
          }
        } else if (loginMode === 'otp') {
          if (otpStep === 'send') {
            // Send OTP
            const result = await sendOtp(formData.otpEmail)
            if (result.success) {
              setOtpStep('verify')
            } else {
              setError(result.error || 'Failed to send OTP')
            }
          } else if (otpStep === 'verify') {
            // Verify OTP
            const result = await verifyOtp(formData.otpEmail, formData.otpCode)
            if (result.success) {
              // Enroll 2FA if required
              const enrollResult = await enrollTotp()
              if (enrollResult.success && enrollResult.data?.id) {
                setFactorId(enrollResult.data.id)
                setOtpStep('2fa')
              } else {
                navigate('/')
              }
            } else {
              setError(result.error || 'Invalid OTP code')
            }
          } else if (otpStep === '2fa') {
            // Verify 2FA
            const result = await verifyTotp(factorId, formData.twoFactorCode)
            if (result.success) {
              navigate('/')
            } else {
              setError(result.error || 'Invalid 2FA code')
            }
          }
        }
    } else {
      // Sign up logic
      if (formData.password !== formData.confirmPassword) {
        setError('Passwords do not match')
        setIsLoading(false)
        return
      }

      const result = await register(formData.name, formData.email, formData.password)
      if (result.success) {
        navigate('/')
      } else {
        setError(result.error || 'User with this email already exists')
      }
    }
  } catch {
    setError('Authentication failed. Please try again.')
  } finally {
    setIsLoading(false)
  }
}

  const toggleMode = () => {
    setIsLogin(!isLogin)
    setOtpStep('send')
    setFactorId('')
    setFormData({
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      otpEmail: '',
      otpCode: '',
      twoFactorCode: ''
    })
    setError('')
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
              {isLogin ? 'Welcome Back!' : 'Join ClickTales'}
            </h2>
            <p className="text-gray-600">
              {isLogin 
                ? 'Sign in to continue your photobooth journey' 
                : 'Create your account and start capturing moments'
              }
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
              {!isLogin && (
                <>
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <User className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        id="name"
                        name="name"
                        type="text"
                        required={!isLogin}
                        value={formData.name}
                        onChange={handleInputChange}
                        className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl leading-5 bg-white/50 backdrop-blur-sm placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                        placeholder="Enter your full name"
                      />
                    </div>
                  </div>

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
                        required={!isLogin}
                        value={formData.email}
                        onChange={handleInputChange}
                        className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl leading-5 bg-white/50 backdrop-blur-sm placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                        placeholder="Enter your email"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                      Password
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Lock className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        id="password"
                        name="password"
                        type="password"
                        required={!isLogin}
                        value={formData.password}
                        onChange={handleInputChange}
                        className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl leading-5 bg-white/50 backdrop-blur-sm placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                        placeholder="Enter your password"
                      />
                    </div>
                  </div>
                </>
              )}

              {isLogin && (
                <div>
                  <label htmlFor={loginMode === 'otp' ? 'otpEmail' : 'email'} className="block text-sm font-medium text-gray-700 mb-2">
                    {loginMode === 'otp' ? 'Email Address' : 'Email Address'}
                  </label>
                  {loginMode === 'otp' ? (
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Mail className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        id="otpEmail"
                        name="otpEmail"
                        type="email"
                        required
                        value={formData.otpEmail}
                        onChange={handleInputChange}
                        className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl leading-5 bg-white/50 backdrop-blur-sm placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                        placeholder="Enter your email for OTP"
                      />
                    </div>
                  ) : (
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Mail className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        id="email"
                        name="email"
                        type="email"
                        required
                        value={formData.email}
                        onChange={handleInputChange}
                        className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl leading-5 bg-white/50 backdrop-blur-sm placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                        placeholder="Enter your email"
                      />
                    </div>
                  )}
                </div>
              )}

              {isLogin && loginMode === 'password' && (
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={formData.password}
                      onChange={handleInputChange}
                      className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-xl leading-5 bg-white/50 backdrop-blur-sm placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                      placeholder="Enter your password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                      ) : (
                        <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                      )}
                    </button>
                  </div>
                </div>
              )}

              {isLogin && loginMode === 'otp' && otpStep === 'send' && (
                <div>
                  <button
                    type="button"
                    onClick={async () => {
                      setError('')
                      setIsLoading(true)
                      const result = await sendOtp(formData.otpEmail)
                      setIsLoading(false)
                      if (result.success) {
                        setOtpStep('verify')
                      } else {
                        setError(result.error || 'Failed to send OTP')
                      }
                    }}
                    className="w-full py-3 px-4 border border-purple-600 rounded-xl text-purple-600 font-semibold hover:bg-purple-50 transition"
                  >
                    Send OTP
                  </button>
                </div>
              )}

              {isLogin && loginMode === 'otp' && otpStep === 'verify' && (
                <div>
                  <label htmlFor="otpCode" className="block text-sm font-medium text-gray-700 mb-2">
                    Enter OTP Code
                  </label>
                  <input
                    id="otpCode"
                    name="otpCode"
                    type="text"
                    required
                    value={formData.otpCode}
                    onChange={handleInputChange}
                    className="block w-full py-3 px-4 border border-gray-300 rounded-xl leading-5 bg-white/50 backdrop-blur-sm placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                    placeholder="Enter the OTP code"
                  />
                </div>
              )}

              {isLogin && otpStep === '2fa' && (
                <div>
                  <label htmlFor="twoFactorCode" className="block text-sm font-medium text-gray-700 mb-2">
                    Enter 2FA Code
                  </label>
                  <input
                    id="twoFactorCode"
                    name="twoFactorCode"
                    type="text"
                    required
                    value={formData.twoFactorCode}
                    onChange={handleInputChange}
                    className="block w-full py-3 px-4 border border-gray-300 rounded-xl leading-5 bg-white/50 backdrop-blur-sm placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                    placeholder="Enter your 2FA code"
                  />
                </div>
              )}

              {!isLogin && (
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
                      required={!isLogin}
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl leading-5 bg-white/50 backdrop-blur-sm placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                      placeholder="Confirm your password"
                    />
                  </div>
                </div>
              )}

              {/* Login mode toggle */}
              {isLogin && (
                <div className="mt-4 flex justify-center space-x-2">
                  <button
                    type="button"
                    onClick={() => setLoginMode('password')}
                    className={`px-3 py-2 rounded-xl font-semibold transition text-sm ${
                      loginMode === 'password' ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-700'
                    }`}
                  >
                    Password
                  </button>
                  <button
                    type="button"
                    onClick={() => setLoginMode('otp')}
                    className={`px-3 py-2 rounded-xl font-semibold transition text-sm ${
                      loginMode === 'otp' ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-700'
                    }`}
                  >
                    OTP
                  </button>
                  <button
                    type="button"
                    onClick={() => setLoginMode('webauthn')}
                    className={`px-3 py-2 rounded-xl font-semibold transition text-sm ${
                      loginMode === 'webauthn' ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-700'
                    }`}
                  >
                    WebAuthn
                  </button>
                </div>
              )}

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
                      {isLogin ? 'Signing In...' : 'Creating Account...'}
                    </>
                  ) : (
                    <>
                      {isLogin ? 'Sign In' : 'Create Account'}
                      <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
                    </>
                  )}
                </span>
              </motion.button>
            </form>

            {/* Social Sign In */}
            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white/70 text-gray-500">Or continue with</span>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full inline-flex justify-center py-3 px-4 rounded-xl border border-gray-300 bg-white/50 backdrop-blur-sm text-sm font-medium text-gray-500 hover:bg-white/70 transition-all duration-300"
                >
                  <span className="flex items-center">
                    <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    Google
                  </span>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full inline-flex justify-center py-3 px-4 rounded-xl border border-gray-300 bg-white/50 backdrop-blur-sm text-sm font-medium text-gray-500 hover:bg-white/70 transition-all duration-300"
                >
                  <span className="flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="#1877F2" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                    Facebook
                  </span>
                </motion.button>
              </div>
            </div>

            {/* Toggle between login/signup */}
            <div className="mt-6 text-center">
              <button
                onClick={toggleMode}
                className="text-purple-600 hover:text-purple-500 font-medium transition-colors"
              >
                {isLogin 
                  ? "Don't have an account? Sign up" 
                  : "Already have an account? Sign in"
                }
              </button>
            </div>
          </motion.div>

          {/* Back to home */}
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

export default Login
