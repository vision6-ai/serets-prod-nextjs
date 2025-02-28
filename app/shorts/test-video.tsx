'use client'

import { Stream } from "@cloudflare/stream-react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Volume2, VolumeX, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

// Test video ID from Cloudflare Stream
const TEST_VIDEO_ID = "31c9291def39e0029dc71f654d655346"

export function TestVideo() {
  const [muted, setMuted] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    // Log configuration for debugging
    console.log('Cloudflare Stream Test:', {
      videoId: TEST_VIDEO_ID,
      hasSigningKey: !!process.env.NEXT_PUBLIC_CLOUDFLARE_STREAM_SIGNING_KEY
    })
  }, [])

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
          <Stream
            controls={false}
            src={TEST_VIDEO_ID}
            muted={muted}
            className="w-full h-full"
            autoplay
            loop
            onLoadedData={() => {
              console.log('Video loaded successfully')
              setLoaded(true)
            }}
            onError={(e) => {
              console.error('Video playback error:', e)
              setError('Failed to load video. Please check the console for details.')
            }}
          />
          
          {/* Mute Toggle */}
          <div className={`absolute bottom-4 right-4 ${!loaded && 'hidden'}`}>
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
          </div>
        </div>

        <div className="mt-4 text-center text-sm text-muted-foreground">
          {loaded ? (
            <span className="text-green-500">✓ Video loaded successfully</span>
          ) : (
            <span>Loading video...</span>
          )}
        </div>
      </div>
    </div>
  )
}