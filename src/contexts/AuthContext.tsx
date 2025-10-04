import React, { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '../services/supabase'
import { mockAuth, isSupabaseAvailable } from '../services/mockAuth'
import type { Session } from '@supabase/supabase-js'

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
  verifyOTP: (email: string, otp: string) => Promise<void>
  resendOTP: (email: string) => Promise<void>
  sendLoginOTP: (email: string) => Promise<void>
  verifyLoginOTP: (email: string, otp: string) => Promise<boolean>
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
          name: session.user.user_metadata?.name
        } : null)
        setIsLoading(false)
      }).catch((error: any) => {
        console.error('Failed to get session:', error)
        setIsLoading(false)
      })

      // Listen for auth changes
      const subscription = authService.onAuthStateChange((event: any, session: any) => {
        console.log('Auth state changed:', event, session?.user?.email)
        setSession(session)
        setUser(session?.user ? {
          id: session.user.id,
          email: session.user.email || '',
          name: session.user.user_metadata?.name
        } : null)
        setIsLoading(false)
      })

      // Handle different subscription types
      if ('unsubscribe' in subscription) {
        cleanup = subscription.unsubscribe
      } else if ('data' in subscription && subscription.data?.subscription) {
        cleanup = () => subscription.data.subscription.unsubscribe()
      }
    }).catch(error => {
      console.error('Failed to initialize auth:', error)
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
      const authService = (available && supabase) ? supabase.auth : mockAuth
      
      console.log(`🔄 Attempting login with ${available ? 'Supabase' : 'Mock'} auth`)
      
      const { data, error } = await authService.signInWithPassword({
        email,
        password
      })

      if (error) {
        console.error('Login error:', error.message)
        return false
      }

      if (data.user) {
        setUser({
          id: data.user.id,
          email: data.user.email || '',
          name: data.user.user_metadata?.name
        })
        return true
      }

      return false
    } catch (error) {
      console.error('Login error:', error)
      return false
    }
  }

  const register = async (name: string, email: string, password: string): Promise<boolean> => {
    try {
      const available = await isSupabaseAvailable()
      
      if (available && supabase) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              name
            }
          }
        })

        if (error) {
          console.error('Registration error:', error.message)
          return false
        }

        if (data.user) {
          setUser({
            id: data.user.id,
            email: data.user.email || '',
            name: name
          })
          return true
        }

        return false
      } else {
        // Use mock auth for registration
        console.log('🔄 Using mock auth for registration')
        const { error } = await mockAuth.signUp({
          email: email.toLowerCase().trim(),
          password: password,
          options: {
            data: { name: name }
          }
        })
        
        if (error) {
          console.error('Mock registration error:', error.message)
          return false
        }
        
        console.log('✅ Mock Auth: Registration successful for', email)
        return true
      }
    } catch (error) {
      console.error('Registration error:', error)
      return false
    }
  }

  const sendLoginOTP = async (email: string): Promise<void> => {
    try {
      if (!supabase) {
        throw new Error('Supabase not available')
      }
      
      const { error } = await supabase.auth.signInWithOtp({
        email: email.toLowerCase().trim(),
        options: {
          shouldCreateUser: false
        }
      })

      if (error) {
        console.error('Send login OTP error:', error.message)
        throw new Error(error.message || 'Failed to send login OTP')
      }
    } catch (error) {
      console.error('Send login OTP error:', error)
      throw error
    }
  }

  const verifyLoginOTP = async (email: string, otp: string): Promise<boolean> => {
    try {
      const available = await isSupabaseAvailable()
      
      if (available && supabase) {
        const { data, error } = await supabase.auth.verifyOtp({
          email: email.toLowerCase().trim(),
          token: otp.trim(),
          type: 'email'
        })

        if (error) {
          console.error('Login OTP verification error:', error.message)
          throw new Error(error.message || 'Invalid verification code')
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

        return false
      } else {
        // Mock auth doesn't use OTP for login
        console.log('✅ Mock Auth: Login OTP verification skipped')
        return true
      }
    } catch (error) {
      console.error('Login OTP verification error:', error)
      throw error
    }
  }

  const sendSignupOTP = async (name: string, email: string, password: string): Promise<void> => {
    try {
      // Determine which auth service to use
      const available = await isSupabaseAvailable()
      
      if (available && supabase) {
        const { error } = await supabase.auth.signUp({
          email: email.toLowerCase().trim(),
          password: password,
          options: {
            data: {
              full_name: name,
              name: name
            }
          }
        })

        if (error) {
          console.error('Signup error:', error.message)
          throw new Error(error.message || 'Failed to create account')
        }
      } else {
        // Use mock auth for signup
        console.log('🔄 Using mock auth for signup')
        const { error } = await mockAuth.signUp({
          email: email.toLowerCase().trim(),
          password: password,
          options: {
            data: { name: name }
          }
        })
        
        if (error) {
          console.error('Mock signup error:', error.message)
          throw new Error(error.message || 'Failed to create account')
        }
        
        console.log('✅ Mock Auth: Signup successful for', email)
      }
    } catch (error) {
      console.error('Send signup OTP error:', error)
      throw error
    }
  }

  const verifyOTP = async (email: string, otp: string): Promise<void> => {
    try {
      const available = await isSupabaseAvailable()
      
      if (available && supabase) {
        const { data, error } = await supabase.auth.verifyOtp({
          email: email.toLowerCase().trim(),
          token: otp.trim(),
          type: 'signup'
        })

        if (error) {
          console.error('OTP verification error:', error.message)
          throw new Error(error.message || 'Invalid verification code')
        }

        if (data.user && data.session) {
          setSession(data.session)
          setUser({
            id: data.user.id,
            email: data.user.email || '',
            name: data.user.user_metadata?.name || data.user.user_metadata?.full_name
          })
        }
      } else {
        // Mock auth doesn't use OTP, so just verify the user exists
        console.log('✅ Mock Auth: OTP verification skipped')
      }
    } catch (error) {
      console.error('OTP verification error:', error)
      throw error
    }
  }

  const resendOTP = async (email: string): Promise<void> => {
    try {
      const available = await isSupabaseAvailable()
      
      if (available && supabase) {
        const { error } = await supabase.auth.resend({
          type: 'signup',
          email: email.toLowerCase().trim()
        })

        if (error) {
          console.error('Resend OTP error:', error.message)
          throw new Error(error.message || 'Failed to resend verification code')
        }
      } else {
        // Mock auth doesn't use OTP
        console.log('✅ Mock Auth: Resend OTP skipped')
      }
    } catch (error) {
      console.error('Resend OTP error:', error)
      throw error
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
    verifyOTP,
    resendOTP,
    sendLoginOTP,
    verifyLoginOTP
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}