'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams, useParams } from 'next/navigation'
import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import { useTheme } from 'next-themes'
import { useTranslations } from 'next-intl'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardFooter } from '@/components/ui/card'
import { Film, Clapperboard, Star, Mail, Apple, LucideGithub } from 'lucide-react'
import { createClient } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/components/ui/use-toast'

export default function AuthPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const params = useParams()
  const locale = params.locale as string
  const { theme } = useTheme()
  const t = useTranslations('Auth')
  const { toast } = useToast()
  const supabase = createClient()
  const [tab, setTab] = useState<'sign-in' | 'sign-up'>(
    searchParams.get('tab') === 'sign-up' ? 'sign-up' : 'sign-in'
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
    setOrigin(window.location.origin)
    
    // Check if user is already authenticated
    const checkAuth = async () => {
      const { data } = await supabase.auth.getSession()
      if (data.session) {
        setIsAuthenticated(true)
        router.push(`/${locale}/profile`)
      } else {
        setIsLoading(false)
      }
    }
    
    checkAuth()
  }, [router, supabase.auth, locale])

  const handleManualSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setErrorMessage('')
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      
      if (error) {
        setErrorMessage(error.message)
        toast({
          title: "Login failed",
          description: error.message,
          variant: "destructive"
        })
      } else if (data.session) {
        toast({
          title: "Login successful",
          description: "You have been logged in successfully."
        })
        router.push(`/${locale}/profile`)
      }
    } catch (error) {
      console.error('Login error:', error)
      setErrorMessage('An unexpected error occurred')
      toast({
        title: "Login failed",
        description: "An unexpected error occurred",
        variant: "destructive"
      })
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
        toast({
          title: "Sign up failed",
          description: error.message,
          variant: "destructive"
        })
      } else {
        toast({
          title: "Sign up successful",
          description: "Please check your email to confirm your account."
        })
        setTab('sign-in')
        setShowSignUpForm(false)
      }
    } catch (error) {
      console.error('Sign up error:', error)
      setSignUpErrorMessage('An unexpected error occurred')
      toast({
        title: "Sign up failed",
        description: "An unexpected error occurred",
        variant: "destructive"
      })
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
                  <span>Continue with Google</span>
                </Button>
                <Button 
                  type="button" 
                  variant="outline"
                  className="w-full h-12 rounded-full border-2 font-semibold flex items-center justify-center gap-2"
                  onClick={() => supabase.auth.signInWithOAuth({ 
                    provider: 'apple',
                    options: { redirectTo: `${origin}/${locale}/auth/callback` }
                  })}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.05 20.28c-.98.95-2.05.86-3.08.38-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.38C2.79 15.75 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.79 1.18-.23 2.32-.94 3.69-.8 1.56.18 2.7.88 3.44 2.16-3.1 1.85-2.18 5.76.33 7.06-.87 1.78-1.97 3.56-2.54 3.76zm-5.3-15.15c.05-2.13 1.82-3.95 3.96-4.13.31 2.3-2.13 4.78-3.96 4.13z"/>
                  </svg>
                  <span>Continue with Apple</span>
                </Button>
              </div>

              <div className="text-center mt-6">
                <p className="text-sm text-muted-foreground">
                  {t('dontHaveAccount')}
                  <button 
                    type="button" 
                    className="text-primary font-semibold hover:underline ml-1"
                    onClick={() => setTab('sign-up')}
                  >
                    {t('createAccount')}
                  </button>
                </p>
              </div>
            </form>
          ) : (
            <div>
              {!showSignUpForm ? (
                <>
                  <div className="space-y-3 mb-6">
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
                      <span>Sign up with Google</span>
                    </Button>
                    <Button 
                      type="button" 
                      variant="outline"
                      className="w-full h-12 rounded-full border-2 font-semibold flex items-center justify-center gap-2"
                      onClick={() => supabase.auth.signInWithOAuth({ 
                        provider: 'apple',
                        options: { redirectTo: `${origin}/${locale}/auth/callback` }
                      })}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M17.05 20.28c-.98.95-2.05.86-3.08.38-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.38C2.79 15.75 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.79 1.18-.23 2.32-.94 3.69-.8 1.56.18 2.7.88 3.44 2.16-3.1 1.85-2.18 5.76.33 7.06-.87 1.78-1.97 3.56-2.54 3.76zm-5.3-15.15c.05-2.13 1.82-3.95 3.96-4.13.31 2.3-2.13 4.78-3.96 4.13z"/>
                      </svg>
                      <span>Sign up with Apple</span>
                    </Button>
                  </div>

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

                  <div className="mt-6">
                    <Button 
                      type="button" 
                      className="w-full h-12 rounded-full bg-green-500 hover:bg-green-600 text-white font-semibold text-base"
                      onClick={() => setShowSignUpForm(true)}
                    >
                      {t('signUpWithEmail')}
                    </Button>
                  </div>
                </>
              ) : (
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-email" className="text-base">{t('email')}</Label>
                    <Input 
                      id="signup-email" 
                      type="email" 
                      value={signUpEmail}
                      onChange={(e) => setSignUpEmail(e.target.value)}
                      placeholder="Email" 
                      className="h-12 rounded-full px-4 border-2 focus-visible:ring-0 focus-visible:border-primary"
                      required 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password" className="text-base">{t('password')}</Label>
                    <Input 
                      id="signup-password" 
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
                    {isSigningUp ? 'Creating account...' : t('createAccount')}
                  </Button>
                  
                  <Button 
                    type="button" 
                    variant="ghost"
                    className="w-full mt-2 text-sm text-muted-foreground"
                    onClick={() => setShowSignUpForm(false)}
                  >
                    ← Back to sign up options
                  </Button>
                </form>
              )}

              <div className="text-center mt-6">
                <p className="text-sm text-muted-foreground">
                  {t('alreadyHaveAccount')}
                  <button 
                    type="button" 
                    className="text-primary font-semibold hover:underline ml-1"
                    onClick={() => {
                      setTab('sign-in');
                      setShowSignUpForm(false);
                    }}
                  >
                    {t('signIn')}
                  </button>
                </p>
              </div>

              {origin && (
                <div className="hidden">
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
                    view="sign_up"
                    providers={['google', 'apple']}
                    redirectTo={`${origin}/${locale}/auth/callback`}
                    localization={{
                      variables: {
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
                </div>
              )}
            </div>
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