import React, { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '../services/supabase'
import type { Session } from '@supabase/supabase-js'
import { generateOTP } from '../utils/otpGenerator'
import { mockAuth, isSupabaseAvailable } from '../services/mockAuth'

interface User {
  id: string
  email: string
  name?: string
}

interface AuthContextType {
  user: User | null
  session: Session | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<boolean>
  register: (name: string, email: string, password: string) => Promise<boolean>
  logout: () => Promise<void>
  sendSignupOTP: (name: string, email: string, password: string) => Promise<void>
  sendOtp: (email: string) => Promise<void>
  verifyLoginOtp: (email: string, token: string) => Promise<boolean>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

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
          // If user already exists, automatically send OTP for login instead
          if (error.message === 'User already exists') {
            console.log('🔄 User exists, switching to OTP login flow')
            await sendOtp(email.toLowerCase().trim())
            return // Don't throw error, just send OTP
          }
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
      // Always use SQLite3 via Express backend for OTP
      const otpCode = generateOTP()

      // Send OTP via Express backend (which stores in SQLite3)
      const response = await fetch('/api/send-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email.toLowerCase().trim(),
          otpCode: otpCode
        })
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to send OTP')
      }

      console.log(`✅ SQLite3 OTP sent to ${email} via Express backend`)
    } catch (error) {
      console.error('Send OTP error:', error)
      throw error
    }
  }

  const verifyLoginOtp = async (email: string, token: string): Promise<boolean> => {
    try {
      // Always use SQLite3 via Express backend for OTP verification
      const response = await fetch('/api/verify-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email.toLowerCase().trim(),
          code: token.trim()
        })
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        console.error('SQLite3 verify OTP error:', data.error)
        return false
      }

      // After successful OTP verification, create session for main app functionality
      const available = await isSupabaseAvailable()
      if (available && supabase) {
        try {
          // Use anonymous sign-in for Supabase session after OTP verification
          const { data: anonData, error: anonError } = await supabase.auth.signInAnonymously({
            options: {
              data: {
                email: email.toLowerCase().trim(),
                name: email.split('@')[0],
                auth_method: 'otp_sqlite3'
              }
            }
          })

          if (anonError) {
            console.error('Supabase anonymous sign-in error:', anonError.message)
            // Fall back to mock session
            setUser({
              id: `otp-user-${Date.now()}`,
              email: email.toLowerCase().trim(),
              name: email.split('@')[0]
            })
            setSession({ user: { id: `otp-user-${Date.now()}`, email: email.toLowerCase().trim() } } as Session)
          } else if (anonData.user && anonData.session) {
            setSession(anonData.session)
            const userName = email.split('@')[0]
            setUser({
              id: anonData.user.id,
              email: email.toLowerCase().trim(), // Use the OTP-verified email
              name: userName
            })
            console.log('✅ Supabase anonymous session created for OTP user')
            console.log('👤 User set with name:', userName, 'and email:', email.toLowerCase().trim())
          }
        } catch (error) {
          console.error('Supabase session creation error:', error)
          // Fall back to mock session
          const userName = email.split('@')[0]
          setUser({
            id: `otp-user-${Date.now()}`,
            email: email.toLowerCase().trim(),
            name: userName
          })
          setSession({ user: { id: `otp-user-${Date.now()}`, email: email.toLowerCase().trim() } } as Session)
          console.log('👤 Fallback user set with name:', userName, 'and email:', email.toLowerCase().trim())
        }
      } else {
        // Fallback session for when Supabase is unavailable
        const userName = email.split('@')[0]
        setUser({
          id: `otp-user-${Date.now()}`,
          email: email.toLowerCase().trim(),
          name: userName
        })
        setSession({ user: { id: `otp-user-${Date.now()}`, email: email.toLowerCase().trim() } } as Session)
        console.log('👤 Mock user set with name:', userName, 'and email:', email.toLowerCase().trim())
      }

      console.log('✅ SQLite3: OTP verification successful')
      return true
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
