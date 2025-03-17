import { createClient } from '@supabase/supabase-js'
import ShortsFeed from '../shorts-feed'
import { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'

export const revalidate = 0 // Disable caching

export const metadata: Metadata = {
  title: 'Movie Trailers | MovieTime',
  description: 'Watch movie trailers for upcoming and current films.',
  openGraph: {
    title: 'Movie Trailers | MovieTime',
    description: 'Watch the latest Israeli movie trailers in an immersive vertical feed.',
    type: 'video.other'
  }
}

async function getTrailers(initialVideoId?: string) {
  console.log(`Getting trailers, requested video ID: ${initialVideoId || 'none'}`)
  
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    // Log the available videos in the database for debugging
    const { data: allVideosDebug, error: debugError } = await supabase
      .from('videos')
      .select('id, title, cloudflare_id, type, cloudflare_status')
      .eq('type', 'trailer')
    
    console.log(`Debug - All videos in database (${allVideosDebug?.length || 0}):`, allVideosDebug)
    
    if (debugError) {
      console.error('Error fetching debug videos list:', debugError)
    }

    // Always fetch all available videos
    const { data: videos, error } = await supabase
      .from('videos')
      .select(`
        id,
        title,
        cloudflare_id,
        language,
        movie_id,
        created_at
      `)
      .eq('type', 'trailer')
      .eq('cloudflare_status', 'ready')
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('Error fetching videos:', error)
      return []
    }

    console.log(`Found ${videos?.length || 0} videos in database: `, videos)
    
    if (!videos || videos.length === 0) {
      console.log('No videos found that match criteria (type=trailer, status=ready)')
      return []
    }
    
    // Check if the requested video exists in the fetched videos
    if (initialVideoId) {
      const specificVideoExists = videos.some(video => video.cloudflare_id === initialVideoId)
      if (specificVideoExists) {
        console.log(`Requested video ID ${initialVideoId} exists among the ${videos.length} videos`)
      } else {
        console.log(`Warning: Requested video ID ${initialVideoId} not found among the ${videos.length} videos`)
      }
    }
    
    // Enhance videos with movie data if possible
    const enhancedVideos = await Promise.all(videos.map(async (video) => {
      if (video.movie_id) {
        try {
          const { data: movie } = await supabase
            .from('movies')
            .select('id, title, hebrew_title, poster_url, slug')
            .eq('id', video.movie_id)
            .single()
          
          if (movie) {
            console.log(`Found movie for video ${video.id}:`, movie)
            return {
              ...video,
              movies: movie
            }
          }
        } catch (error) {
          console.error(`Error fetching movie for video ${video.id}:`, error)
        }
      }
      
      // Return with placeholder movie if we couldn't get the real one
      return {
        ...video,
        movies: {
          id: 'unknown',
          title: video.title || 'Unknown Movie',
          hebrew_title: null,
          poster_url: null,
          slug: 'unknown'
        }
      }
    }))
    
    console.log(`Returning ${enhancedVideos.length} enhanced videos`)
    return enhancedVideos
  } catch (error) {
    console.error('Unexpected error fetching trailers:', error)
    return []
  }
}

export default async function ShortsPage({ params }: { params: { id?: string } }) {
  const trailers = await getTrailers(params.id)
  console.log(`Got ${trailers.length} trailers for display`)

  // If no trailers are available at all, show the "No Trailers" message
  if (!trailers || trailers.length === 0) {
    console.log('No trailers found, showing empty state')
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center bg-black">
        <h1 className="text-4xl font-bold mb-4">No Trailers Available</h1>
        <p className="text-xl text-white/80 mb-8">
          Check back later for new movie trailers.
        </p>
        <p className="text-sm text-white/60 mb-8">
          You need to add movies and trailers to your database to see content here.
        </p>
        <a 
          href="/shorts/test" 
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
        >
          Go to Test Page
        </a>
      </div>
    )
  }

  // If a specific video ID was requested but not found, redirect to the main shorts page
  if (params.id && !trailers.find(v => v.cloudflare_id === params.id)) {
    console.log(`Video with ID ${params.id} not found. Redirecting to main shorts page.`)
    redirect('/shorts')
  }

  console.log(`Rendering shorts feed with ${trailers.length} videos`)
  return (
    <div className="min-h-screen">
      <ShortsFeed 
        videos={trailers.map(video => ({
          ...video,
          movies: Array.isArray(video.movies) ? video.movies : [video.movies]
        }))} 
        initialVideoId={params.id} 
      />
    </div>
  )
}