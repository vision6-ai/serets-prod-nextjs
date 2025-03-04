'use client'

import { withAuth } from '@/components/auth/with-auth'
import { useAuth } from '@/components/auth/auth-provider'

function ProfilePage() {
  const { user, loading } = useAuth()

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

  // Show message if no user
  if (!user) {
    return (
      <div className="container py-8">
        <h1 className="text-3xl font-bold mb-8">My Profile</h1>
        <div className="text-center py-8">
          <p className="text-muted-foreground">Please sign in to view your profile.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-8">My Profile</h1>
      <div className="max-w-2xl mx-auto">
        <div className="space-y-6">
          {/* User Info */}
          <div className="flex items-center gap-4">
            <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center text-2xl font-bold">
              {user.email?.substring(0, 2).toUpperCase()}
            </div>
            <div>
              <h2 className="text-xl font-semibold">
                {user.user_metadata.full_name || user.email?.split('@')[0]}
              </h2>
              <p className="text-muted-foreground">{user.email}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Export the raw component for testing
export { ProfilePage }

// Export the wrapped component as default
export default withAuth(ProfilePage)
