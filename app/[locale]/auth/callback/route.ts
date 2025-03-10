import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  
  // Extract locale from the URL path
  const pathParts = requestUrl.pathname.split('/')
  const locale = pathParts[1] || 'en' // Default to 'en' if not found

  if (code) {
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })
    await supabase.auth.exchangeCodeForSession(code)
  }

  // URL to redirect to after sign in process completes, including locale
  return NextResponse.redirect(new URL(`/${locale}/profile`, requestUrl.origin))
} 