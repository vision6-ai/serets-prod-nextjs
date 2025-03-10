'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams, useParams } from 'next/navigation'
import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import { useTheme } from 'next-themes'
import { useTranslations } from 'next-intl'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader } from '@/components/ui/card'
import { Film, Clapperboard, Star } from 'lucide-react'
import { createClient } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'

export function AuthPageClient() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const params = useParams()
  const locale = (params?.locale || 'en') as string
  const { theme } = useTheme()
  const t = useTranslations('Auth')
  const supabase = createClient()
  const [tab, setTab] = useState<'sign-in' | 'sign-up'>(
    searchParams?.get('tab') === 'sign-up' ? 'sign-up' : 'sign-in'
  )
  const [origin, setOrigin] = useState<string>('')
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  
  // New state for sign up form
  const [showSignUpForm, setShowSignUpForm] = useState(false)
  const [signUpEmail, setSignUpEmail] = useState('')
  const [signUpPassword, setSignUpPassword] = useState('')
  const [isSigningUp, setIsSigningUp] = useState(false)
  const [signUpErrorMessage, setSignUpErrorMessage] = useState('')

  useEffect(() => {
    let mounted = true;

    // Only access window on the client side
    if (typeof window !== 'undefined') {
      setOrigin(window.location.origin)
    }
    
    // Check if user is already authenticated
    const checkAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('Auth session error:', error)
          if (mounted) setIsLoading(false)
          return
        }

        if (mounted) {
          if (session) {
            setIsAuthenticated(true)
            router.push(`/${locale}/profile`)
          } else {
            setIsLoading(false)
          }
        }
      } catch (error) {
        console.error('Auth check error:', error)
        if (mounted) setIsLoading(false)
      }
    }
    
    checkAuth()

    return () => {
      mounted = false
    }
  }, [router, locale])

  const handleManualSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setErrorMessage('')
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })
      
      if (error) {
        setErrorMessage(error.message)
        toast.error(error.message)
        return
      }

      if (data?.session) {
        setIsAuthenticated(true)
        toast.success("You have been logged in successfully.")
        
        // Ensure the session is set before redirecting
        const { data: { session } } = await supabase.auth.getSession()
        if (session) {
          router.push(`/${locale}/profile`)
        }
      }
    } catch (error) {
      console.error('Login error:', error)
      setErrorMessage('An unexpected error occurred')
      toast.error("An unexpected error occurred")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSigningUp(true)
    setSignUpErrorMessage('')
    
    try {
      const { data, error } = await supabase.auth.signUp({
        email: signUpEmail,
        password: signUpPassword,
        options: {
          emailRedirectTo: `${origin}/${locale}/auth/callback`
        }
      })
      
      if (error) {
        setSignUpErrorMessage(error.message)
        toast.error(error.message)
      } else {
        toast.success("Please check your email to confirm your account.")
        setTab('sign-in')
        setShowSignUpForm(false)
      }
    } catch (error) {
      console.error('Sign up error:', error)
      setSignUpErrorMessage('An unexpected error occurred')
      toast.error("An unexpected error occurred")
    } finally {
      setIsSigningUp(false)
    }
  }

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
    <div className="container max-w-md mx-auto px-4 py-8 md:py-16">
      <div className="text-center mb-8">
        <div className="flex justify-center gap-4 mb-6">
          <Film className="w-8 h-8 text-primary" />
          <Clapperboard className="w-8 h-8 text-primary" />
          <Star className="w-8 h-8 text-primary" />
        </div>
        <h1 className="text-3xl md:text-4xl font-bold mb-4">
          {tab === 'sign-in' ? t('signIn') : t('createAccount')}
        </h1>
      </div>

      <Card className="border bg-card shadow-sm">
        <CardContent className="pt-6">
          {tab === 'sign-in' ? (
            <form onSubmit={handleManualSignIn} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-base">{t('email')}</Label>
                <Input 
                  id="email" 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email or username" 
                  className="h-12 rounded-full px-4 border-2 focus-visible:ring-0 focus-visible:border-primary"
                  required 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-base">{t('password')}</Label>
                <Input 
                  id="password" 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-12 rounded-full px-4 border-2 focus-visible:ring-0 focus-visible:border-primary"
                  required 
                />
              </div>
              {errorMessage && (
                <div className="text-sm text-red-500 mt-2">{errorMessage}</div>
              )}
              <Button 
                type="submit" 
                className="w-full h-12 rounded-full bg-green-500 hover:bg-green-600 text-white font-semibold text-base" 
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Signing in...' : t('signIn')}
              </Button>
              
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">
                    {t('or')}
                  </span>
                </div>
              </div>
              
              <div className="space-y-3">
                <Button 
                  type="button" 
                  variant="outline" 
                  className="w-full h-12 rounded-full border-2 font-semibold flex items-center justify-center gap-2"
                  onClick={() => supabase.auth.signInWithOAuth({ 
                    provider: 'google',
                    options: { redirectTo: `${origin}/${locale}/auth/callback` }
                  })}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                  <span>{t('continueWithGoogle')}</span>
                </Button>
              </div>
              
              <div className="text-center mt-6">
                <p className="text-sm text-muted-foreground">
                  {t('noAccount')} {' '}
                  <Button 
                    variant="link" 
                    className="p-0 h-auto font-semibold text-primary"
                    onClick={() => setTab('sign-up')}
                  >
                    {t('createOne')}
                  </Button>
                </p>
              </div>
            </form>
          ) : (
            <form onSubmit={handleSignUp} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="signUpEmail" className="text-base">{t('email')}</Label>
                <Input 
                  id="signUpEmail" 
                  type="email" 
                  value={signUpEmail}
                  onChange={(e) => setSignUpEmail(e.target.value)}
                  placeholder="Email" 
                  className="h-12 rounded-full px-4 border-2 focus-visible:ring-0 focus-visible:border-primary"
                  required 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="signUpPassword" className="text-base">{t('password')}</Label>
                <Input 
                  id="signUpPassword" 
                  type="password" 
                  value={signUpPassword}
                  onChange={(e) => setSignUpPassword(e.target.value)}
                  className="h-12 rounded-full px-4 border-2 focus-visible:ring-0 focus-visible:border-primary"
                  required 
                />
              </div>
              {signUpErrorMessage && (
                <div className="text-sm text-red-500 mt-2">{signUpErrorMessage}</div>
              )}
              <Button 
                type="submit" 
                className="w-full h-12 rounded-full bg-green-500 hover:bg-green-600 text-white font-semibold text-base" 
                disabled={isSigningUp}
              >
                {isSigningUp ? t('signingUp') : t('signUp')}
              </Button>
              
              <div className="text-center mt-6">
                <p className="text-sm text-muted-foreground">
                  {t('alreadyHaveAccount')} {' '}
                  <Button 
                    variant="link" 
                    className="p-0 h-auto font-semibold text-primary"
                    onClick={() => setTab('sign-in')}
                  >
                    {t('signIn')}
                  </Button>
                </p>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
