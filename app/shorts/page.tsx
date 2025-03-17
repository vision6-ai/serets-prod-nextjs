import { redirect } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'

export const revalidate = 0 // Disable caching to ensure we always get fresh data

export default async function ShortsRedirectPage() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  // First, check for our specific new video ID
  const targetVideoId = '8d4a9738ce0108e5b6db3d3aefcf56c7' // The ID you specified

  // Try to find this specific video first
  const { data: specificVideo } = await supabase
    .from('videos')
    .select('*')
    .eq('cloudflare_id', targetVideoId)
    .eq('type', 'trailer')
    .eq('cloudflare_status', 'ready')
    .single()

  // If we found the specific video, redirect to it
  if (specificVideo) {
    console.log(`Found specific video, redirecting to: /shorts/${targetVideoId}`)
    redirect(`/shorts/${targetVideoId}`)
  }

  // Otherwise, look for any videos
  const { data: videos } = await supabase
    .from('videos')
    .select('*')
    .eq('type', 'trailer')
    .eq('cloudflare_status', 'ready')
    .order('created_at', { ascending: false })

  console.log('Available videos:', videos)

  if (videos && videos.length > 0) {
    console.log(`Redirecting to first available video: ${videos[0].cloudflare_id}`)
    redirect(`/shorts/${videos[0].cloudflare_id}`)
  }

  // If no videos are found, show the no videos message
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-black">
      <h1 className="text-4xl font-bold mb-4">No Trailers Available</h1>
      <p className="text-xl text-white/80 mb-8">
        Check back later for new movie trailers.
      </p>
      <p className="text-sm text-white/60">
        To use the shorts feature, add videos with type 'trailer' to your database.
      </p>
      <div className="mt-8">
        <a 
          href="/shorts/test" 
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
        >
          Go to Test Page
        </a>
      </div>
    </div>
  )
}