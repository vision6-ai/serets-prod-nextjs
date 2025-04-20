'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'

interface AuthContextType {
  user: User | null
  loading: boolean
  error: string | null
  refreshAuth: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  error: null,
  refreshAuth: async () => {}
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [authInitialized, setAuthInitialized] = useState(false)

  const initializeAuth = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      
      if (sessionError) {
        throw sessionError
      }
      
      setUser(session?.user ?? null)
      setAuthInitialized(true)
    } catch (err: any) {
      console.error('Error checking auth session:', err)
      setError(err.message || 'Authentication error')
      // In production, don't show the actual error to users
      if (typeof window !== 'undefined' && window.location.hostname !== 'localhost') {
        setError('Unable to authenticate. Please try again later.')
      }
    } finally {
      setLoading(false)
    }
  }

  const refreshAuth = async () => {
    await initializeAuth()
  }

  useEffect(() => {
    let mounted = true;

    // Initialize auth on first load
    const setupAuth = async () => {
      if (mounted) {
        await initializeAuth()
      }
    }
    
    setupAuth()

    // Listen for changes on auth state (signed in, signed out, etc.)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (mounted) {
        setUser(session?.user ?? null)
        // Don't set loading to false here, as it might cause flickering
      }
    })

    return () => {
      mounted = false;
      subscription.unsubscribe()
    }
  }, [])

  // Retry auth initialization if it fails - helpful in environments with connectivity issues
  useEffect(() => {
    if (error && !authInitialized) {
      const retryTimer = setTimeout(() => {
        console.log('Retrying auth initialization...')
        initializeAuth()
      }, 3000)
      
      return () => clearTimeout(retryTimer)
    }
  }, [error, authInitialized])

  return (
    <AuthContext.Provider value={{ user, loading, error, refreshAuth }}>
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
