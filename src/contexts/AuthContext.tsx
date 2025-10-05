<<<<<<< HEAD
import React, { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '../services/supabase'
import { mockAuth, isSupabaseAvailable } from '../services/mockAuth'
import { sendOTP } from '../services/emailService.js'
import { generateOTP } from '../utils/otpGenerator'
import type { Session } from '@supabase/supabase-js'
=======
 import React, { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '../services/supabase'
import type { Session } from '@supabase/supabase-js'
import { generateOTP, storeOTP, verifyOTP } from '../utils/otpGenerator'
import { startRegistration, startAuthentication } from '@simplewebauthn/browser'
>>>>>>> 474ef572850d675b821af8d159b2cb8cd72085a0

interface User {
  id: string
  email: string
<<<<<<< HEAD
  name?: string
=======
  username: string
  role: 'admin' | 'user'
>>>>>>> 474ef572850d675b821af8d159b2cb8cd72085a0
}

interface AuthContextType {
  user: User | null
<<<<<<< HEAD
  session: Session | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<boolean>
  register: (name: string, email: string, password: string) => Promise<boolean>
  logout: () => Promise<void>
  sendSignupOTP: (name: string, email: string, password: string) => Promise<void>
  sendOtp: (email: string) => Promise<void>
  verifyLoginOtp: (email: string, token: string) => Promise<boolean>
=======
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  register: (name: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>
  socialLogin: (provider: 'google' | 'facebook') => Promise<{ success: boolean; error?: string }>
  logout: () => Promise<void>
  isAdmin: boolean
  // OTP methods
  sendOtp: (email: string) => Promise<{ success: boolean; error?: string }>
  verifyOtp: (email: string, token: string) => Promise<{ success: boolean; error?: string }>
  // 2FA methods
  enrollTotp: () => Promise<{ success: boolean; data?: any; error?: string }>
  verifyTotp: (factorId: string, code: string) => Promise<{ success: boolean; error?: string }>
  // WebAuthn methods
  enrollWebAuthn: () => Promise<{ success: boolean; data?: any; error?: string }>
  verifyWebAuthn: () => Promise<{ success: boolean; error?: string }>
  hasWebAuthnCredentials: () => Promise<boolean>
  // Session management
  session: Session | null
>>>>>>> 474ef572850d675b821af8d159b2cb8cd72085a0
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

<<<<<<< HEAD
=======
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)

  useEffect(() => {
    async function loadSession() {
      const { data } = await supabase.auth.getSession()
      setSession(data.session)
      if (data.session?.user) {
        const u = data.session.user
        setUser({
          id: u.id,
          name: u.user_metadata.full_name || '',
          email: u.email || '',
          username: u.user_metadata.username || '',
          role: 'user'
        })
      }
    }
    loadSession()

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      if (session?.user) {
        const u = session.user
        setUser({
          id: u.id,
          name: u.user_metadata.full_name || '',
          email: u.email || '',
          username: u.user_metadata.username || '',
          role: 'user'
        })
      } else {
        setUser(null)
      }
    })

    return () => {
      authListener?.subscription.unsubscribe()
    }
  }, [])

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await fetch('/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })

      if (!response.ok) {
        throw new Error(`Login failed: ${response.status} ${response.statusText}`)
      }

      let data
      try {
        data = await response.json()
      } catch (parseError: any) {
        if (parseError.message.includes("Unexpected token '<'")) {
          throw new Error('Backend server not responding properly. Please ensure the server is running on port 4000.')
        }
        throw new Error('Invalid response from server')
      }

      if (!data.success) {
        return { success: false, error: data.error || 'Login failed' }
      }
      setUser({
        id: data.user.id,
        name: data.user.name || '',
        email: data.user.email,
        username: data.user.username || '',
        role: data.user.role
      })
      return { success: true }
    } catch (err: any) {
      return { success: false, error: err.message || 'Login failed' }
    }
  }

  const register = async (name: string, email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await fetch('/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, username: email.split('@')[0] })
      })

      if (!response.ok) {
        throw new Error(`Registration failed: ${response.status} ${response.statusText}`)
      }

      let data
      try {
        data = await response.json()
      } catch (parseError: any) {
        if (parseError.message.includes("Unexpected token '<'")) {
          throw new Error('Backend server not responding properly. Please ensure the server is running on port 4000.')
        }
        throw new Error('Invalid response from server')
      }

      if (!data.success) {
        return { success: false, error: data.error || 'Registration failed' }
      }
      setUser({
        id: data.user?.id || '',
        name,
        email,
        username: email.split('@')[0],
        role: 'user'
      })
      return { success: true }
    } catch (err: any) {
      return { success: false, error: err.message || 'Registration failed' }
    }
  }

  const socialLogin = async (provider: 'google' | 'facebook'): Promise<{ success: boolean; error?: string }> => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: window.location.origin
      }
    })
    if (error) {
      return { success: false, error: error.message }
    }
    // OAuth will redirect, so success is assumed if no error
    return { success: true }
  }

  const logout = async (): Promise<void> => {
    await supabase.auth.signOut()
    setUser(null)
    setSession(null)
  }

  const sendOtp = async (email: string): Promise<{ success: boolean; error?: string }> => {
    try {
      console.log('Generating OTP for:', email)

      // Generate numeric OTP code
      const otpCode = generateOTP()
      console.log('Generated OTP:', otpCode)

      // Store OTP for verification
      storeOTP(email, otpCode)

      // Send OTP via backend API
      const response = await fetch('/send-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, otpCode })
      })

      if (!response.ok) {
        if (response.status === 429) {
          throw new Error('Too many OTP requests. Please wait before trying again.')
        }
        throw new Error(`Failed to send OTP: ${response.status} ${response.statusText}`)
      }

      let data
      try {
        const text = await response.text()
        if (!text.trim()) {
          throw new Error('Empty response from server')
        }
        data = JSON.parse(text)
      } catch (parseError: any) {
        if (parseError.message.includes("Unexpected token '<'")) {
          throw new Error('Backend server not responding properly. Please ensure the OTP server is running on port 4000.')
        }
        if (parseError.message.includes('Unexpected end of JSON input') || parseError.message.includes('Empty response')) {
          throw new Error('Server returned an empty or invalid response. Please check if the OTP server is running.')
        }
        throw new Error('Invalid JSON response from server')
      }

      if (!data.success) {
        throw new Error(data.error || 'Failed to send OTP')
      }

      console.log(`OTP email sent to ${email} via backend API`)
      return { success: true }
    } catch (err: any) {
      console.error('OTP send error:', err)
      return { success: false, error: err.message || 'Failed to send OTP' }
    }
  }

  const verifyOtp = async (email: string, token: string): Promise<{ success: boolean; error?: string }> => {
    // Use local OTP verification instead of supabase
    const isValid = verifyOTP(email, token)
    if (!isValid) {
      return { success: false, error: 'Invalid or expired OTP' }
    }
    return { success: true }
  }

  // 2FA methods (TOTP)
  const enrollTotp = async (): Promise<{ success: boolean; data?: any; error?: string }> => {
    const { data, error } = await supabase.auth.mfa.enroll({ factorType: 'totp' })
    if (error) {
      return { success: false, error: error.message }
    }
    return { success: true, data }
  }

  const verifyTotp = async (factorId: string, code: string): Promise<{ success: boolean; error?: string }> => {
    const { error } = await supabase.auth.mfa.verify({ factorId, code, challengeId: '' })
    if (error) {
      return { success: false, error: error.message }
    }
    return { success: true }
  }

  // WebAuthn methods
  const enrollWebAuthn = async (): Promise<{ success: boolean; data?: any; error?: string }> => {
    try {
      if (!user) {
        return { success: false, error: 'User not authenticated' }
      }

      // Fetch registration options from server
      const optionsResponse = await fetch(`/webauthn/register-options?email=${encodeURIComponent(user.email)}`)
      if (!optionsResponse.ok) {
        throw new Error(`Failed to get registration options: ${optionsResponse.status} ${optionsResponse.statusText}`)
      }
      let registrationOptions
      try {
        registrationOptions = await optionsResponse.json()
      } catch (parseError: any) {
        if (parseError.message.includes("Unexpected token '<'")) {
          throw new Error('Backend server not responding properly. Please ensure the server is running on port 4000.')
        }
        throw new Error('Invalid response from server')
      }

      // Start registration
      const credential = await startRegistration({ optionsJSON: registrationOptions })

      // Send credential to server for verification
      const registerResponse = await fetch('/webauthn/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user.email, attestationResponse: credential })
      })

      if (!registerResponse.ok) {
        let errorData
        try {
          errorData = await registerResponse.json()
        } catch (parseError: any) {
          if (parseError.message.includes("Unexpected token '<'")) {
            throw new Error('Backend server not responding properly. Please ensure the server is running on port 4000.')
          }
          throw new Error('Invalid response from server')
        }
        throw new Error(errorData.error || 'Registration failed')
      }

      let result
      try {
        result = await registerResponse.json()
      } catch (parseError: any) {
        if (parseError.message.includes("Unexpected token '<'")) {
          throw new Error('Backend server not responding properly. Please ensure the server is running on port 4000.')
        }
        throw new Error('Invalid response from server')
      }
      if (!result.success) {
        throw new Error(result.error || 'Registration failed')
      }

      return { success: true, data: credential }
    } catch (error: any) {
      console.error('WebAuthn enrollment error:', error)
      return { success: false, error: error.message || 'Failed to enroll WebAuthn' }
    }
  }

  const verifyWebAuthn = async (): Promise<{ success: boolean; error?: string }> => {
    try {
      if (!user) {
        return { success: false, error: 'User not authenticated' }
      }

      // Fetch authentication options from server
      const optionsResponse = await fetch(`/webauthn/authenticate-options?email=${encodeURIComponent(user.email)}`)
      if (!optionsResponse.ok) {
        throw new Error(`Failed to get authentication options: ${optionsResponse.status} ${optionsResponse.statusText}`)
      }
      let authenticationOptions
      try {
        authenticationOptions = await optionsResponse.json()
      } catch (parseError: any) {
        if (parseError.message.includes("Unexpected token '<'")) {
          throw new Error('Backend server not responding properly. Please ensure the server is running on port 4000.')
        }
        throw new Error('Invalid response from server')
      }

      // Start authentication
      const assertion = await startAuthentication({ optionsJSON: authenticationOptions })

      // Send assertion to server for verification
      const authResponse = await fetch('/webauthn/authenticate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user.email, assertionResponse: assertion })
      })

      if (!authResponse.ok) {
        let errorData
        try {
          errorData = await authResponse.json()
        } catch (parseError: any) {
          if (parseError.message.includes("Unexpected token '<'")) {
            throw new Error('Backend server not responding properly. Please ensure the server is running on port 4000.')
          }
          throw new Error('Invalid response from server')
        }
        throw new Error(errorData.error || 'Authentication failed')
      }

      let result
      try {
        result = await authResponse.json()
      } catch (parseError: any) {
        if (parseError.message.includes("Unexpected token '<'")) {
          throw new Error('Backend server not responding properly. Please ensure the server is running on port 4000.')
        }
        throw new Error('Invalid response from server')
      }
      if (!result.success) {
        throw new Error(result.error || 'Authentication failed')
      }

      return { success: true }
    } catch (error: any) {
      console.error('WebAuthn verification error:', error)
      return { success: false, error: error.message || 'Failed to verify WebAuthn' }
    }
  }

  const hasWebAuthnCredentials = async (): Promise<boolean> => {
    try {
      if (!user) return false
      const response = await fetch(`/webauthn/authenticate-options?email=${encodeURIComponent(user.email)}`)
      return response.ok
    } catch {
      return false
    }
  }

  const isAuthenticated = user !== null
  const isAdmin = user?.role === 'admin'

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, register, socialLogin, logout, isAdmin, sendOtp, verifyOtp, enrollTotp, verifyTotp, enrollWebAuthn, verifyWebAuthn, hasWebAuthnCredentials, session }}>
      {children}
    </AuthContext.Provider>
  )
}

>>>>>>> 474ef572850d675b821af8d159b2cb8cd72085a0
export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [otpCodes, setOtpCodes] = useState<{ [email: string]: { code: string; name: string } }>({})

  useEffect(() => {
    let cleanup: (() => void) | undefined
    
    // Check if Supabase is available
    isSupabaseAvailable().then(available => {
      console.log(available ? '✅ Using Supabase auth' : '🔄 Using mock auth (Supabase unavailable)')
      
      const authService = (available && supabase) ? supabase.auth : mockAuth
      
      // Get initial session
      authService.getSession().then(({ data: { session } }: { data: { session: any } }) => {
        setSession(session)
        setUser(session?.user ? {
          id: session.user.id,
          email: session.user.email || '',
          name: session.user.user_metadata?.name || session.user.user_metadata?.full_name
        } : null)
        setIsLoading(false)
      })

      // Listen for auth changes  
      if (available && supabase) {
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          async (event: string, session: any) => {
            console.log('🔄 Auth state changed:', event)
            setSession(session)
            setUser(session?.user ? {
              id: session.user.id,
              email: session.user.email || '',
              name: session.user.user_metadata?.name || session.user.user_metadata?.full_name
            } : null)
            setIsLoading(false)
          }
        )
        cleanup = () => subscription?.unsubscribe()
      } else {
        const subscription = mockAuth.onAuthStateChange(
          async (event: string, session: any) => {
            console.log('🔄 Mock Auth state changed:', event)
            setSession(session)
            setUser(session?.user ? {
              id: session.user.id,
              email: session.user.email || '',
              name: session.user.user_metadata?.name
            } : null)
            setIsLoading(false)
          }
        )
        cleanup = () => subscription?.unsubscribe?.()
      }
    }).catch(error => {
      console.error('Auth initialization error:', error)
      setIsLoading(false)
    })

    return () => {
      if (cleanup) cleanup()
    }
  }, [])

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      // Determine which auth service to use
      const available = await isSupabaseAvailable()
      
      if (available && supabase) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email.toLowerCase().trim(),
          password: password.trim()
        })

        if (error) {
          console.error('Supabase login error:', error.message)
          return false
        }

        if (data.user && data.session) {
          setSession(data.session)
          setUser({
            id: data.user.id,
            email: data.user.email || '',
            name: data.user.user_metadata?.name || data.user.user_metadata?.full_name
          })
          return true
        }
      } else {
        // Use mock auth
        const { data, error } = await mockAuth.signInWithPassword({
          email: email.toLowerCase().trim(),
          password: password.trim()
        })

        if (error) {
          console.error('Mock auth login error:', error.message)
          return false
        }

        if (data.user) {
          setUser({
            id: data.user.id,
            email: data.user.email || '',
            name: data.user.user_metadata?.name
          })
          setSession(data.session)
          return true
        }
      }
      
      return false
    } catch (error) {
      console.error('Login error:', error)
      return false
    }
  }

  const register = async (name: string, email: string, password: string): Promise<boolean> => {
    try {
      // Determine which auth service to use
      const available = await isSupabaseAvailable()
      
      if (available && supabase) {
        const { data, error } = await supabase.auth.signUp({
          email: email.toLowerCase().trim(),
          password: password.trim(),
          options: {
            data: {
              name: name.trim()
            }
          }
        })

        if (error) {
          console.error('Supabase registration error:', error.message)
          return false
        }

        if (data.user) {
          // For Supabase, user needs to verify email first
          console.log('✅ Supabase: Registration successful, check email for verification')
          return true
        }
      } else {
        // Use mock auth with auto-login
        console.log('🔄 Mock Auth: Auto-registering and logging in')
        const { data, error } = await mockAuth.signUp({
          email: email.toLowerCase().trim(),
          password: password.trim(),
          options: {
            data: {
              name: name.trim()
            }
          }
        })

        if (error) {
          console.error('Mock auth registration error:', error.message)
          return false
        }

        if (data.user) {
          setUser({
            id: data.user.id,
            email: data.user.email || '',
            name: data.user.user_metadata?.name
          })
          setSession(data.session)
          console.log('✅ Mock Auth: Registration and auto-login successful')
          return true
        }
      }
      
      return false
    } catch (error) {
      console.error('Registration error:', error)
      return false
    }
  }

  const sendSignupOTP = async (name: string, email: string, password: string): Promise<void> => {
    try {
      // Determine which auth service to use
      const available = await isSupabaseAvailable()
      
      if (available && supabase) {
        const { error } = await supabase.auth.signUp({
          email: email.toLowerCase().trim(),
          password: password.trim(),
          options: {
            data: {
              name: name.trim(),
              full_name: name.trim()
            }
          }
        })

        if (error) {
          console.error('Supabase signup OTP error:', error.message)
          throw new Error(error.message || 'Failed to send verification email')
        }
        
        console.log('✅ Supabase: Verification email sent to', email)
      } else {
        // Mock auth - auto register and login
        const { data, error } = await mockAuth.signUp({
          email: email.toLowerCase().trim(),
          password: password.trim(),
          options: {
            data: {
              name: name.trim()
            }
          }
        })

        if (error) {
          console.error('Mock auth signup error:', error.message)
          throw error
        }

        if (data.user) {
          setUser({
            id: data.user.id,
            email: data.user.email || '',
            name: data.user.user_metadata?.name
          })
          setSession(data.session)
        }
        
        console.log('✅ Mock Auth: Signup successful for', email)
      }
    } catch (error) {
      console.error('Send signup OTP error:', error)
      throw error
    }
  }

  const sendOtp = async (email: string): Promise<void> => {
    try {
      // Generate 6-digit OTP code
      const otpCode = generateOTP()

      // Send OTP via email service
      const success = await sendOTP({
        to_email: email.toLowerCase().trim(),
        otp_code: otpCode
      })

      if (!success) {
        throw new Error('Failed to send OTP email')
      }

      // Store OTP code for verification with name
      const name = email.split('@')[0] // Use email prefix as name
      setOtpCodes(prev => ({ ...prev, [email.toLowerCase().trim()]: { code: otpCode, name } }))
      console.log(`✅ OTP sent to ${email} with code: ${otpCode}`)
    } catch (error) {
      console.error('Send OTP error:', error)
      throw error
    }
  }

  const verifyLoginOtp = async (email: string, token: string): Promise<boolean> => {
    try {
      // Determine which auth service to use
      const available = await isSupabaseAvailable()

      if (available && supabase) {
        const { data, error } = await supabase.auth.verifyOtp({
          email: email.toLowerCase().trim(),
          token: token.trim(),
          type: 'email'
        })

        if (error) {
          console.error('Supabase verify OTP error:', error.message)
          return false
        }

        if (data.user && data.session) {
          setSession(data.session)
          setUser({
            id: data.user.id,
            email: data.user.email || '',
            name: data.user.user_metadata?.name || data.user.user_metadata?.full_name
          })
          console.log('✅ Supabase: OTP verification successful')
          return true
        }
      } else {
        // Mock auth - verify against stored OTP code
        const storedData = otpCodes[email.toLowerCase().trim()]
        if (storedData && storedData.code === token) {
          // Clear the used OTP code
          setOtpCodes(prev => {
            const newCodes = { ...prev }
            delete newCodes[email.toLowerCase().trim()]
            return newCodes
          })
          setUser({
            id: 'mock-user-id',
            email: email.toLowerCase().trim(),
            name: storedData.name
          })
          setSession({ user: { id: 'mock-user-id', email: email.toLowerCase().trim() } } as Session)
          console.log('✅ Mock Auth: OTP verification successful')
          return true
        } else {
          console.error('Mock auth verify OTP error: Invalid OTP')
          return false
        }
      }

      return false
    } catch (error) {
      console.error('Verify OTP error:', error)
      return false
    }
  }

  const logout = async (): Promise<void> => {
    try {
      // Determine which auth service to use
      const available = await isSupabaseAvailable()
      const authService = (available && supabase) ? supabase.auth : mockAuth

      const { error } = await authService.signOut()
      if (error) {
        console.error('Logout error:', error.message)
      }
      setUser(null)
      setSession(null)
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  const value: AuthContextType = {
    user,
    session,
    isLoading,
    login,
    register,
    logout,
    sendSignupOTP,
    sendOtp,
    verifyLoginOtp
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}