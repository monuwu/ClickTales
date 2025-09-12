import React, { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '../services/supabase'
import type { Session } from '@supabase/supabase-js'
import { generateOTP, storeOTP, verifyOTP } from '../utils/otpGenerator'

interface User {
  id: string
  name: string
  email: string
  username: string
  role: 'admin' | 'user'
}

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  register: (name: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>
  logout: () => Promise<void>
  isAdmin: boolean
  // OTP methods
  sendOtp: (email: string) => Promise<{ success: boolean; error?: string }>
  verifyOtp: (email: string, token: string) => Promise<{ success: boolean; error?: string }>
  // 2FA methods
  enrollTotp: () => Promise<{ success: boolean; data?: any; error?: string }>
  verifyTotp: (factorId: string, code: string) => Promise<{ success: boolean; error?: string }>
  // Session management
  session: Session | null
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

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
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      return { success: false, error: error.message }
    }
    if (data?.user) {
      setUser({
        id: data.user.id,
        name: data.user.user_metadata.full_name || '',
        email: data.user.email || '',
        username: data.user.user_metadata.username || '',
        role: 'user'
      })
      return { success: true }
    }
    return { success: false, error: 'Unknown error' }
  }

  const register = async (name: string, email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: name,
          username: email.split('@')[0]
        }
      }
    })
    if (error) {
      return { success: false, error: error.message }
    }
    if (data?.user) {
      setUser({
        id: data.user.id,
        name,
        email,
        username: email.split('@')[0],
        role: 'user'
      })
      return { success: true }
    }
    return { success: false, error: 'Unknown error' }
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

      const data = await response.json()

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

  const isAuthenticated = user !== null
  const isAdmin = user?.role === 'admin'

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, register, logout, isAdmin, sendOtp, verifyOtp, enrollTotp, verifyTotp, session }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
