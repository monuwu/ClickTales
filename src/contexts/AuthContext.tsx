import React, { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '../services/supabase'
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
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ? {
        id: session.user.id,
        email: session.user.email || '',
        name: session.user.user_metadata?.name
      } : null)
      setIsLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session)
        setUser(session?.user ? {
          id: session.user.id,
          email: session.user.email || '',
          name: session.user.user_metadata?.name
        } : null)
        setIsLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
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
    } catch (error) {
      console.error('Registration error:', error)
      return false
    }
  }

  const logout = async (): Promise<void> => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) {
        console.error('Logout error:', error.message)
      }
      setUser(null)
      setSession(null)
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  const sendSignupOTP = async (name: string, email: string, password: string): Promise<void> => {
    try {
      // For signup, we'll register the user directly with email confirmation
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: name
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      })

      if (error) {
        console.error('Signup error:', error.message)
        throw new Error(error.message || 'Failed to sign up')
      }
    } catch (error) {
      console.error('Send signup OTP error:', error)
      throw error
    }
  }

  const verifyOTP = async (email: string, otp: string): Promise<void> => {
    try {
      const { error } = await supabase.auth.verifyOtp({
        email,
        token: otp,
        type: 'email'
      })

      if (error) {
        console.error('OTP verification error:', error.message)
        throw new Error(error.message || 'OTP verification failed')
      }
    } catch (error) {
      console.error('OTP verification error:', error)
      throw error
    }
  }

  const resendOTP = async (email: string): Promise<void> => {
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email
      })

      if (error) {
        console.error('Resend OTP error:', error.message)
        throw new Error(error.message || 'Failed to resend OTP')
      }
    } catch (error) {
      console.error('Resend OTP error:', error)
      throw error
    }
  }

  const sendLoginOTP = async (email: string): Promise<void> => {
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`
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
      const { data, error } = await supabase.auth.verifyOtp({
        email,
        token: otp,
        type: 'email'
      })

      if (error) {
        console.error('Login OTP verification error:', error.message)
        throw new Error(error.message || 'Login OTP verification failed')
      }

      if (data.user && data.session) {
        setSession(data.session)
        setUser({
          id: data.user.id,
          email: data.user.email || '',
          name: data.user.user_metadata?.name
        })
        return true
      }

      return false
    } catch (error) {
      console.error('Login OTP verification error:', error)
      throw error
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