'use client'

import { usePathname, useSearchParams } from 'next/navigation'
import { useEffect } from 'react'
import { pageview } from '@/lib/gtm'

export default function GTMRouteTracker(): null {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    // Track page views when the route changes
    if (pathname) {
      // Create URL from pathname and search params
      const url = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : '')
      
      // Send pageview event to GTM
      pageview(url)
    }
  }, [pathname, searchParams])

  return null
} 