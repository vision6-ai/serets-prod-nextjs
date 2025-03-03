'use client'

import { useState, useEffect } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import Image from 'next/image'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PromotionalBannerProps {
  theaterId: string
}

interface Promotion {
  id: string
  theater_id: string
  title: string
  description: string
  image_url: string
  link_url: string | null
  link_text: string | null
  start_date: string
  end_date: string
  active: boolean
}

export function PromotionalBanner({ theaterId }: PromotionalBannerProps) {
  const [promotion, setPromotion] = useState<Promotion | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClientComponentClient()
  const locale = useLocale() as 'en' | 'he'
  const t = useTranslations('theaters')
  const isRtl = locale === 'he'

  useEffect(() => {
    async function fetchPromotion() {
      try {
        const now = new Date().toISOString()
        
        const { data } = await supabase
          .from('promotions')
          .select('*')
          .eq('theater_id', theaterId)
          .eq('active', true)
          .lte('start_date', now)
          .gte('end_date', now)
          .order('start_date', { ascending: false })
          .limit(1)
          .single()
        
        if (data) {
          setPromotion(data)
        }
      } catch (error) {
        console.error('Error fetching promotion:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchPromotion()
  }, [theaterId, supabase])

  if (loading) {
    return (
      <Card className="w-full h-48 md:h-64 animate-pulse bg-muted" />
    )
  }

  if (!promotion) {
    return null
  }

  return (
    <Card className="w-full overflow-hidden relative theater-banner">
      <div className="relative h-48 md:h-64 w-full">
        <Image
          src={promotion.image_url}
          alt={promotion.title}
          fill
          className="object-cover"
          priority
        />
        <div className={cn(
          "absolute inset-0 theater-banner-gradient flex flex-col justify-center p-6 md:p-8",
          isRtl && "rtl-banner-gradient"
        )}>
          <div className={isRtl ? "text-right" : "text-left"}>
            <h2 className="text-white text-2xl md:text-3xl font-bold mb-2 max-w-md">
              {promotion.title}
            </h2>
            <p className="text-white/80 mb-4 max-w-md text-sm md:text-base">
              {promotion.description}
            </p>
            {promotion.link_url && (
              <Button asChild className="w-fit">
                <a 
                  href={promotion.link_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className={cn(
                    "flex items-center",
                    isRtl && "flex-row-reverse"
                  )}
                >
                  {promotion.link_text || t('learnMore')}
                  <ArrowRight className={cn(
                    "h-4 w-4",
                    isRtl ? "mr-2 rtl-mirror" : "ml-2"
                  )} />
                </a>
              </Button>
            )}
          </div>
        </div>
      </div>
    </Card>
  )
}