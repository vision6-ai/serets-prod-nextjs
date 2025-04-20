'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import { createClient } from '@/lib/supabase'
import { useTheme } from 'next-themes'

interface AuthDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  redirectTo?: string
}

export function AuthDialog({ open, onOpenChange, redirectTo }: AuthDialogProps) {
  const supabase = createClient()
  const { theme } = useTheme()
  const [origin, setOrigin] = useState<string>('')

  // Set the origin URL for redirect
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setOrigin(window.location.origin)
    }
  }, [])

  // Prepare the full redirect URL
  const fullRedirectUrl = redirectTo 
    ? (redirectTo.startsWith('http') ? redirectTo : `${origin}${redirectTo}`)
    : origin

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <Auth
          supabaseClient={supabase}
          appearance={{ 
            theme: ThemeSupa,
            variables: {
              default: {
                colors: {
                  brand: 'rgb(var(--color-primary))',
                  brandAccent: 'rgb(var(--color-primary-dark))',
                },
              },
            },
          }}
          theme={theme === 'dark' ? 'dark' : 'default'}
          providers={['google']}
          redirectTo={fullRedirectUrl}
          onlyThirdPartyProviders={false}
        />
      </DialogContent>
    </Dialog>
  )
}
