import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  User,
  ArrowRight,
  Home
} from '../components/icons'
import { useAuth } from '../contexts/AuthContext'

const Login: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true)
  const [loginMode, setLoginMode] = useState<'password' | 'otp'>('password')
  const [otpStep, setOtpStep] = useState<'idle' | 'sending' | 'sent' | 'verifying'>('idle')
  const [showPassword, setShowPassword] = useState(false)
<<<<<<< HEAD
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
=======
  const [loginMode, setLoginMode] = useState<'password' | 'otp' | 'webauthn'>('password')
  const [otpStep, setOtpStep] = useState<'send' | 'verify' | '2fa'>('send')
  const [factorId, setFactorId] = useState<string>('')
>>>>>>> 474ef572850d675b821af8d159b2cb8cd72085a0
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
<<<<<<< HEAD
    otpCode: ''
=======
    otpEmail: '',
    otpCode: '',
    twoFactorCode: ''
>>>>>>> 474ef572850d675b821af8d159b2cb8cd72085a0
  })
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

<<<<<<< HEAD
  const { login, sendSignupOTP, sendOtp, verifyLoginOtp, user } = useAuth()
=======
  const { login, register, socialLogin, sendOtp, verifyOtp, enrollTotp, verifyTotp, verifyWebAuthn } = useAuth()
>>>>>>> 474ef572850d675b821af8d159b2cb8cd72085a0
  const navigate = useNavigate()
  const location = useLocation()
  
  // Get the path to redirect to after successful login
  const from = (location.state as any)?.from?.pathname || '/photobooth'

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate(from, { replace: true })
    }
  }, [user, navigate, from])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (error) setError('')
  }

  const validateForm = () => {
    if (isLogin) {
      if (loginMode === 'password') {
        if (!formData.email.trim() || !formData.password.trim()) {
          setError('Please fill in all fields')
          return false
        }
      } else if (loginMode === 'otp') {
        if (!formData.email.trim()) {
          setError('Please enter your email address')
          return false
        }
      }
    } else {
      if (!formData.name.trim() || !formData.email.trim() || !formData.password.trim() || !formData.confirmPassword.trim()) {
        setError('Please fill in all fields')
        return false
      }

      if (formData.password !== formData.confirmPassword) {
        setError('Passwords do not match')
        return false
      }

      if (formData.password.length < 8) {
        setError('Password must be at least 8 characters long')
        return false
      }

      // Basic email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(formData.email.trim())) {
        setError('Please enter a valid email address')
        return false
      }
    }
    return true
  }

  const handleSendOtp = async () => {
    if (!formData.email.trim()) {
      setError('Please enter your email address')
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email.trim())) {
      setError('Please enter a valid email address')
      return
    }

    setOtpStep('sending')
    setError('')

    try {
      await sendOtp(formData.email.trim())
      setOtpStep('sent')
      console.log('✅ OTP sent successfully')
    } catch (error: any) {
      console.error('Send OTP error:', error)
      setError(error.message || 'Failed to send OTP')
      setOtpStep('idle')
    }
  }

  const handleVerifyOtp = async () => {
    if (!formData.otpCode.trim()) {
      setError('Please enter the OTP code')
      return
    }

    setOtpStep('verifying')
    setError('')

    try {
      const success = await verifyLoginOtp(formData.email.trim(), formData.otpCode.trim())
      if (success) {
        console.log('✅ OTP verification successful, navigating to:', from)
        navigate(from, { replace: true })
      } else {
        setError('Invalid OTP code')
        setOtpStep('sent')
      }
    } catch (error: any) {
      console.error('Verify OTP error:', error)
      setError(error.message || 'Failed to verify OTP')
      setOtpStep('sent')
    }
  }

<<<<<<< HEAD
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!validateForm()) return

    setIsLoading(true)

    console.log('🔄 Login attempt:', {
      email: formData.email.trim(),
      password: formData.password ? '***' : '(empty)',
      isLogin
    })

    try {
      if (isLogin) {
        if (loginMode === 'password') {
          const success = await login(formData.email.trim(), formData.password)
          console.log('Login result:', success)
          if (success) {
            console.log('✅ Login successful, navigating to:', from)
            navigate(from, { replace: true })
          } else {
            console.log('❌ Login failed')
            setError('Invalid email or password')
          }
        }
        // OTP handled separately
      } else {
        // Simplified registration - direct signup without OTP
        console.log('🔄 Starting simplified registration')
        await sendSignupOTP(formData.name.trim(), formData.email.trim(), formData.password)

        // Auto-login after successful registration
        const loginSuccess = await login(formData.email.trim(), formData.password)
        if (loginSuccess) {
          console.log('✅ Registration and auto-login successful')
          navigate('/photobooth', { replace: true })
        } else {
          console.log('✅ Registration successful, please login')
          setIsLogin(true)
          setError('')
          setFormData({ ...formData, password: '', confirmPassword: '' })
=======
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()
  setError('')
  setIsLoading(true)

  try {
        if (isLogin) {
          if (loginMode === 'password' || loginMode === 'webauthn') {
            // Password login logic (required for WebAuthn)
            const result = await login(formData.email, formData.password)
            if (result.success) {
              if (loginMode === 'webauthn') {
                // WebAuthn verification after password login
                const webAuthnResult = await verifyWebAuthn()
                if (webAuthnResult.success) {
                  navigate('/')
                } else {
                  setError(webAuthnResult.error || 'WebAuthn authentication failed')
                }
              } else {
                // Enroll 2FA if required
                const enrollResult = await enrollTotp()
                if (enrollResult.success && enrollResult.data?.id) {
                  setFactorId(enrollResult.data.id)
                  setOtpStep('2fa')
                } else {
                  navigate('/')
                }
              }
            } else {
              setError(result.error || 'Invalid email or password')
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
>>>>>>> 474ef572850d675b821af8d159b2cb8cd72085a0
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
<<<<<<< HEAD
    } catch (error: any) {
      console.error('Login error:', error)
      setError(error.message || 'An error occurred')
    } finally {
      setIsLoading(false)
=======
>>>>>>> 474ef572850d675b821af8d159b2cb8cd72085a0
    }
  } catch {
    setError('Authentication failed. Please try again.')
  } finally {
    setIsLoading(false)
  }
}

  const toggleMode = () => {
    setIsLogin(!isLogin)
<<<<<<< HEAD
    setError('')
    setOtpStep('idle')
=======
    setOtpStep('send')
    setFactorId('')
>>>>>>> 474ef572850d675b821af8d159b2cb8cd72085a0
    setFormData({
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
<<<<<<< HEAD
      otpCode: ''
=======
      otpEmail: '',
      otpCode: '',
      twoFactorCode: ''
>>>>>>> 474ef572850d675b821af8d159b2cb8cd72085a0
    })
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
        {/* Animated Orbs */}
        <motion.div
          className="absolute top-20 left-20 w-72 h-72 bg-purple-500/30 rounded-full blur-3xl"
          animate={{
            x: [0, 100, 0],
            y: [0, -50, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-20 right-20 w-96 h-96 bg-blue-500/30 rounded-full blur-3xl"
          animate={{
            x: [0, -80, 0],
            y: [0, 60, 0],
            scale: [1, 0.8, 1],
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "easeInOut", delay: 5 }}
        />
        <motion.div
          className="absolute top-1/2 left-1/2 w-64 h-64 bg-pink-500/20 rounded-full blur-2xl"
          animate={{
            x: [-50, 50, -50],
            y: [-30, 30, -30],
            scale: [0.8, 1.3, 0.8],
          }}
          transition={{ duration: 30, repeat: Infinity, ease: "easeInOut", delay: 10 }}
        />
      </div>

      {/* Floating Particles */}
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 bg-white/20 rounded-full"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            y: [0, -30, 0],
            opacity: [0.2, 0.8, 0.2],
            scale: [1, 1.5, 1],
          }}
          transition={{
            duration: 3 + Math.random() * 2,
            repeat: Infinity,
            delay: Math.random() * 2,
          }}
        />
      ))}

      {/* Back to Home */}
      <Link
        to="/"
        className="absolute top-6 left-6 z-50 p-3 bg-white/10 backdrop-blur-md rounded-full hover:bg-white/20 transition-all duration-300"
      >
        <Home className="w-6 h-6 text-white" />
      </Link>

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md mx-auto"
        >
          {/* Glassmorphism Container */}
          <div className="bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 shadow-2xl p-6 sm:p-8">
            {/* Toggle Tabs */}
            <div className="flex bg-white/10 rounded-2xl p-1 mb-8">
              <button
                onClick={() => setIsLogin(true)}
                className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-all duration-300 ${
                  isLogin
                    ? 'bg-white text-purple-600 shadow-lg'
                    : 'text-white/80 hover:text-white'
                }`}
              >
                Sign In
              </button>
              <button
                onClick={() => setIsLogin(false)}
                className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-all duration-300 ${
                  !isLogin
                    ? 'bg-white text-purple-600 shadow-lg'
                    : 'text-white/80 hover:text-white'
                }`}
              >
                Register
              </button>
            </div>

            {/* Login Mode Toggle (Sign In Only) */}
            {isLogin && (
              <div className="flex bg-white/5 rounded-xl p-1 mb-6">
                <button
                  onClick={() => {
                    setLoginMode('password')
                    setOtpStep('idle')
                    setError('')
                    setFormData(prev => ({ ...prev, otpCode: '' }))
                  }}
                  className={`flex-1 py-2 px-3 rounded-lg font-medium text-sm transition-all duration-300 ${
                    loginMode === 'password'
                      ? 'bg-white/20 text-white shadow-sm'
                      : 'text-white/60 hover:text-white/80'
                  }`}
                >
                  Password
                </button>
                <button
                  onClick={() => {
                    setLoginMode('otp')
                    setOtpStep('idle')
                    setError('')
                    setFormData(prev => ({ ...prev, password: '', otpCode: '' }))
                  }}
                  className={`flex-1 py-2 px-3 rounded-lg font-medium text-sm transition-all duration-300 ${
                    loginMode === 'otp'
                      ? 'bg-white/20 text-white shadow-sm'
                      : 'text-white/60 hover:text-white/80'
                  }`}
                >
                  OTP
                </button>
              </div>
            )}

            {/* Form Header */}
            <motion.div
              key={isLogin ? 'signin' : 'register'}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
              className="text-center mb-8"
            >
              <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                {isLogin ? 'Welcome Back' : 'Create Account'}
              </h1>
              <p className="text-white/70 text-sm sm:text-base">
                {isLogin 
                  ? 'Sign in to access your photo booth'
                  : 'Join ClickTales to start creating amazing photos'
                }
              </p>
            </motion.div>

            {/* Error Message */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="bg-red-500/20 border border-red-500/50 rounded-xl p-4 mb-6 text-red-100 text-sm"
                >
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
<<<<<<< HEAD
              <AnimatePresence mode="wait">
                <motion.div
                  key={isLogin ? 'signin-form' : 'register-form'}
                  initial={{ opacity: 0, x: isLogin ? -20 : 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: isLogin ? 20 : -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  {/* Name Field (Register Only) */}
                  {!isLogin && (
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/50" />
                      <input
                        type="text"
                        name="name"
                        placeholder="Full Name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className="w-full pl-12 pr-4 py-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                        required={!isLogin}
                      />
                    </div>
                  )}

              {/* Email Field */}
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/50" />
                <input
                  type="email"
                  name="email"
                  placeholder="Email Address"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full pl-12 pr-4 py-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                  required
                />
              </div>

              {/* OTP Code Field (OTP mode only) */}
              {isLogin && loginMode === 'otp' && otpStep !== 'idle' && (
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/50" />
                  <input
                    type="text"
                    name="otpCode"
                    placeholder="Enter OTP Code"
                    value={formData.otpCode}
                    onChange={handleInputChange}
                    className="w-full pl-12 pr-4 py-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                    required
                  />
                </div>
              )}
=======
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

              {isLogin && (loginMode === 'password' || loginMode === 'webauthn') && (
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
>>>>>>> 474ef572850d675b821af8d159b2cb8cd72085a0

                  {/* Password Field (Login password mode or Register) */}
                  {(isLogin && loginMode === 'password') || !isLogin ? (
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/50" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        name="password"
                        placeholder={isLogin ? "Password" : "Password"}
                        value={formData.password}
                        onChange={handleInputChange}
                        className="w-full pl-12 pr-12 py-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white/50 hover:text-white transition-colors"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  ) : null}

                  {/* Confirm Password Field (Register Only) */}
                  {!isLogin && (
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/50" />
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        name="confirmPassword"
                        placeholder="Confirm Password"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        className="w-full pl-12 pr-12 py-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                        required={!isLogin}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white/50 hover:text-white transition-colors"
                      >
                        {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>

              {/* OTP Buttons (OTP mode only) */}
              {isLogin && loginMode === 'otp' && (
                <div className="space-y-4">
                  {otpStep === 'idle' && (
                    <motion.button
                      type="button"
                      onClick={handleSendOtp}
                      disabled={isLoading}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-semibold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isLoading ? (
                        <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <>
                          <span>Send OTP</span>
                          <ArrowRight className="w-5 h-5" />
                        </>
                      )}
                    </motion.button>
                  )}

                  {otpStep === 'sending' && (
                    <motion.button
                      type="button"
                      disabled
                      className="w-full bg-gradient-to-r from-gray-600 to-gray-700 text-white font-semibold py-4 px-6 rounded-xl shadow-lg flex items-center justify-center space-x-2"
                    >
                      <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Sending OTP...</span>
                    </motion.button>
                  )}

                  {otpStep === 'sent' && (
                    <motion.button
                      type="button"
                      onClick={handleVerifyOtp}
                      disabled={isLoading}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isLoading ? (
                        <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <>
                          <span>Verify OTP</span>
                          <ArrowRight className="w-5 h-5" />
                        </>
                      )}
                    </motion.button>
                  )}

                  {otpStep === 'verifying' && (
                    <motion.button
                      type="button"
                      disabled
                      className="w-full bg-gradient-to-r from-gray-600 to-gray-700 text-white font-semibold py-4 px-6 rounded-xl shadow-lg flex items-center justify-center space-x-2"
                    >
                      <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Verifying...</span>
                    </motion.button>
                  )}
                </div>
              )}

<<<<<<< HEAD
              {/* Submit Button (Password mode or Register) */}
              {(!isLogin || loginMode === 'password') && (
                <motion.button
                  type="submit"
                  disabled={isLoading}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
=======
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
>>>>>>> 474ef572850d675b821af8d159b2cb8cd72085a0
                  {isLoading ? (
                    <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>{isLogin ? 'Sign In' : 'Create Account'}</span>
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </motion.button>
              )}
            </form>

<<<<<<< HEAD
            {/* Additional Links */}
            <div className="mt-6 text-center space-y-4">
              {isLogin && (
                <Link
                  to="/forgot-password"
                  className="text-white/70 hover:text-white transition-colors text-sm"
                >
                  Forgot your password?
                </Link>
              )}
              
              <div className="text-white/50 text-sm">
                {isLogin ? "Don't have an account? " : "Already have an account? "}
                <button
                  type="button"
                  onClick={toggleMode}
                  className="text-purple-300 hover:text-purple-200 font-semibold transition-colors"
=======
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
                  onClick={async () => {
                    setError('')
                    setIsLoading(true)
                    const result = await socialLogin('google')
                    setIsLoading(false)
                    if (!result.success) {
                      setError(result.error || 'Google login failed')
                    }
                  }}
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
                  onClick={async () => {
                    setError('')
                    setIsLoading(true)
                    const result = await socialLogin('facebook')
                    setIsLoading(false)
                    if (!result.success) {
                      setError(result.error || 'Facebook login failed')
                    }
                  }}
                  className="w-full inline-flex justify-center py-3 px-4 rounded-xl border border-gray-300 bg-white/50 backdrop-blur-sm text-sm font-medium text-gray-500 hover:bg-white/70 transition-all duration-300"
>>>>>>> 474ef572850d675b821af8d159b2cb8cd72085a0
                >
                  {isLogin ? 'Register here' : 'Sign in here'}
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default Login
