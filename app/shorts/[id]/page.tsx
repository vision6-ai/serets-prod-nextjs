import { createClient } from '@supabase/supabase-js'
import ShortsFeed from '../shorts-feed'
import { Metadata } from 'next'
import { notFound } from 'next/navigation'

export const revalidate = 3600

export const metadata: Metadata = {
  title: 'Movie Trailers | SERETS.CO.IL',
  description: 'Watch the latest Israeli movie trailers in an immersive vertical feed.',
  openGraph: {
    title: 'Movie Trailers | SERETS.CO.IL',
    description: 'Watch the latest Israeli movie trailers in an immersive vertical feed.',
    type: 'video.other'
  }
}

async function getTrailers(initialVideoId?: string) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const { data: videos } = await supabase
    .from('videos')
    .select(`
      id,
      title,
      cloudflare_id,
      language,
      movies (
        id,
        title,
        hebrew_title,
        poster_url,
        slug
      )
    `)
    .eq('type', 'trailer')
    .eq('cloudflare_status', 'ready')
    .order('created_at', { ascending: false })

  if (initialVideoId && videos) {
    // Reorder videos to put the requested video first
    const index = videos.findIndex(v => v.cloudflare_id === initialVideoId)
    if (index > 0) {
      const video = videos.splice(index, 1)[0]
      videos.unshift(video)
    }
  }

  return videos || []
}

export default async function ShortsPage({ params }: { params: { id?: string } }) {
  const trailers = await getTrailers(params.id)

  if (params.id && !trailers.find(v => v.cloudflare_id === params.id)) {
    notFound()
  }

  return (
    <div className="min-h-screen">
      {trailers && trailers.length > 0 ? (
        <ShortsFeed videos={trailers.map(video => ({
          ...video,
          movies: Array.isArray(video.movies) ? video.movies : [video.movies]
        }))} initialVideoId={params.id} />
      ) : (
        <div className="fixed inset-0 flex items-center justify-center bg-black">
          <h1 className="text-4xl font-bold mb-4">No Trailers Available</h1>
          <p className="text-xl text-white/80">
            Check back later for new movie trailers.
          </p>
        </div>
      )}
    </div>
  )
}