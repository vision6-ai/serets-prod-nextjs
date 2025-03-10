'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import { useTheme } from 'next-themes'
import { useTranslations } from 'next-intl'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader } from '@/components/ui/card'
import { Film, Clapperboard, Star } from 'lucide-react'
import { createClient } from '@/lib/supabase'

export default function AuthClient() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { theme } = useTheme()
  const t = useTranslations('Auth')
  const supabase = createClient()
  const [mounted, setMounted] = useState(false)
  const [tab, setTab] = useState<'sign-in' | 'sign-up'>(
    searchParams?.get('tab') === 'sign-up' ? 'sign-up' : 'sign-in'
  )
  const [origin, setOrigin] = useState<string>('')
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    setMounted(true)
    setOrigin(window.location.origin)
    
    // Check if user is already authenticated
    const checkAuth = async () => {
      try {
        const { data } = await supabase.auth.getSession()
        if (data.session) {
          setIsAuthenticated(true)
          router.push('/profile')
        }
      } catch (error) {
        console.error('Error checking auth session:', error)
      } finally {
        setIsLoading(false)
      }
    }
    
    if (mounted) {
      checkAuth()
    }

    return () => {
      setMounted(false)
    }
  }, [router, mounted])

  if (isLoading) {
    return (
      <div className="container max-w-lg mx-auto px-4 py-16 flex justify-center items-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-12 w-12 bg-primary/20 rounded-full mb-4"></div>
          <div className="h-6 w-48 bg-primary/20 rounded mb-2"></div>
          <div className="h-4 w-32 bg-primary/20 rounded"></div>
        </div>
      </div>
    )
  }

  if (isAuthenticated) {
    return null // Will redirect in useEffect
  }

  return (
    <div className="container max-w-lg mx-auto px-4 py-8 md:py-16">
      <div className="text-center mb-8">
        <div className="flex justify-center gap-4 mb-6">
          <Film className="w-8 h-8 text-primary" />
          <Clapperboard className="w-8 h-8 text-primary" />
          <Star className="w-8 h-8 text-primary" />
        </div>
        <h1 className="text-3xl md:text-4xl font-bold mb-4">
          {t('welcomeTitle')}
        </h1>
        <p className="text-muted-foreground text-lg max-w-md mx-auto">
          {t('welcomeDescription')}
        </p>
      </div>

      <Card className="border-2">
        <CardHeader className="space-y-1">
          <Tabs defaultValue={tab} onValueChange={(value) => setTab(value as 'sign-in' | 'sign-up')}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="sign-in">{t('signIn')}</TabsTrigger>
              <TabsTrigger value="sign-up">{t('createAccount')}</TabsTrigger>
            </TabsList>
          </Tabs>
          <CardDescription className="text-center pt-4">
            {tab === 'sign-in' 
              ? t('signInDescription')
              : t('signUpDescription')
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          {origin && (
            <Auth
              supabaseClient={supabase}
              appearance={{
                theme: ThemeSupa,
                variables: {
                  default: {
                    colors: {
                      brand: 'rgb(var(--color-primary))',
                      brandAccent: 'rgb(var(--color-primary-dark))',
                    },
                  },
                },
                className: {
                  container: 'w-full',
                  button: 'w-full rounded-md px-4 py-2',
                  label: 'text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
                  input: 'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
                  message: 'text-sm text-red-500 mt-2',
                },
              }}
              theme={theme === 'dark' ? 'dark' : 'default'}
              view={tab === 'sign-in' ? 'sign_in' : 'sign_up'}
              providers={['google', 'apple']}
              redirectTo={`${origin}/auth/callback`}
              localization={{
                variables: {
                  sign_in: {
                    email_label: t('email'),
                    password_label: t('password'),
                    button_label: t('signIn'),
                    social_provider_text: t('continueWith'),
                    link_text: t('dontHaveAccount'),
                  },
                  sign_up: {
                    email_label: t('email'),
                    password_label: t('password'),
                    button_label: t('createAccount'),
                    social_provider_text: t('signUpWith'),
                    link_text: t('alreadyHaveAccount'),
                  },
                }
              }}
            />
          )}
        </CardContent>
      </Card>

      <div className="mt-8 text-center text-sm text-muted-foreground">
        <p>{t('termsNotice')}</p>
        <div className="mt-1 space-x-2">
          <a href="/terms" className="hover:underline">{t('termsOfService')}</a>
          <span>{t('and')}</span>
          <a href="/privacy" className="hover:underline">{t('privacyPolicy')}</a>
        </div>
      </div>
    </div>
  )
} 