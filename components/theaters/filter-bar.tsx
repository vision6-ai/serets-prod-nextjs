'use client'

import { useState } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import { Calendar, Filter } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Calendar as CalendarComponent } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { format } from 'date-fns'
import { he } from 'date-fns/locale'
import { cn } from '@/lib/utils'

interface FilterBarProps {
  formats: string[]
  genres: { name: string; slug: string }[]
  selectedFormat: string
  selectedGenre: string
  onFormatChange: (format: string) => void
  onGenreChange: (genre: string) => void
  onDateChange: (date: string) => void
}

export function FilterBar({
  formats,
  genres,
  selectedFormat,
  selectedGenre,
  onFormatChange,
  onGenreChange,
  onDateChange
}: FilterBarProps) {
  const [date, setDate] = useState<Date>(new Date())
  const [isCalendarOpen, setIsCalendarOpen] = useState(false)
  const locale = useLocale() as 'en' | 'he'
  const t = useTranslations('theaters')
  const isRtl = locale === 'he'

  const handleDateSelect = (selectedDate: Date | undefined) => {
    if (selectedDate) {
      setDate(selectedDate)
      onDateChange(format(selectedDate, 'yyyy-MM-dd'))
      setIsCalendarOpen(false)
    }
  }

  return (
    <div className={cn(
      "flex flex-col md:flex-row gap-3 md:items-center",
      isRtl && "rtl-flex"
    )}>
      {/* Date Selector */}
      <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
        <PopoverTrigger asChild>
          <Button 
            variant="outline" 
            className={cn(
              "justify-start md:w-auto w-full",
              isRtl && "flex-row-reverse"
            )}
          >
            <Calendar className={cn("h-4 w-4", isRtl ? "ml-2" : "mr-2")} />
            {format(date, 'PPP', { locale: isRtl ? he : undefined })}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align={isRtl ? "end" : "start"}>
          <CalendarComponent
            mode="single"
            selected={date}
            onSelect={handleDateSelect}
            initialFocus
            locale={isRtl ? he : undefined}
          />
        </PopoverContent>
      </Popover>

      {/* Format Filter */}
      <Select value={selectedFormat} onValueChange={onFormatChange}>
        <SelectTrigger className="md:w-[150px] w-full">
          <SelectValue placeholder={t('format')} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">{t('allFormats')}</SelectItem>
          {formats.map((format) => (
            <SelectItem key={format} value={format}>
              {format}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Genre Filter */}
      <Select value={selectedGenre} onValueChange={onGenreChange}>
        <SelectTrigger className="md:w-[150px] w-full">
          <SelectValue placeholder={t('genre')} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">{t('allGenres')}</SelectItem>
          {genres.map((genre) => (
            <SelectItem key={genre.slug} value={genre.slug}>
              {genre.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Reset Filters */}
      {(selectedFormat !== 'all' || selectedGenre !== 'all') && (
        <Button 
          variant="ghost" 
          onClick={() => {
            onFormatChange('all')
            onGenreChange('all')
          }}
          className="md:ml-auto"
        >
          {t('resetFilters')}
        </Button>
      )}
    </div>
  )
}