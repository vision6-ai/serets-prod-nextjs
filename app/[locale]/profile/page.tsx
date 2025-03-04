import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import { createServerClient } from '@/lib/supabase-server'
import { ProfileContent } from '@/components/profile/profile-content'
import { ProfileSkeleton } from '@/components/skeletons'

export const dynamic = 'force-dynamic'

export default async function ProfilePage({
  params: { locale }
}: {
  params: { locale: string }
}) {
  const supabase = createServerClient()
  
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    redirect(`/${locale}/auth`)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Suspense fallback={<ProfileSkeleton />}>
        <ProfileContent userId={session.user.id} />
      </Suspense>
    </div>
  )
} 