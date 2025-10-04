// Mock authentication service for development when Supabase is unavailable
import type { Session } from '@supabase/supabase-js'

interface MockUser {
  id: string
  email: string
  name?: string
}

class MockAuthService {
  private users: Map<string, { email: string; password: string; name?: string; id: string }> = new Map()
  private currentUser: MockUser | null = null
  private currentSession: Session | null = null

  constructor() {
    // Add some default test users
    this.users.set('test@example.com', {
      id: 'mock-user-1',
      email: 'test@example.com',
      password: 'password123',
      name: 'Test User'
    })
    
    this.users.set('demo@clicktales.com', {
      id: 'mock-user-2', 
      email: 'demo@clicktales.com',
      password: 'demo123',
      name: 'Demo User'
    })
    
    this.users.set('monicams0108@gmail.com', {
      id: 'mock-user-3',
      email: 'monicams0108@gmail.com', 
      password: 'password123',
      name: 'Monica'
    })

    // Check if user was previously logged in
    const savedUser = localStorage.getItem('mockAuthUser')
    if (savedUser) {
      this.currentUser = JSON.parse(savedUser)
    }
  }

  async signInWithPassword({ email, password }: { email: string; password: string }) {
    console.log('🔄 Mock Auth: Attempting login for', email)
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500))
    
    const userEmail = email.toLowerCase().trim()
    let user = this.users.get(userEmail)
    
    // If user doesn't exist, auto-register them for development ease
    if (!user) {
      console.log('🔄 Mock Auth: User not found, auto-registering', email)
      user = {
        id: `mock-user-${Date.now()}`,
        email: userEmail,
        password: password.trim(), // Trim password during registration
        name: email.split('@')[0] // Use email prefix as name
      }
      this.users.set(userEmail, user)
      console.log('✅ Mock Auth: Auto-registered user', email)
    }
    
    // Check password (with multiple fallback options for development ease)
    const trimmedPassword = password.trim()
    const storedPassword = user.password.trim()
    
    if (storedPassword !== trimmedPassword) {
      // For development convenience, allow these universal passwords
      const universalPasswords = ['password123', 'demo123', 'admin123']
      if (!universalPasswords.includes(trimmedPassword)) {
        console.log('❌ Mock Auth: Password mismatch. User password:', `"${storedPassword}"`, 'Attempted:', `"${trimmedPassword}"`)
        return {
          data: { user: null, session: null },
          error: { message: 'Invalid email or password' }
        }
      } else {
        console.log('✅ Mock Auth: Using universal password for', email)
      }
    }

    this.currentUser = {
      id: user.id,
      email: user.email,
      name: user.name
    }

    // Create a mock session
    this.currentSession = {
      access_token: 'mock-access-token',
      refresh_token: 'mock-refresh-token',
      expires_in: 3600,
      token_type: 'bearer',
      user: {
        id: user.id,
        email: user.email,
        user_metadata: { name: user.name },
        aud: 'authenticated',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        app_metadata: {},
        role: 'authenticated'
      }
    } as Session

    // Persist to localStorage
    localStorage.setItem('mockAuthUser', JSON.stringify(this.currentUser))
    localStorage.setItem('mockAuthSession', JSON.stringify(this.currentSession))

    console.log('✅ Mock Auth: Login successful for', email)

    return {
      data: { 
        user: this.currentSession.user,
        session: this.currentSession 
      },
      error: null
    }
  }

  async signUp({ email, password, options }: { 
    email: string; 
    password: string; 
    options?: { data?: { name?: string } } 
  }) {
    console.log('🔄 Mock Auth: Attempting signup for', email)
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500))
    
    if (this.users.has(email.toLowerCase())) {
      return {
        data: { user: null, session: null },
        error: { message: 'User already exists' }
      }
    }

    const newUser = {
      id: `mock-user-${Date.now()}`,
      email: email.toLowerCase(),
      password,
      name: options?.data?.name || 'New User'
    }

    this.users.set(email.toLowerCase(), newUser)

    console.log('✅ Mock Auth: Signup successful for', email)

    return {
      data: { 
        user: {
          id: newUser.id,
          email: newUser.email,
          user_metadata: { name: newUser.name },
          aud: 'authenticated',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          app_metadata: {},
          role: 'authenticated'
        },
        session: null 
      },
      error: null
    }
  }

  async signOut() {
    console.log('🔄 Mock Auth: Signing out')
    
    this.currentUser = null
    this.currentSession = null
    localStorage.removeItem('mockAuthUser')
    localStorage.removeItem('mockAuthSession')

    console.log('✅ Mock Auth: Signed out successfully')

    return { error: null }
  }

  async getSession() {
    const savedSession = localStorage.getItem('mockAuthSession')
    const savedUser = localStorage.getItem('mockAuthUser')
    
    if (savedSession && savedUser) {
      this.currentSession = JSON.parse(savedSession)
      this.currentUser = JSON.parse(savedUser)
      
      return {
        data: { session: this.currentSession },
        error: null
      }
    }

    return {
      data: { session: null },
      error: null
    }
  }

  onAuthStateChange(callback: (event: string, session: Session | null) => void) {
    // Return initial session
    setTimeout(() => {
      callback('INITIAL_SESSION', this.currentSession)
    }, 100)

    // Return a mock subscription
    return {
      unsubscribe: () => {
        console.log('🔄 Mock Auth: Unsubscribed from auth state changes')
      }
    }
  }
}

export const mockAuth = new MockAuthService()

// Check if Supabase is available
export async function isSupabaseAvailable(): Promise<boolean> {
  try {
    // Use a shorter timeout to fail faster
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 3000) // 3 second timeout
    
    const response = await fetch('https://yssclplclymzguvnkogo.supabase.co/rest/v1/', {
      method: 'HEAD',
      headers: {
        'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlzc2NscGxjbHltemd1dm5rb2dvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg2NTgwNzYsImV4cCI6MjA3NDIzNDA3Nn0.ZU9xQtUjnfG8ClrsJivvh0hBJuT1MtFzXwXuofhTq0w'
      },
      signal: controller.signal
    })
    
    clearTimeout(timeoutId)
    console.log('✅ Supabase is available')
    return response.ok
  } catch (error) {
    console.log('❌ Supabase not available:', (error as Error).message)
    return false
  }
}