'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useLocale, useTranslations } from 'next-intl'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Theater } from '@/types/theater'
import { cn } from '@/lib/utils'

interface TheaterSelectorProps {
  currentTheaterId: string
}

export function TheaterSelector({ currentTheaterId }: TheaterSelectorProps) {
  const [theaters, setTheaters] = useState<Theater[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClientComponentClient()
  const locale = useLocale() as 'en' | 'he'
  const t = useTranslations('theaters')
  const isRtl = locale === 'he'

  useEffect(() => {
    async function fetchTheaters() {
      try {
        const { data } = await supabase
          .from('theaters')
          .select('id, name, slug, location, address, phone, email, website, description, amenities, image_url')
          .order('name')
        
        if (data) {
          setTheaters(data as Theater[])
        }
      } catch (error) {
        console.error('Error fetching theaters:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchTheaters()
  }, [supabase])

  const handleTheaterChange = (theaterId: string) => {
    const selectedTheater = theaters.find(theater => theater.id === theaterId)
    if (selectedTheater) {
      router.push(`/theaters/${selectedTheater.slug}`)
    }
  }

  if (loading || theaters.length === 0) {
    return null
  }

  return (
    <div className={cn(
      "w-full md:w-auto",
      isRtl && "text-right"
    )}>
      <Select value={currentTheaterId} onValueChange={handleTheaterChange}>
        <SelectTrigger className="w-full md:w-[250px]">
          <SelectValue placeholder={t('selectTheater')} />
        </SelectTrigger>
        <SelectContent>
          {theaters.map((theater) => (
            <SelectItem key={theater.id} value={theater.id}>
              {theater.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}