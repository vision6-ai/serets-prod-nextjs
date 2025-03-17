import { Link } from '@/app/i18n'

export default function Footer() {
  const categories = [
    { name: 'Drama', slug: 'drama' },
    { name: 'Comedy', slug: 'comedy' },
    { name: 'Documentary', slug: 'documentary' },
    { name: 'Thriller', slug: 'thriller' },
    { name: 'War', slug: 'war' },
    { name: 'Family', slug: 'family' }
  ]

  const topMovies = [
    { name: 'Latest Releases', href: '/movies/latest' },
    { name: 'Top Rated', href: '/movies/top-rated' },
    { name: 'Award Winners', href: '/movies/award-winners' },
    { name: 'Coming Soon', href: '/movies/coming-soon' }
  ]

  const resources = [
    { name: 'About Us', href: '/about' },
    { name: 'Blog', href: '/blog' },
    { name: 'Contact', href: '/contact' },
    { name: 'Sitemap', href: '/sitemap.xml' }
  ]

  const legal = [
    { name: 'Privacy Policy', href: '/privacy' },
    { name: 'Terms of Service', href: '/terms' },
    { name: 'Cookie Policy', href: '/cookies' },
    { name: 'DMCA', href: '/dmca' }
  ]

  return (
    <footer className="border-t bg-card">
      <div className="container mx-auto px-4 py-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Categories */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Categories</h3>
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
            <h3 className="font-semibold text-lg mb-4">Top Movies</h3>
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
            <h3 className="font-semibold text-lg mb-4">Resources</h3>
            <ul className="space-y-2">
              {resources.map((item) => (
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

          {/* Legal */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Legal</h3>
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
                Built by Yinon
              </p>
              <p className="text-sm text-muted-foreground">
                © {new Date().getFullYear()} MovieTime. All rights reserved.
              </p>
            </div>
            <div className="flex gap-6">
              <Link 
                href="https://twitter.com/serets_il" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                Twitter
              </Link>
              <Link 
                href="https://facebook.com/serets.il" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                Facebook
              </Link>
              <Link 
                href="https://instagram.com/serets.il" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                Instagram
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}