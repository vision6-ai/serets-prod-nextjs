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

  // Load saved city from localStorage on initial render
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedCity = localStorage.getItem('selectedCity');
      if (savedCity) {
        setSelectedCity(savedCity);
        // Trigger search with saved city
        onSearch('', savedCity);
      }
    }
  }, [onSearch]);

  // Add global style for dropdown width and handle window resize
  useEffect(() => {
    // Set default dropdown width
    document.documentElement.style.setProperty('--city-selector-width', '100%');
    
    // Add custom styles for dropdown portals - with extreme !important rules
    const style = document.createElement('style');
    style.textContent = `
      [data-radix-select-content],
      [data-radix-select-content][data-side="bottom"],
      [data-radix-select-content][data-state="open"],
      .select-dropdown[data-radix-select-content] {
        left: 0 !important;
        right: 0 !important;
        margin-left: auto !important;
        margin-right: auto !important;
        transform: none !important;
        position: fixed !important;
        width: var(--city-selector-width, 90vw) !important;
        max-width: 500px !important;
        top: var(--city-selector-top, 120px) !important;
        border-radius: 8px !important;
        border: 1px solid #333 !important;
        box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2) !important;
        padding: 0 !important;
        background-color: #000 !important;
      }
      
      [data-radix-select-content] [role="option"] {
        padding: 16px 20px !important;
        color: white !important;
        font-size: 18px !important;
        border-bottom: 1px solid rgba(255,255,255,0.1) !important;
        line-height: 1.5 !important;
      }
      
      [data-radix-select-content] [role="option"]:last-child {
        border-bottom: none !important;
      }
      
      [data-radix-select-content] [role="option"][data-highlighted] {
        background-color: rgba(255,255,255,0.05) !important;
      }
      
      [data-radix-select-content] [data-radix-select-viewport] {
        padding: 0 !important;
      }
    `;
    document.head.appendChild(style);
    
    // Update measurements on mount and resize
    const updateMeasurements = () => {
      const cityField = document.querySelector('.city-selector-field');
      if (cityField) {
        const rect = cityField.getBoundingClientRect();
        const width = rect.width;
        const topPosition = rect.bottom + window.scrollY + 8;
        
        document.documentElement.style.setProperty('--city-selector-width', `${width}px`);
        document.documentElement.style.setProperty('--city-selector-top', `${topPosition}px`);
      }
    };
    
    // Add resize event listener
    window.addEventListener('resize', updateMeasurements);
    
    // Initial call
    updateMeasurements();
    
    // Clean up
    return () => {
      document.documentElement.style.removeProperty('--city-selector-width');
      document.documentElement.style.removeProperty('--city-selector-top');
      window.removeEventListener('resize', updateMeasurements);
      document.head.removeChild(style);
    };
  }, []);

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
    
    // Save city selection to localStorage for persistence
    if (newCity) {
      localStorage.setItem('selectedCity', newCity);
    } else {
      localStorage.removeItem('selectedCity');
    }
    
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
              "city-selector-field relative h-12 rounded-md border border-input bg-card shadow-sm flex items-center cursor-pointer",
              isRtl ? "pr-4 pl-12 flex-row-reverse" : "pl-4 pr-10"
            )}
            ref={(node) => {
              // Immediately set the width variable when this component mounts
              if (node) {
                const rect = node.getBoundingClientRect();
                document.documentElement.style.setProperty('--city-selector-width', `${rect.width}px`);
              }
            }}
            onClick={() => {
              // Create a click event on the actual select trigger which is hidden
              const selectTrigger = document.getElementById('city-select-trigger');
              
              // Update the width measurement on each click as well
              const cityField = document.querySelector('.city-selector-field');
              if (cityField) {
                const rect = cityField.getBoundingClientRect();
                document.documentElement.style.setProperty('--city-selector-width', `${rect.width}px`);
                
                // Calculate and set top position for dropdown
                const topPosition = rect.bottom + window.scrollY + 4; // 4px spacing to match screenshot
                document.documentElement.style.setProperty('--city-selector-top', `${topPosition}px`);
              }
              
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
                className="select-dropdown"
                onCloseAutoFocus={(e: Event) => {
                  e.preventDefault();
                }}
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