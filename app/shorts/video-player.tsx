'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import ReactPlayer from 'react-player'
import { useInView } from 'react-intersection-observer'
import Link from 'next/link'
import { Volume2, VolumeX, Play, Pause } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface Movie {
  id: string
  title: string
  hebrew_title: string | null
  poster_url: string | null
  slug: string
}

interface Trailer {
  id: string
  title: string
  cloudflare_id: string
  language: string | null
  movies: Movie
}

interface VideoPlayerProps {
  trailer: Trailer
  isActive: boolean
  className?: string
}

export default function VideoPlayer({ trailer, isActive, className }: VideoPlayerProps) {
  const [playing, setPlaying] = useState(false)
  const [muted, setMuted] = useState(true)
  const [progress, setProgress] = useState(0)
  const [ready, setReady] = useState(false)
  const [userPaused, setUserPaused] = useState(false)
  const playerRef = useRef<ReactPlayer>(null)
  const { ref, inView } = useInView({
    threshold: 0.6,
  })

  // Auto-play when in view and active
  useEffect(() => {
    console.log('Video Player State:', {
      videoId: trailer.cloudflare_id,
      inView,
      isActive,
      ready,
      playing,
      userPaused,
      timestamp: new Date().toISOString()
    })
    
    if (inView && isActive && ready && !userPaused) {
      console.log('Starting video playback:', {
        videoId: trailer.cloudflare_id,
        reason: 'In view, active, and ready'
      })
      setPlaying(true)
    }
    if ((!inView || !isActive) && playing) {
      console.log('Stopping video playback:', {
        videoId: trailer.cloudflare_id,
        reason: !inView ? 'Not in view' : 'Not active'
      })
      setPlaying(false)
      setUserPaused(false) // Reset user pause state when video is not active
    }
  }, [inView, isActive, ready, playing, userPaused, trailer.cloudflare_id])

  const handlePlayPause = () => {
    const newPlayingState = !playing
    setPlaying(newPlayingState)
    setUserPaused(!newPlayingState)
    console.log('User clicked play/pause:', {
      videoId: trailer.cloudflare_id,
      newState: newPlayingState ? 'playing' : 'paused'
    })
  }

  const videoUrl = `https://videodelivery.net/${trailer.cloudflare_id}/manifest/video.m3u8`

  return (
    <div 
      ref={ref}
      className={cn("relative h-screen w-full bg-black overflow-hidden", className)}
      data-testid={`video-player-${trailer.cloudflare_id}`}
    >
      <ReactPlayer
        ref={playerRef}
        url={videoUrl}
        playing={playing}
        muted={muted}
        width="100%"
        height="100%"
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          objectFit: 'cover'
        }}
        playsinline
        config={{
          file: {
            forceHLS: true,
            hlsOptions: {
              enableWorker: false,
              startLevel: 1,
              debug: false,
              maxBufferLength: 15,
              maxMaxBufferLength: 30
            },
            attributes: {
              poster: `https://videodelivery.net/${trailer.cloudflare_id}/thumbnails/thumbnail.jpg`,
              preload: 'auto'
            }
          }
        }}
        onReady={() => {
          console.log('Video Ready:', trailer.cloudflare_id)
          setReady(true)
        }}
        onStart={() => {
          console.log('Video Started:', trailer.cloudflare_id)
        }}
        onPause={() => {
          console.log('Video Paused:', trailer.cloudflare_id)
        }}
        onEnded={() => {
          console.log('Video Ended:', trailer.cloudflare_id)
          setPlaying(false)
          setUserPaused(true)
          if (playerRef.current) {
            playerRef.current.seekTo(0)
          }
        }}
        onError={(error) => {
          console.error('Video Error:', {
            videoId: trailer.cloudflare_id,
            error
          })
        }}
        onProgress={({ played, loaded }) => {
          const progressPercent = played * 100
          setProgress(progressPercent)
          if (progressPercent % 25 === 0) { // Log every 25%
            console.log('Video Progress:', {
              videoId: trailer.cloudflare_id,
              progress: progressPercent.toFixed(1) + '%',
              loaded: (loaded * 100).toFixed(1) + '%'
            })
          }
        }}
      />

      {/* Controls Overlay */}
      <div 
        className={cn(
          "absolute inset-0 flex flex-col justify-between p-6",
          "bg-gradient-to-b from-black/50 via-transparent to-black/50",
          "opacity-100 transition-opacity duration-200",
          !playing && "opacity-100",
          playing && "opacity-0 hover:opacity-100"
        )}
      >
        {/* Movie Info */}
        <div>
          <h2 className="text-white font-semibold text-lg">
            {trailer.movies.title || trailer.movies.slug}
          </h2>
          {trailer.movies.hebrew_title && trailer.movies.hebrew_title !== trailer.movies.title && (
            <p className="text-white/80 text-sm">
              {trailer.movies.hebrew_title}
            </p>
          )}
        </div>

        {/* Progress Bar */}
        <div className="absolute bottom-24 left-6 right-6 h-1 bg-white/20 rounded-full overflow-hidden">
          <div 
            className="h-full bg-primary transition-all duration-200"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Bottom Controls */}
        <div className="flex items-center justify-between mt-8">
          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:bg-white/20"
            onClick={handlePlayPause}
          >
            {!playing ? (
              <Play className="h-6 w-6" />
            ) : (
              <Pause className="h-6 w-6" />
            )}
          </Button>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/20"
              onClick={() => setMuted(!muted)}
            >
              {muted ? (
                <VolumeX className="h-6 w-6" />
              ) : (
                <Volume2 className="h-6 w-6" />
              )}
            </Button>
            
            <Button
              variant="ghost"
              className="text-white hover:bg-white/20"
              asChild
            >
              <Link href={`/movies/${trailer.movies.slug}`}>
                View Movie
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}