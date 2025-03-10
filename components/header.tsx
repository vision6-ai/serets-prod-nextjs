'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { Link } from '@/app/i18n'
import { useLocale, useTranslations } from 'next-intl'
import Image from 'next/image'
import { Film } from 'lucide-react'
import { ModeToggle } from './mode-toggle'
import { LanguageSwitcher } from './language-switcher'
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

// Fetch functions
const fetchCategories = async (): Promise<Genre[]> => {
  try {
    const client = createClientComponentClient()
    const { data, error } = await client
      .from('genres')
      .select(`
        id, 
        slug,
        translations:genre_translations(name)
      `)
      .eq('translations.language_code', 'en')
      .order('slug')
    
    if (error) {
      console.error('Error fetching categories:', error.message)
      return []
    }
    
    // Transform the data to match the expected format
    const transformedData = data?.map(genre => ({
      id: genre.id,
      slug: genre.slug,
      name: genre.translations && genre.translations.length > 0 
        ? genre.translations[0].name 
        : genre.slug // Fallback to slug if no translation
    })) as Genre[] || []
    
    return transformedData
  } catch (error) {
    console.error('Exception fetching categories:', error)
    return []
  }
}

const fetchTheaters = async () => {
  try {
    const client = createClientComponentClient()
    const { data, error } = await client
      .from('theaters')
      .select('id, name, location, slug')
      .order('name')
    
    if (error) {
      console.error('Error fetching theaters:', error.message)
      return []
    }
    
    return data || []
  } catch (error) {
    console.error('Exception fetching theaters:', error)
    return []
  }
}

// Top movies data - static to avoid unnecessary fetches
const topMovies = [
  { title: 'Latest Releases', href: '/movies/latest' },
  { title: 'Top Rated', href: '/movies/top-rated' },
  { title: 'Award Winners', href: '/movies/award-winners' },
  { title: 'Coming Soon', href: '/movies/coming-soon' }
]

// Main Header component
export default function Header() {
  const [mounted, setMounted] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const locale = useLocale()
  const t = useTranslations('navigation')
  const isRtl = locale === 'he'

  // Fetch data with SWR
  const { data: categories = [], error: categoriesError } = useSWR<Genre[]>('categories', fetchCategories)
  
  useEffect(() => {
    if (categoriesError) {
      console.error('SWR categories error:', categoriesError)
    }
  }, [categoriesError])
  
  const { data: theaters = [] } = useSWR<Theater[]>('theaters', fetchTheaters)

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleScroll = useCallback(() => {
    if (typeof window !== 'undefined') {
      setScrolled(window.scrollY > 20)
    }
  }, [])

  useEffect(() => {
    if (typeof window !== 'undefined') {
      handleScroll() // Check initial scroll position
      window.addEventListener('scroll', handleScroll, { passive: true })
      return () => window.removeEventListener('scroll', handleScroll)
    }
  }, [handleScroll])

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
        <NavigationMenuTrigger>Theaters</NavigationMenuTrigger>
        <NavigationMenuContent>
          <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
            <li className="md:col-span-2">
              <Link
                href="/theaters"
                className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
              >
                <div className="text-sm font-medium leading-none">All Theaters</div>
                <p className="line-clamp-2 text-sm text-muted-foreground">
                  Browse all theaters and cinema locations
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
                    <div className="text-sm font-medium leading-none">{t(item.title.toLowerCase().replace(' ', ''))}</div>
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
  ), [categories, theaters, t])

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
        <div className="flex items-center gap-6">
          <Link href="/" className="hidden md:block">
            <Image
              src="https://llasjkahpdovjshvroky.supabase.co/storage/v1/object/public/movie-posters//serets.co.il-logo-v1.svg"
              alt="SERETS.CO.IL"
              width={120}
              height={32}
              style={{ width: 'auto', height: '32px' }}
              priority
            />
          </Link>
          <Link href="/" className="md:hidden">
            <Image
              src="https://llasjkahpdovjshvroky.supabase.co/storage/v1/object/public/movie-posters//serets.co.il-logo-v1.svg"
              alt="SERETS"
              width={90}
              height={32}
              style={{ width: 'auto', height: '32px' }}
              priority
            />
          </Link>
          
          <NavigationMenu className="hidden md:flex">
            {navigationMenuItems}
          </NavigationMenu>
        </div>

        <div className="flex items-center gap-4">
          <Search />
          <SearchDialog open={searchOpen} onOpenChange={setSearchOpen} />
          <LanguageSwitcher />
          <ModeToggle />
          <UserProfileMenu />
          
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
