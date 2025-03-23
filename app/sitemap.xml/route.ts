import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function GET() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Fetch all movies
  const { data: movies } = await supabase
    .from('movies')
    .select('slug')
    .order('release_date', { ascending: false });

  // Fetch all genres
  const { data: genres } = await supabase
    .from('genres')
    .select('slug');

  // Get the site URL from env vars or use a default
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://serets.co.il';
  
  // Create the XML content
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
  <!-- Main pages -->
  <url>
    <loc>${siteUrl}</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
    <xhtml:link rel="alternate" hreflang="en" href="${siteUrl}/en" />
    <xhtml:link rel="alternate" hreflang="he" href="${siteUrl}/he" />
  </url>
  <url>
    <loc>${siteUrl}/en/movies</loc>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
    <xhtml:link rel="alternate" hreflang="en" href="${siteUrl}/en/movies" />
    <xhtml:link rel="alternate" hreflang="he" href="${siteUrl}/he/movies" />
  </url>
  <url>
    <loc>${siteUrl}/en/actors</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
    <xhtml:link rel="alternate" hreflang="en" href="${siteUrl}/en/actors" />
    <xhtml:link rel="alternate" hreflang="he" href="${siteUrl}/he/actors" />
  </url>
  <url>
    <loc>${siteUrl}/en/theaters</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
    <xhtml:link rel="alternate" hreflang="en" href="${siteUrl}/en/theaters" />
    <xhtml:link rel="alternate" hreflang="he" href="${siteUrl}/he/theaters" />
  </url>

  <!-- Movie pages -->
  ${movies?.map(movie => `
  <url>
    <loc>${siteUrl}/en/movies/${movie.slug}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
    <xhtml:link rel="alternate" hreflang="en" href="${siteUrl}/en/movies/${movie.slug}" />
    <xhtml:link rel="alternate" hreflang="he" href="${siteUrl}/he/movies/${movie.slug}" />
  </url>`).join('') || ''}

  <!-- Genre pages -->
  ${genres?.map(genre => `
  <url>
    <loc>${siteUrl}/en/genres/${genre.slug}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.6</priority>
    <xhtml:link rel="alternate" hreflang="en" href="${siteUrl}/en/genres/${genre.slug}" />
    <xhtml:link rel="alternate" hreflang="he" href="${siteUrl}/he/genres/${genre.slug}" />
  </url>`).join('') || ''}

  <!-- Static pages -->
  <url>
    <loc>${siteUrl}/en/about</loc>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
    <xhtml:link rel="alternate" hreflang="en" href="${siteUrl}/en/about" />
    <xhtml:link rel="alternate" hreflang="he" href="${siteUrl}/he/about" />
  </url>
  <url>
    <loc>${siteUrl}/en/privacy</loc>
    <changefreq>yearly</changefreq>
    <priority>0.3</priority>
    <xhtml:link rel="alternate" hreflang="en" href="${siteUrl}/en/privacy" />
    <xhtml:link rel="alternate" hreflang="he" href="${siteUrl}/he/privacy" />
  </url>
  <url>
    <loc>${siteUrl}/en/terms</loc>
    <changefreq>yearly</changefreq>
    <priority>0.3</priority>
    <xhtml:link rel="alternate" hreflang="en" href="${siteUrl}/en/terms" />
    <xhtml:link rel="alternate" hreflang="he" href="${siteUrl}/he/terms" />
  </url>
  <url>
    <loc>${siteUrl}/en/cookies</loc>
    <changefreq>yearly</changefreq>
    <priority>0.3</priority>
    <xhtml:link rel="alternate" hreflang="en" href="${siteUrl}/en/cookies" />
    <xhtml:link rel="alternate" hreflang="he" href="${siteUrl}/he/cookies" />
  </url>
  <url>
    <loc>${siteUrl}/en/dmca</loc>
    <changefreq>yearly</changefreq>
    <priority>0.3</priority>
    <xhtml:link rel="alternate" hreflang="en" href="${siteUrl}/en/dmca" />
    <xhtml:link rel="alternate" hreflang="he" href="${siteUrl}/he/dmca" />
  </url>
  <url>
    <loc>${siteUrl}/en/contact</loc>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
    <xhtml:link rel="alternate" hreflang="en" href="${siteUrl}/en/contact" />
    <xhtml:link rel="alternate" hreflang="he" href="${siteUrl}/he/contact" />
  </url>
</urlset>`;

  // Return the XML with the correct content type
  return new NextResponse(xml, {
    headers: {
      'Content-Type': 'application/xml',
    },
  });
} 