import React, { createContext, useContext, useState, useEffect } from 'react'

interface User {
  id: string
  name: string
  email: string
  username: string
  role: 'admin' | 'user'
}

interface StoredUser extends User {
  password: string
}

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  login: (username: string, password: string) => Promise<boolean>
  register: (name: string, email: string, password: string) => Promise<boolean>
  logout: () => void
  isAdmin: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)

  // Load user from localStorage on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('photobooth-user')
    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser)
        setUser(parsedUser)
      } catch (error) {
        console.error('Failed to load saved user:', error)
      }
    }
  }, [])

  const login = async (username: string, password: string): Promise<boolean> => {
    // Get stored users from localStorage
    const storedUsers = localStorage.getItem('photobooth-users')
    
    let parsedUsers: StoredUser[] = []
    if (storedUsers) {
      try {
        parsedUsers = JSON.parse(storedUsers)
      } catch (error) {
        console.error('Failed to parse stored users:', error)
      }
    }

    // Add default mock users if no users exist
    const users: StoredUser[] = parsedUsers.length === 0 ? [
      { id: '1', name: 'Admin User', email: 'admin@clicktales.com', username: 'admin', password: 'admin123', role: 'admin' },
      { id: '2', name: 'Test User', email: 'user@clicktales.com', username: 'user', password: 'user123', role: 'user' }
    ] : parsedUsers

    if (parsedUsers.length === 0) {
      localStorage.setItem('photobooth-users', JSON.stringify(users))
    }

    // Find user by email or username
    const foundUser = users.find((u: StoredUser) => 
      (u.email === username || u.username === username) && u.password === password
    )
    
    if (foundUser) {
      const userWithoutPassword = { 
        id: foundUser.id, 
        name: foundUser.name,
        email: foundUser.email,
        username: foundUser.username, 
        role: foundUser.role 
      }
      setUser(userWithoutPassword)
      localStorage.setItem('photobooth-user', JSON.stringify(userWithoutPassword))
      return true
    }
    
    return false
  }

  const register = async (name: string, email: string, password: string): Promise<boolean> => {
    try {
      // Get existing users
      const storedUsers = localStorage.getItem('photobooth-users')
      const users: StoredUser[] = storedUsers ? JSON.parse(storedUsers) : []

      // Check if user already exists
      const existingUser = users.find((u: StoredUser) => u.email === email)
      if (existingUser) {
        return false // User already exists
      }

      // Create new user
      const newUser = {
        id: Date.now().toString(),
        name,
        email,
        username: email.split('@')[0], // Use email prefix as username
        password,
        role: 'user' as const
      }

      users.push(newUser)
      localStorage.setItem('photobooth-users', JSON.stringify(users))

      // Auto-login the new user
      const userWithoutPassword = {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        username: newUser.username,
        role: newUser.role
      }
      setUser(userWithoutPassword)
      localStorage.setItem('photobooth-user', JSON.stringify(userWithoutPassword))
      
      return true
    } catch (error) {
      console.error('Registration failed:', error)
      return false
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('photobooth-user')
  }

  const isAuthenticated = user !== null
  const isAdmin = user?.role === 'admin'

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, register, logout, isAdmin }}>
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
