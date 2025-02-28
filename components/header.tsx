'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Menu, Film } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ModeToggle } from '@/components/mode-toggle'
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
import { createBrowserClient } from '@supabase/ssr'

interface Genre {
  id: string
  name: string
  slug: string
}

const topMovies = [
  { title: 'Latest Releases', href: '/movies/latest' },
  { title: 'Top Rated', href: '/movies/top-rated' },
  { title: 'Award Winners', href: '/movies/award-winners' },
  { title: 'Coming Soon', href: '/movies/coming-soon' }
]

export default function Header() {
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [categories, setCategories] = useState<Genre[]>([])
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    async function fetchCategories() {
      const { data } = await supabase
        .from('genres')
        .select('id, name, slug')
        .order('name')
      
      if (data) {
        setCategories(data)
      }
    }

    fetchCategories()
  }, [supabase])

  return (
    <header className={cn(
      "sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60",
      "transition-all duration-200",
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
            <NavigationMenuList>
              <NavigationMenuItem>
                <NavigationMenuTrigger>Categories</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                    <li>
                      <Link
                        href="/shorts"
                        className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                      >
                        <div className="flex items-center gap-2 text-sm font-medium leading-none">
                          <Film className="h-4 w-4" />
                          <span>Shorts</span>
                        </div>
                        <p className="line-clamp-2 text-sm text-muted-foreground">
                          Watch movie trailers in a vertical feed
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
                <NavigationMenuTrigger>Top Movies</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid w-[400px] gap-3 p-4">
                    {topMovies.map((item) => (
                      <li key={item.href}>
                        <NavigationMenuLink asChild>
                          <Link
                            href={item.href}
                            className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                          >
                            <div className="text-sm font-medium leading-none">{item.title}</div>
                          </Link>
                        </NavigationMenuLink>
                      </li>
                    ))}
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <Link href="/actors" legacyBehavior passHref>
                  <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                    Actors
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <Link href="/blog" legacyBehavior passHref>
                  <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                    Blog
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <Link href="/shorts" legacyBehavior passHref>
                  <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                    Shorts
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        </div>

        <div className="flex items-center gap-4">
          <Search />
          <SearchDialog />
          <ModeToggle />
          <Button asChild variant="outline" className="hidden md:inline-flex">
            <Link href="/auth">Sign In</Link>
          </Button>
          
          {/* Mobile Menu */}
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
                      Sign In
                    </Link>
                  </Button>
                </div>

                <div className="space-y-3">
                  <Link
                    href="/shorts"
                    className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-accent"
                    onClick={() => setIsOpen(false)}
                  >
                    <Film className="h-4 w-4" />
                    <span>Shorts</span>
                  </Link>

                  <h3 className="px-4 text-sm font-medium text-muted-foreground">Categories</h3>
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
                  <h3 className="px-4 text-sm font-medium text-muted-foreground">Top Movies</h3>
                  {topMovies.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="block px-4 py-2 text-sm hover:bg-accent"
                      onClick={() => setIsOpen(false)}
                    >
                      {item.title}
                    </Link>
                  ))}
                </div>

                <Link
                  href="/actors"
                  className="block px-4 py-2 text-sm hover:bg-accent"
                  onClick={() => setIsOpen(false)}
                >
                  Actors
                </Link>

                <Link
                  href="/blog"
                  className="block px-4 py-2 text-sm hover:bg-accent"
                  onClick={() => setIsOpen(false)}
                >
                  Blog
                </Link>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}