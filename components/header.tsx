'use client'

import { useState, useEffect, useMemo } from 'react'
import { Link } from '@/app/i18n'
import { useLocale, useTranslations } from 'next-intl'
import Image from 'next/image'
import { Menu, Film } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ModeToggle } from '@/components/mode-toggle'
import { LanguageSwitcher } from '@/components/language-switcher'
import { Search } from '@/components/search'
import { SearchDialog } from '@/components/search-dialog'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from '@/components/ui/navigation-menu'
import { cn } from '@/lib/utils'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import useSWR from 'swr'
import { memo } from 'react'

// Types
interface Genre {
  id: string
  name: string
  slug: string
}

interface Theater {
  id: string
  name: string
  location: string
  slug: string
}

// Fetch functions
const fetchCategories = async () => {
  const supabase = createClientComponentClient()
  const { data } = await supabase
    .from('genres')
    .select('id, name, slug')
    .order('name')
  return data || []
}

const fetchTheaters = async () => {
  const supabase = createClientComponentClient()
  const { data } = await supabase
    .from('theaters')
    .select('id, name, location, slug')
    .order('name')
  return data || []
}

// Top movies data - static to avoid unnecessary fetches
const topMovies = [
  { title: 'Latest Releases', href: '/movies/latest' },
  { title: 'Top Rated', href: '/movies/top-rated' },
  { title: 'Award Winners', href: '/movies/award-winners' },
  { title: 'Coming Soon', href: '/movies/coming-soon' }
]

// Memoized components
interface MobileMenuProps {
  isOpen: boolean
  setIsOpen: (open: boolean) => void
  categories: Genre[]
  theaters: Theater[]
  t: any
  locale: string
  isRtl: boolean
}

const MobileMenu = memo(function MobileMenu({ 
  isOpen, 
  setIsOpen, 
  categories, 
  theaters, 
  t, 
  locale, 
  isRtl 
}: MobileMenuProps) {
  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-6 w-6" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[300px] sm:w-[400px]">
        <nav className="flex flex-col gap-4">
          <div className="px-2 py-4 border-b">
            <Button asChild variant="outline" className="w-full">
              <Link href="/auth" onClick={() => setIsOpen(false)}>
                {t('signIn')}
              </Link>
            </Button>
            <div className="mt-4 flex justify-center">
              <LanguageSwitcher />
            </div>
          </div>

          <div className="space-y-3">
            <Link
              href="/shorts"
              className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-accent"
              onClick={() => setIsOpen(false)}
            >
              <Film className="h-4 w-4" />
              <span>{t('shorts')}</span>
            </Link>

            <h3 className="px-4 text-sm font-medium text-muted-foreground">{t('categories')}</h3>
            {categories.map((category) => (
              <Link
                key={category.slug}
                href={`/genres/${category.slug}`}
                className="block px-4 py-2 text-sm hover:bg-accent"
                onClick={() => setIsOpen(false)}
              >
                {category.name}
              </Link>
            ))}
          </div>

          <div className="space-y-3">
            <h3 className="px-4 text-sm font-medium text-muted-foreground">Theaters</h3>
            <Link
              href="/theaters"
              className="block px-4 py-2 text-sm hover:bg-accent"
              onClick={() => setIsOpen(false)}
            >
              All Theaters
            </Link>
            {theaters.slice(0, 5).map((theater) => (
              <Link
                key={theater.slug}
                href={`/theaters/${theater.slug}`}
                className="block px-4 py-2 text-sm hover:bg-accent"
                onClick={() => setIsOpen(false)}
              >
                {theater.name}
              </Link>
            ))}
          </div>

          <div className="space-y-3">
            <h3 className="px-4 text-sm font-medium text-muted-foreground">{t('movies')}</h3>
            {topMovies.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="block px-4 py-2 text-sm hover:bg-accent"
                onClick={() => setIsOpen(false)}
              >
                {t(item.title.toLowerCase().replace(' ', ''))}
              </Link>
            ))}
          </div>

          <Link
            href="/actors"
            className="block px-4 py-2 text-sm hover:bg-accent"
            onClick={() => setIsOpen(false)}
          >
            {t('actors')}
          </Link>

          <Link
            href="/blog"
            className="block px-4 py-2 text-sm hover:bg-accent"
            onClick={() => setIsOpen(false)}
          >
            {t('blog')}
          </Link>
        </nav>
      </SheetContent>
    </Sheet>
  )
})

// Main Header component
export default function Header() {
  const [mounted, setMounted] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const locale = useLocale()
  const t = useTranslations('navigation')
  const isRtl = locale === 'he'

  // Fetch data with SWR
  const { data: categories = [] } = useSWR<Genre[]>('categories', fetchCategories)
  const { data: theaters = [] } = useSWR<Theater[]>('theaters', fetchTheaters)

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
          <SearchDialog />
          <LanguageSwitcher />
          <ModeToggle />
          <Button asChild variant="outline" className="hidden md:inline-flex">
            <Link href="/auth">{t('signIn')}</Link>
          </Button>
          
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