'use client'

import { Toaster as SonnerToaster } from 'sonner'

export function Toaster() {
  return (
    <SonnerToaster
      position="bottom-right"
      toastOptions={{
        className: 'border bg-background text-foreground',
        duration: 3000,
        style: {
          '--toast-background': 'hsl(var(--background))',
          '--toast-border': 'hsl(var(--border))',
          '--toast-text': 'hsl(var(--foreground))',
        } as React.CSSProperties,
      }}
    />
  )
}
