'use client'

import { useState, useEffect, useMemo } from 'react'
import { Link } from '@/app/i18n'
import { useTranslations } from 'next-intl'
import Image from 'next/image'
import { Film, Search as SearchIcon } from 'lucide-react'
import { ModeToggle } from './mode-toggle'
import { LanguageSwitcherClient } from './language-switcher-client'
import { Search } from './search'
import { SearchDialog } from './search-dialog'
import { UserProfileMenu } from './user-profile-menu'
import { MobileMenu } from './mobile-menu'
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from './ui/navigation-menu'
import { cn } from '@/lib/utils'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import useSWR from 'swr'
import { Genre, Theater } from '@/types/shared'
import { fetchWithRetry } from '@/lib/supabase'
import { Button } from './ui/button'

// Fetch functions
const fetchCategories = async (): Promise<Genre[]> => {
  try {
    const client = createClientComponentClient()
    
    // Use fetchWithRetry to make this more reliable
    const { data, error } = await fetchWithRetry(async () => {
      const response = await client
        .from('genres')
        .select(`
          id, 
          slug,
          translations:genre_translations(name)
        `)
        .eq('translations.language_code', 'en')
        .order('slug');
      return response;
    });
    
    if (error) {
      console.error('Error fetching categories:', error.message)
      return []
    }
    
    // Transform the data to match the expected format
    const transformedData = data?.map((genre: { id: string; slug: string; translations: { name: string }[] }) => ({
      id: genre.id,
      slug: genre.slug,
      name: genre.translations && genre.translations.length > 0 
        ? genre.translations[0].name 
        : genre.slug // Fallback to slug if no translation
    })) as Genre[] || []
    
    return transformedData
  } catch (error) {
    console.error('Exception fetching categories:', error)
    // Return empty array to avoid breaking the UI
    return []
  }
}

const fetchTheaters = async (): Promise<Theater[]> => {
  try {
    const client = createClientComponentClient()
    
    // Use fetchWithRetry to make this more reliable
    const { data, error } = await fetchWithRetry(async () => {
      const response = await client
        .from('theaters')
        .select('id, name, location, slug')
        .order('name');
      return response;
    });
    
    if (error) {
      console.error('Error fetching theaters:', error.message)
      return []
    }
    
    return data || []
  } catch (error) {
    console.error('Exception fetching theaters:', error)
    // Return empty array to avoid breaking the UI
    return []
  }
}

type NavigationKeys = 
  | 'categories' 
  | 'theaters' 
  | 'movies' 
  | 'actors' 
  | 'blog' 
  | 'shorts' 
  | 'search'
  | 'allTheaters'
  | 'browseTheaters'
  | 'latestReleases'
  | 'topRated'
  | 'awardWinners'
  | 'comingSoon'
  | 'shortsDescription';

// Top movies data - static to avoid unnecessary fetches
type MovieSection = {
  title: 'Latest Releases' | 'Top Rated' | 'Award Winners' | 'Coming Soon'
  href: string
  key: NavigationKeys
}

const topMovies: MovieSection[] = [
  { title: 'Latest Releases', href: '/movies/latest', key: 'latestReleases' },
  { title: 'Top Rated', href: '/movies/top-rated', key: 'topRated' },
  { title: 'Award Winners', href: '/movies/award-winners', key: 'awardWinners' },
  { title: 'Coming Soon', href: '/movies/coming-soon', key: 'comingSoon' }
]

// Main Header component
export default function HeaderClient({ locale }: { locale: string }) {
  const [mounted, setMounted] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const t = useTranslations('navigation') as (key: NavigationKeys) => string
  const isRtl = locale === 'he'

  // Fetch data with SWR
  const { data: categories = [], error: categoriesError } = useSWR<Genre[]>('categories', fetchCategories, {
    fallbackData: [], // Provide fallback data to avoid null issues
    revalidateOnFocus: false,
    dedupingInterval: 60000, // 1 minute
  })
  
  useEffect(() => {
    if (categoriesError) {
      console.error('SWR categories error:', categoriesError)
    }
  }, [categoriesError])
  
  const { data: theaters = [] } = useSWR<Theater[]>('theaters', fetchTheaters, {
    fallbackData: [], // Provide fallback data to avoid null issues
    revalidateOnFocus: false,
    dedupingInterval: 60000, // 1 minute
  })

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Memoize navigation menu items
  const navigationMenuItems = useMemo(() => (
    <NavigationMenuList>
      <NavigationMenuItem>
        <NavigationMenuTrigger>{t('categories')}</NavigationMenuTrigger>
        <NavigationMenuContent>
          <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
            <li>
              <Link
                href="/shorts"
                className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
              >
                <div className="flex items-center gap-2 text-sm font-medium leading-none">
                  <Film className="h-4 w-4" />
                  <span>{t('shorts')}</span>
                </div>
                <p className="line-clamp-2 text-sm text-muted-foreground">
                  {t('shortsDescription')}
                </p>
              </Link>
            </li>
            <li className="md:col-span-2">
              <div className="border-b my-2" />
            </li>
            {categories.map((category) => (
              <li key={category.slug}>
                <NavigationMenuLink asChild>
                  <Link
                    href={`/genres/${category.slug}`}
                    className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                  >
                    <div className="text-sm font-medium leading-none">{category.name}</div>
                  </Link>
                </NavigationMenuLink>
              </li>
            ))}
          </ul>
        </NavigationMenuContent>
      </NavigationMenuItem>

      <NavigationMenuItem>
        <NavigationMenuTrigger>{t('theaters')}</NavigationMenuTrigger>
        <NavigationMenuContent>
          <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
            <li className="md:col-span-2">
              <Link
                href="/theaters"
                className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
              >
                <div className="text-sm font-medium leading-none">{t('allTheaters')}</div>
          <p className="line-clamp-2 text-sm text-muted-foreground">
            {t('browseTheaters')}
          </p>
              </Link>
              <div className="border-b my-2" />
            </li>
            
            {theaters.map((theater) => (
              <li key={theater.slug}>
                <NavigationMenuLink asChild>
                  <Link
                    href={`/theaters/${theater.slug}`}
                    className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                  >
                    <div className="text-sm font-medium leading-none">{theater.name}</div>
                    <p className="line-clamp-1 text-xs text-muted-foreground mt-1">
                      {theater.location}
                    </p>
                  </Link>
                </NavigationMenuLink>
              </li>
            ))}
          </ul>
        </NavigationMenuContent>
      </NavigationMenuItem>

      <NavigationMenuItem>
        <NavigationMenuTrigger>{t('movies')}</NavigationMenuTrigger>
        <NavigationMenuContent>
          <ul className="grid w-[400px] gap-3 p-4">
            {topMovies.map((item) => (
              <li key={item.href}>
                <NavigationMenuLink asChild>
                  <Link
                    href={item.href}
                    className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                  >
            <div className="text-sm font-medium leading-none">
              {t(item.key)}
            </div>
                  </Link>
                </NavigationMenuLink>
              </li>
            ))}
          </ul>
        </NavigationMenuContent>
      </NavigationMenuItem>

      <NavigationMenuItem>
        <NavigationMenuLink asChild>
          <Link href="/actors" className={navigationMenuTriggerStyle()}>
            {t('actors')}
          </Link>
        </NavigationMenuLink>
      </NavigationMenuItem>

      <NavigationMenuItem>
        <NavigationMenuLink asChild>
          <Link href="/blog" className={navigationMenuTriggerStyle()}>
            {t('blog')}
          </Link>
        </NavigationMenuLink>
      </NavigationMenuItem>

      <NavigationMenuItem>
        <NavigationMenuLink asChild>
          <Link href="/shorts" className={navigationMenuTriggerStyle()}>
            {t('shorts')}
          </Link>
        </NavigationMenuLink>
      </NavigationMenuItem>
    </NavigationMenuList>
  ), [categories, theaters, t, locale])

  if (!mounted) {
    return null
  }

  return (
    <header className={cn(
      "sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60",
      "theme-transition",
      scrolled && "shadow-sm"
    )}>
      <div className="container flex h-16 items-center justify-between px-4">
        {/* Logo - Always visible */}
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center">
            <Image
              src="https://llasjkahpdovjshvroky.supabase.co/storage/v1/object/public/movie-posters//serets.co.il-logo-v1.svg"
              alt="SERETS.CO.IL"
              width={120}
              height={40}
              className="h-8 w-auto"
              priority
            />
          </Link>
          
          {/* Desktop Navigation - Hidden on mobile */}
          <div className="hidden md:flex">
            <NavigationMenu>
              {navigationMenuItems}
            </NavigationMenu>
          </div>
        </div>
        
        {/* Right-side elements: search, theme toggle, language switcher, user profile, mobile menu */}
        <div className="flex items-center gap-3">
          {/* Desktop Search - Hidden on mobile */}
          <div className="hidden md:block">
            <Search />
          </div>
          
          {/* Mobile Search Dialog - For mobile only */}
          <SearchDialog open={searchOpen} onOpenChange={setSearchOpen} />
          
          {/* Mobile Search Icon Button - Visible only on mobile */}
          <Button 
            variant="ghost" 
            size="icon" 
            className="md:hidden"
            onClick={() => setSearchOpen(true)}
          >
            <SearchIcon className="h-5 w-5" />
            <span className="sr-only">{t('search')}</span>
          </Button>
          
          {/* Theme Toggle - Only visible on desktop */}
          <div className="hidden md:block">
            <ModeToggle />
          </div>
          
          {/* Language Switcher - Only visible on desktop */}
          <div className="hidden md:block">
            <LanguageSwitcherClient locale={locale} />
          </div>
          
          {/* User Profile Menu - Only visible on desktop */}
          <div className="hidden md:block">
            <UserProfileMenu />
          </div>
          
          {/* Mobile Menu - Only visible on mobile */}
          <MobileMenu 
            isOpen={isOpen} 
            setIsOpen={setIsOpen} 
            categories={categories} 
            theaters={theaters} 
            t={t} 
            locale={locale} 
            isRtl={isRtl} 
          />
        </div>
      </div>
    </header>
  )
}