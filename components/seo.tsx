import Head from 'next/head'

interface SEOProps {
  title: string
  description?: string
  ogTitle?: string
  ogDescription?: string
  ogImage?: string
  keywords?: string[]
  schema?: Record<string, any>
}

const SITE_NAME = 'MovieTime'

export function SEO({
  title,
  description,
  ogTitle,
  ogDescription,
  ogImage,
  keywords,
  schema
}: SEOProps) {
  const siteTitle = SITE_NAME
  const fullTitle = `${title} - ${siteTitle}`

  return (
    <Head>
      <title>{fullTitle}</title>
      {description && <meta name="description" content={description} />}
      {keywords && <meta name="keywords" content={keywords.join(', ')} />}

      <meta property="og:site_name" content={siteTitle} />
      <meta property="og:title" content={ogTitle || fullTitle} />
      {ogDescription && <meta property="og:description" content={ogDescription} />}
      {ogImage && <meta property="og:image" content={ogImage} />}
      <meta property="og:type" content="website" />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={ogTitle || fullTitle} />
      {ogDescription && <meta name="twitter:description" content={ogDescription} />}
      {ogImage && <meta name="twitter:image" content={ogImage} />}
      
      {schema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      )}
    </Head>
  )
}