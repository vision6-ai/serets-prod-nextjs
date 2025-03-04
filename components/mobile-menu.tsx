'use client'

import { useState, useEffect } from 'react'
import { Link } from '@/app/i18n'
import { Film } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { LanguageSwitcher } from '@/components/language-switcher'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Menu } from 'lucide-react'
import { createClient } from '@/lib/supabase'
import { User } from '@supabase/supabase-js'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useRouter } from 'next/navigation'
import { useToast } from '@/components/ui/use-toast'

// Types
interface Genre {
  id: string
  name: string
  hebrew_name: string | null
  photo_url: string | null
  slug: string
}

interface Theater {
  id: string
  name: string
  location: string
  slug: string
}

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
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createClient()

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

  // Get user initials for avatar fallback
  const getInitials = () => {
    if (!user || !user.email) return 'U'
    return user.email.substring(0, 2).toUpperCase()
  }

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
            {!loading && (
              user ? (
                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={user.user_metadata.avatar_url} />
                      <AvatarFallback>{getInitials()}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">
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
                <Button asChild variant="outline" className="w-full">
                  <Link href="/auth" onClick={() => setIsOpen(false)}>
                    {t('signIn')}
                  </Link>
                </Button>
              )
            )}
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
} 