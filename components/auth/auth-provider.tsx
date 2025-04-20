'use client'

import { useUser, useSession } from '@supabase/auth-helpers-react'

export function useAuth() {
  const user = useUser()
  const session = useSession()
  return { user, session, loading: false, error: null, refreshAuth: async () => {} }
}

// No need for a custom AuthProvider, as SessionContextProvider is now used globally.
