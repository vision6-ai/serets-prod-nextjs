'use client'

import { useEffect, useState, Suspense } from 'react'
import { supabase } from '@/lib/supabase'
import { redirect } from 'next/navigation'
import { User } from '@supabase/supabase-js'

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)

    const fetchUser = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser()
        if (error) throw error

        if (mounted) {
          if (user) {
            setUser(user)
          }
          setLoading(false)
        }
      } catch (error) {
        console.error('Error fetching user:', error)
        if (mounted) {
          setLoading(false)
        }
      }
    }

    fetchUser()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (mounted) {
        setUser(session?.user ?? null)
      }
    })

    return () => {
      setMounted(false)
      subscription.unsubscribe()
    }
  }, [])

  // Don't render anything until mounted
  if (!mounted) return null

  // Show loading state
  if (loading) {
    return (
      <div className="container py-8">
        <h1 className="text-3xl font-bold mb-8">My Profile</h1>
        <div className="flex items-center justify-center min-h-[200px]">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
        </div>
      </div>
    )
  }

  // Redirect if no user
  if (!user) {
    redirect('/auth')
    return null
  }

  return (
    <Suspense fallback={<div className="container py-8"><h1 className="text-3xl font-bold mb-8">My Profile</h1><div className="flex items-center justify-center min-h-[200px]"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div></div></div>}>
      <div className="container py-8">
        <h1 className="text-3xl font-bold mb-8">My Profile</h1>
        <div className="max-w-2xl mx-auto">
          <div className="space-y-6">
            {/* User Info */}
            <div className="flex items-center gap-4">
              <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center text-2xl font-bold">
                {user.email?.substring(0, 2).toUpperCase() || 'U'}
              </div>
              <div>
                <h2 className="text-xl font-semibold">
                  {user.user_metadata?.full_name || user.email?.split('@')[0] || 'User'}
                </h2>
                <p className="text-muted-foreground">{user.email}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Suspense>
  )
}
