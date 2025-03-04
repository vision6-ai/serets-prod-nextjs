'use client'

import { withAuth } from '@/components/auth/with-auth'
import { ProfileContent } from '@/components/profile/profile-content'
import { useAuth } from '@/components/auth/auth-provider'

function ProfilePage() {
  const { user } = useAuth()

  if (!user) {
    return null // withAuth HOC will handle redirect
  }

  return (
    <div className="container py-8">
      <ProfileContent userId={user.id} />
    </div>
  )
}

// Wrap the profile page with auth protection
export default withAuth(ProfilePage, { requireAuth: true })
