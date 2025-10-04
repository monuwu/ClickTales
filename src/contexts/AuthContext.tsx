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
    sendSignupOTP
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}