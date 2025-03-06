'use server'

import { headers } from 'next/headers'
import HeaderClient from './header-client'
import { useLocale } from 'next-intl'

export default async function HeaderWrapper() {
  // Get the locale from the URL path
  const headersList = headers()
  const pathname = headersList.get('x-pathname') || ''
  const locale = pathname.split('/')[1] || 'en'
  
  return <HeaderClient locale={locale} />
} 