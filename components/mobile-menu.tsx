'use client'

import { useState, useEffect } from 'react'
import { Link } from '@/app/i18n'
import Image from 'next/image'
import { Film, MapPin, Star, ChevronRight, ChevronLeft, X, Search, Moon, Sun, LogIn, MenuIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { LanguageSwitcherClient } from '@/components/language-switcher-client'
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTrigger, 
  SheetClose,
  SheetTitle
} from '@/components/ui/sheet'
import { createClient } from '@/lib/supabase'
import { User } from '@supabase/supabase-js'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Input } from '@/components/ui/input'
import { useRouter } from 'next/navigation'
import { useToast } from '@/components/ui/use-toast'
import { useTheme } from 'next-themes'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

import { Genre, Theater } from '@/types/shared'
import { cn } from '@/lib/utils'

interface MobileMenuProps {
  isOpen: boolean
  setIsOpen: (open: boolean) => void
  categories: Genre[]
  theaters: Theater[]
  t: any
  locale: string
  isRtl: boolean
}

// Top movies data - static to avoid unnecessary fetches
const topMovies = [
  { title: 'Latest Releases', href: '/movies/latest' },
  { title: 'Top Rated', href: '/movies/top-rated' },
  { title: 'Award Winners', href: '/movies/award-winners' },
  { title: 'Coming Soon', href: '/movies/coming-soon' }
]

export function MobileMenu({ 
  isOpen, 
  setIsOpen, 
  categories, 
  theaters, 
  t, 
  locale, 
  isRtl 
}: MobileMenuProps) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createClient()
  const { theme, setTheme } = useTheme()

  useEffect(() => {
    async function getUser() {
      const { data: { session } } = await supabase.auth.getSession()
      setUser(session?.user || null)
      setLoading(false)
    }

    getUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null)
    })

    return () => subscription.unsubscribe()
  }, [supabase])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    toast({
      title: "Sign Out",
      description: "You have been signed out successfully."
    })
    router.push(`/${locale}`)
    setIsOpen(false)
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/${locale}/search?q=${encodeURIComponent(searchQuery)}`)
      setIsOpen(false)
    }
  }

  // Get user initials for avatar fallback
  const getInitials = () => {
    if (!user || !user.email) return 'U'
    return user.email.substring(0, 2).toUpperCase()
  }

  // Get the appropriate chevron based on direction
  const DirectionIcon = isRtl ? ChevronLeft : ChevronRight

  // Function to toggle theme
  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark')
  }

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <MenuIcon className="h-6 w-6" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent 
        side={isRtl ? "right" : "left"} 
        className="w-full h-full p-0 flex flex-col bg-background"
      >
        <SheetHeader className="sr-only">
          <SheetTitle>{t('menuTitle', 'Main Menu')}</SheetTitle>
        </SheetHeader>
        
        <div className={cn(
          "flex-1 overflow-y-auto",
          isRtl && "rtl"
        )}>
          {/* Header */}
          <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b theme-transition">
            <div className="flex items-center justify-between p-4">
              <SheetClose asChild>
                <Button variant="ghost" size="icon">
                  <X className="h-6 w-6" />
                </Button>
              </SheetClose>
              
              <Link href="/" onClick={() => setIsOpen(false)}>
                <Image
                  src="https://llasjkahpdovjshvroky.supabase.co/storage/v1/object/public/movie-posters//serets.co.il-logo-v1.svg"
                  alt="SERETS.CO.IL"
                  width={120}
                  height={32}
                  style={{ width: 'auto', height: '32px' }}
                  priority
                />
              </Link>
            </div>

            {/* User Profile Section */}
            <div className="px-4 py-3 border-b">
              {!loading && (
                user ? (
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={user.user_metadata.avatar_url} />
                        <AvatarFallback>{getInitials()}</AvatarFallback>
                      </Avatar>
                      <div className="overflow-hidden">
                        <p className="font-medium truncate">
                          {user.user_metadata.full_name || user.email?.split('@')[0]}
                        </p>
                        <p className="text-sm text-muted-foreground truncate max-w-[200px]">
                          {user.email}
                        </p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <Button asChild variant="outline" size="sm">
                        <Link href="/profile" onClick={() => setIsOpen(false)}>
                          Profile
                        </Link>
                      </Button>
                      <Button variant="outline" size="sm" onClick={handleSignOut}>
                        Sign Out
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Button asChild variant="default" className="w-full">
                    <Link href={`/auth`} onClick={() => setIsOpen(false)}>
                      <LogIn className={cn("h-4 w-4", isRtl ? "ml-2" : "mr-2")} />
                      {t('signIn')}
                    </Link>
                  </Button>
                )
              )}
            </div>

            {/* Search Bar */}
            <div className="p-4 border-b">
              <form onSubmit={handleSearch} className="relative">
                <Search className={cn(
                  "absolute top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground",
                  isRtl ? "right-3" : "left-3"
                )} />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t('search', 'Search')}
                  className={cn(
                    "w-full",
                    isRtl ? "pr-10 pl-4" : "pl-10 pr-4"
                  )}
                />
              </form>
            </div>

            {/* Language Switcher */}
            <div className="p-4 border-b">
              <p className="text-sm font-medium mb-2 text-muted-foreground">{t('language', 'Language')}</p>
              <LanguageSwitcherClient locale={locale} />
            </div>
          </div>

          {/* Navigation Menu */}
          <div className="p-4">
            <Accordion type="single" collapsible className="w-full">
              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className={cn(
                  "flex items-center justify-between w-full py-3 px-1 text-base font-medium border-b",
                  isRtl && "flex-row-reverse text-right"
                )}
              >
                <div className="flex items-center gap-3">
                  {theme === 'dark' ? (
                    <Sun className="h-5 w-5 text-primary" />
                  ) : (
                    <Moon className="h-5 w-5 text-primary" />
                  )}
                  <span>
                    {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
                  </span>
                </div>
              </button>

              {/* Shorts */}
              <Link
                href="/shorts"
                className="flex items-center justify-between py-3 px-1 text-base font-medium border-b"
                onClick={() => setIsOpen(false)}
              >
                <div className="flex items-center gap-3">
                  <Film className="h-5 w-5 text-primary" />
                  <span>{t('shorts')}</span>
                </div>
                <DirectionIcon className={cn(
                  "h-5 w-5 text-muted-foreground",
                  isRtl && "transform rotate-180"
                )} />
              </Link>

              {/* Categories */}
              <AccordionItem value="categories" className="border-b">
                <AccordionTrigger className={cn(
                  "py-3 px-1 text-base font-medium hover:no-underline",
                  isRtl && "flex-row-reverse"
                )}>
                  <div className="flex items-center gap-3">
                    <Star className="h-5 w-5 text-primary" />
                    <span>{t('categories')}</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className={cn(
                  isRtl ? "pr-8 pl-1" : "pl-8 pr-1"
                )}>
                  <div className="space-y-3 py-1">
                    {categories.map((category) => (
                      <Link
                        key={category.slug}
                        href={`/genres/${category.slug}`}
                        className="block text-sm hover:text-primary"
                        onClick={() => setIsOpen(false)}
                      >
                        {category.name}
                      </Link>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* Theaters */}
              <AccordionItem value="theaters" className="border-b">
                <AccordionTrigger className={cn(
                  "py-3 px-1 text-base font-medium hover:no-underline",
                  isRtl && "flex-row-reverse"
                )}>
                  <div className="flex items-center gap-3">
                    <MapPin className="h-5 w-5 text-primary" />
                    <span>{t('theaters')}</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className={cn(
                  isRtl ? "pr-8 pl-1" : "pl-8 pr-1"
                )}>
                  <Link
                    href="/theaters"
                    className="block mb-3 text-sm font-medium hover:text-primary"
                    onClick={() => setIsOpen(false)}
                  >
                    {t('theaters')}
                  </Link>
                  <div className="space-y-3">
                    {theaters.slice(0, 5).map((theater) => (
                      <Link
                        key={theater.slug}
                        href={`/theaters/${theater.slug}`}
                        className="block text-sm hover:text-primary"
                        onClick={() => setIsOpen(false)}
                      >
                        {theater.name}
                      </Link>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* Movies */}
              <AccordionItem value="movies" className="border-b">
                <AccordionTrigger className={cn(
                  "py-3 px-1 text-base font-medium hover:no-underline",
                  isRtl && "flex-row-reverse"
                )}>
                  <div className="flex items-center gap-3">
                    <Film className="h-5 w-5 text-primary" />
                    <span>{t('movies')}</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className={cn(
                  isRtl ? "pr-8 pl-1" : "pl-8 pr-1"
                )}>
                  <div className="space-y-3 py-1">
                    {topMovies.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        className="block text-sm hover:text-primary"
                        onClick={() => setIsOpen(false)}
                      >
                        {t(item.title.toLowerCase().replace(' ', ''))}
                      </Link>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* Direct Links */}
              <Link
                href="/actors"
                className="flex items-center justify-between py-3 px-1 text-base font-medium border-b"
                onClick={() => setIsOpen(false)}
              >
                <span>{t('actors')}</span>
                <DirectionIcon className={cn(
                  "h-5 w-5 text-muted-foreground",
                  isRtl && "transform rotate-180"
                )} />
              </Link>

              <Link
                href="/blog"
                className="flex items-center justify-between py-3 px-1 text-base font-medium border-b"
                onClick={() => setIsOpen(false)}
              >
                <span>{t('blog')}</span>
                <DirectionIcon className={cn(
                  "h-5 w-5 text-muted-foreground",
                  isRtl && "transform rotate-180"
                )} />
              </Link>
            </Accordion>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}