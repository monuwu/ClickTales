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
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const { login, sendSignupOTP, user } = useAuth()
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
      if (!formData.email.trim() || !formData.password.trim()) {
        setError('Please fill in all fields')
        return false
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
        const success = await login(formData.email.trim(), formData.password)
        console.log('Login result:', success)
        if (success) {
          console.log('✅ Login successful, navigating to:', from)
          navigate(from, { replace: true })
        } else {
          console.log('❌ Login failed')
          setError('Invalid email or password')
        }
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
        }
      }
    } catch (error: any) {
      console.error('Login error:', error)
      setError(error.message || 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  const toggleMode = () => {
    setIsLogin(!isLogin)
    setError('')
    setFormData({
      name: '',
      email: '',
      password: '',
      confirmPassword: ''
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

                  {/* Password Field */}
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/50" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      placeholder="Password"
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

              {/* Submit Button */}
              <motion.button
                type="submit"
                disabled={isLoading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span>{isLogin ? 'Sign In' : 'Create Account'}</span>
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </motion.button>
            </form>

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
