import { Suspense } from 'react'
import { createClient } from '@supabase/supabase-js'
import { TheaterList } from '@/components/theaters/theater-list'
import { TheaterSkeleton } from '@/components/skeletons'
import { unstable_setRequestLocale } from 'next-intl/server'

export const revalidate = 3600 // Revalidate every hour

async function getTheaters() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const { data: theaters } = await supabase
    .from('theaters')
    .select('*')
    .order('name')

  return theaters || []
}

export default async function TheatersPage({ params }: { params: { locale: string } }) {
  // This is critical for server components to work with next-intl
  unstable_setRequestLocale(params.locale)
  
  const theaters = await getTheaters()

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">Theaters</h1>
      <Suspense fallback={<TheaterSkeleton />}>
        <TheaterList theaters={theaters} />
      </Suspense>
    </div>
  )
}