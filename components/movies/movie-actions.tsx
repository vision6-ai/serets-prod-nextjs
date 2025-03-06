'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/components/auth/auth-provider'
import { AuthDialog } from '@/components/auth/auth-dialog'
import { Button } from '@/components/ui/button'
import { Play } from 'lucide-react'

interface MovieActionsProps {
  movieId: string
  trailerUrl?: string | null
}

export function MovieActions({ movieId, trailerUrl }: MovieActionsProps) {
  const [showAuthDialog, setShowAuthDialog] = useState(false)
  const [currentUrl, setCurrentUrl] = useState<string>('')
  const { user } = useAuth()

  useEffect(() => {
    setCurrentUrl(window.location.href)
  }, [])

  const handleTrailerClick = () => {
    if (trailerUrl) {
      window.open(trailerUrl, '_blank')
    }
  }

  return (
    <>
      {trailerUrl && (
        <Button onClick={handleTrailerClick} className="w-full">
          <Play className="w-4 h-4 mr-2" />
          Watch Trailer
        </Button>
      )}

      <AuthDialog
        open={showAuthDialog}
        onOpenChange={setShowAuthDialog}
        redirectTo={currentUrl}
      />
    </>
  )
}
