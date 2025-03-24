'use client'

import { useState, useEffect, useCallback } from 'react'
import { useTranslations } from 'next-intl'
import { Search, MapPin } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Locale } from '@/config/i18n'
import { cn } from '@/lib/utils'

interface HomeSearchProps {
  locale: Locale
  onSearch: (query: string, city: string | null) => void
}

// Debounce helper function to limit how often a function can be called
const debounce = <F extends (...args: any[]) => any>(func: F, waitFor: number) => {
  let timeout: ReturnType<typeof setTimeout> | null = null;

  return (...args: Parameters<F>): void => {
    if (timeout !== null) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(() => func(...args), waitFor);
  };
};

export function HomeSearch({ locale, onSearch }: HomeSearchProps) {
  const t = useTranslations('home.search')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCity, setSelectedCity] = useState<string | null>(null)
  const [cities, setCities] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const isRtl = locale === 'he'

  // Fetch cities from the database
  useEffect(() => {
    const fetchCities = async () => {
      try {
        setLoading(true)
        const supabase = createClientComponentClient()
        const { data, error } = await supabase
          .from('movieshows')
          .select('city')
          .order('city')
        
        if (error) {
          console.error('Error fetching cities:', error)
          return
        }
        
        // Extract unique cities
        const uniqueCities = [...new Set(data.map(item => item.city))]
          .filter(Boolean)
          .sort()
        
        setCities(uniqueCities)
      } catch (error) {
        console.error('Error in fetchCities:', error)
      } finally {
        setLoading(false)
      }
    }
    
    fetchCities()
  }, [])

  // Create debounced search function
  const debouncedSearch = useCallback(
    debounce((query: string, city: string | null) => {
      console.log('Debounced search:', { query, city })
      onSearch(query, city)
    }, 300), // 300ms debounce time
    [onSearch]
  )

  // Handle city selection change
  const handleCityChange = (value: string) => {
    const newCity = value === 'all' ? null : value
    setSelectedCity(newCity)
    // Trigger search when city changes
    debouncedSearch(searchQuery, newCity)
  }

  // Handle input change - triggers search automatically
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuery = e.target.value
    setSearchQuery(newQuery)
    // Trigger search as user types
    debouncedSearch(newQuery, selectedCity)
  }

  return (
    <div className="w-full space-y-3 max-w-[500px] mx-auto mb-8">
      {/* Search Input */}
      <div className="relative">
        <div className={cn(
          "absolute inset-y-0 flex items-center",
          isRtl ? "right-3" : "left-3"
        )}>
          <Search className="h-5 w-5 text-muted-foreground" />
        </div>
        <Input
          type="text"
          placeholder={t('searchPlaceholder')}
          className={cn(
            "h-12 bg-card border-input shadow-sm",
            isRtl ? "pr-10 pl-4 text-right" : "pl-10 pr-4"
          )}
          value={searchQuery}
          onChange={handleInputChange}
        />
      </div>
      
      {/* City Selector */}
      <div className="relative">
        {/* Use a custom styled select for better RTL support */}
        <div className="relative">
          <div 
            className={cn(
              "relative h-12 rounded-md border border-input bg-card shadow-sm flex items-center cursor-pointer",
              isRtl ? "pr-4 pl-12 flex-row-reverse" : "pl-4 pr-10"
            )}
            onClick={() => {
              // Create a click event on the actual select trigger which is hidden
              const selectTrigger = document.getElementById('city-select-trigger');
              selectTrigger?.click();
            }}
          >
            <MapPin className={cn(
              "h-5 w-5 text-muted-foreground", 
              isRtl ? "ml-3" : "mr-2"
            )} />
            <span 
              className={cn(
                "text-sm text-muted-foreground flex-1", 
                isRtl ? "text-right" : "text-left"
              )}
            >
              {selectedCity || t('selectCity')}
            </span>
            <div className={cn(
              "absolute inset-y-0 flex items-center pointer-events-none",
              isRtl ? "left-4" : "right-3"
            )}>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M1.5 3.75L6 8.25L10.5 3.75" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </div>

          {/* The actual Select component is visually hidden but provides functionality */}
          <div className="sr-only">
            <Select
              value={selectedCity || 'all'}
              onValueChange={handleCityChange}
              dir={isRtl ? "rtl" : "ltr"}
            >
              <SelectTrigger id="city-select-trigger">
                <SelectValue placeholder={t('selectCity')} />
              </SelectTrigger>
              <SelectContent 
                align={isRtl ? "end" : "start"} 
                sideOffset={4}
              >
                <SelectItem value="all">{t('allCities')}</SelectItem>
                {cities.map(city => (
                  <SelectItem key={city} value={city}>
                    {city}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </div>
  )
} 