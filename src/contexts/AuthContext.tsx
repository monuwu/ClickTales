import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { authAPI, type User, type AuthResponse } from '../services/api'

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  loading: boolean
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  register: (userData: { name: string, email: string, username: string, password: string }) => Promise<{ success: boolean; error?: string }>
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
  isAdmin: boolean
  isModerator: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState<boolean>(true)

  // Load user from token on mount
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        if (authAPI.isAuthenticated()) {
          // Get user from token first (fast)
          const tokenUser = authAPI.getCurrentUser()
          if (tokenUser) {
            setUser(tokenUser)
          }

          // Then fetch fresh profile data
          const profileResponse = await authAPI.getProfile()
          if (profileResponse.success && profileResponse.data) {
            setUser(profileResponse.data.user)
          } else if (!profileResponse.success) {
            // Token might be invalid, clear it
            setUser(null)
          }
        }
      } catch (error) {
        console.error('Failed to initialize auth:', error)
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    initializeAuth()
  }, [])

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      setLoading(true)
      const response: AuthResponse = await authAPI.login(email, password)
      
      if (response.success && response.data) {
        setUser(response.data.user)
        return { success: true }
      } else {
        return { 
          success: false, 
          error: response.error || response.message || 'Login failed' 
        }
      }
    } catch (error) {
      console.error('Login error:', error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Login failed' 
      }
    } finally {
      setLoading(false)
    }
  }

  const register = async (userData: { 
    name: string
    email: string
    username: string
    password: string 
  }): Promise<{ success: boolean; error?: string }> => {
    try {
      setLoading(true)
      const response: AuthResponse = await authAPI.register(userData)
      
      if (response.success && response.data) {
        setUser(response.data.user)
        return { success: true }
      } else {
        return { 
          success: false, 
          error: response.error || response.message || 'Registration failed' 
        }
      }
    } catch (error) {
      console.error('Registration error:', error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Registration failed' 
      }
    } finally {
      setLoading(false)
    }
  }

  const logout = async (): Promise<void> => {
    try {
      await authAPI.logout()
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      setUser(null)
    }
  }

  const refreshUser = useCallback(async (): Promise<void> => {
    try {
      if (authAPI.isAuthenticated()) {
        const response = await authAPI.getProfile()
        if (response.success && response.data) {
          setUser(response.data.user)
        }
      }
    } catch (error) {
      console.error('Failed to refresh user:', error)
    }
  }, [])

  const isAuthenticated = user !== null && authAPI.isAuthenticated()
  const isAdmin = user?.role === 'ADMIN'
  const isModerator = user?.role === 'MODERATOR' || isAdmin

  return (
    <AuthContext.Provider value={{ 
      user, 
      isAuthenticated, 
      loading, 
      login, 
      register, 
      logout, 
      refreshUser,
      isAdmin,
      isModerator
    }}>
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
