'use client'

import { Link } from '@/app/i18n'
import { useTranslations } from 'next-intl'
import { useEffect, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Genre } from '@/types/shared'

export default function Footer({ locale = 'en' }: { locale?: string }) {
  const t = useTranslations('footer')
  const [categories, setCategories] = useState<Genre[]>([])
  
  // Fetch genre categories with translations
  useEffect(() => {
    const fetchGenres = async () => {
      const supabase = createClientComponentClient()
      try {
        // First get all genres
        const { data: genresData, error: genresError } = await supabase
          .from('genres')
          .select('id, slug')
          .order('slug')
          
        if (genresError) {
          console.error('Error fetching genres:', genresError)
          return
        }
        
        // Then get translations for current locale
        const { data: translations, error: translationsError } = await supabase
          .from('genre_translations')
          .select('genre_id, name')
          .eq('language_code', locale)
          .in('genre_id', genresData.map(g => g.id))
          
        if (translationsError) {
          console.error('Error fetching genre translations:', translationsError)
        }
        
        // Create a translation map
        const translationMap = new Map()
        translations?.forEach(trans => {
          translationMap.set(trans.genre_id, trans.name)
        })
        
        // Transform genres data with translations
        const transformedGenres = genresData
          .map(genre => ({
            id: genre.id,
            slug: genre.slug,
            name: translationMap.get(genre.id) || genre.slug // Fall back to slug if no translation
          }))
          .slice(0, 6) // Limit to 6 genres for footer
          
        setCategories(transformedGenres)
      } catch (error) {
        console.error('Failed to fetch genres:', error)
      }
    }
    
    fetchGenres()
  }, [locale])

  const topMovies = [
    { name: t('latestReleases'), href: '/movies/latest' },
    { name: t('topRated'), href: '/movies/top-rated' },
    { name: t('awardWinners'), href: '/movies/award-winners' },
    { name: t('comingSoon'), href: '/movies/coming-soon' }
  ]

  const resources = [
    { name: t('aboutUs'), href: '/about' },
    { name: t('blog'), href: '/blog' },
    { name: t('contact'), href: '/contact' },
    { name: t('sitemap'), href: '/sitemap.xml' }
  ]

  const legal = [
    { name: t('privacyPolicy'), href: '/privacy' },
    { name: t('termsOfService'), href: '/terms' },
    { name: t('cookiePolicy'), href: '/cookies' },
    { name: t('dmca'), href: '/dmca' }
  ]

  return (
    <footer className="border-t bg-card">
      <div className="container mx-auto px-4 py-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Categories */}
          <div>
            <h3 className="font-semibold text-lg mb-4">{t('categories')}</h3>
            <ul className="space-y-2">
              {categories.map((category) => (
                <li key={category.slug}>
                  <Link 
                    href={`/genres/${category.slug}`}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {category.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Top Movies */}
          <div>
            <h3 className="font-semibold text-lg mb-4">{t('topMovies')}</h3>
            <ul className="space-y-2">
              {topMovies.map((item) => (
                <li key={item.href}>
                  <Link 
                    href={item.href}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="font-semibold text-lg mb-4">{t('resources')}</h3>
            <ul className="space-y-2">
              {resources.map((item) => (
                <li key={item.href}>
                  {item.name === t('sitemap') ? (
                    <a 
                      href="/sitemap.xml"
                      className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {item.name}
                    </a>
                  ) : (
                    <Link 
                      href={item.href}
                      className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {item.name}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-semibold text-lg mb-4">{t('legal')}</h3>
            <ul className="space-y-2">
              {legal.map((item) => (
                <li key={item.href}>
                  <Link 
                    href={item.href}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-center md:text-left">
              <p className="text-sm text-muted-foreground">
                {t('allRightsReserved', { year: new Date().getFullYear() })}
              </p>
            </div>
            <div className="flex gap-6">
              <Link 
                href="https://twitter.com/serets_il" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                {t('socialMedia.twitter')}
              </Link>
              <Link 
                href="https://facebook.com/serets.il" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                {t('socialMedia.facebook')}
              </Link>
              <Link 
                href="https://www.instagram.com/movietime_il?igsh=M3I2a2JpZnNvamcz" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                {t('socialMedia.instagram')}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}