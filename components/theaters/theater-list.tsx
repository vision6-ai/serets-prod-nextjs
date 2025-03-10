'use client'

import { useState } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import { Search, MapPin } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { TheaterCard } from './theater-card'
import { Theater } from '@/types/theater'
import { cn } from '@/lib/utils'

interface TheaterListProps {
  theaters: Theater[]
}

export function TheaterList({ theaters }: TheaterListProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const locale = useLocale() as 'en' | 'he'
  const t = useTranslations('theaters')
  const isRtl = locale === 'he'

  const filteredTheaters = theaters.filter(theater => 
    theater.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    theater.location.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="space-y-6" dir={isRtl ? 'rtl' : 'ltr'}>
      {/* Search Bar */}
      <div className={cn(
        "relative mb-8",
        isRtl && "rtl-icon-input"
      )}>
        <Search className={cn(
          "absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground",
          isRtl && "left-auto right-3"
        )} />
        <Input
          type="text"
          placeholder={t('searchTheaters')}
          className={cn(
            "pl-10 h-12",
            isRtl && "pl-3 pr-10"
          )}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Theater Grid */}
      {filteredTheaters.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            {t('noTheatersFound')}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTheaters.map((theater) => (
            <TheaterCard key={theater.id} theater={theater} />
          ))}
        </div>
      )}
    </div>
  )
}