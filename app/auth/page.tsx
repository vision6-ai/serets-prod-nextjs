'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import { supabase } from '@/lib/supabase'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Film, Clapperboard, Star } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function AuthPage() {
  const router = useRouter()
  const [tab, setTab] = useState<'sign-in' | 'sign-up'>('sign-in')
  const [origin, setOrigin] = useState<string>('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setOrigin(window.location.origin)
  }, [])

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${origin}/auth/callback`
        }
      })
      
      if (error) throw error
    } catch (error) {
      console.error('Error signing in with Google:', error)
    } finally {
      setLoading(false)
    }
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
          Welcome to Israeli Cinema Hub
        </h1>
        <p className="text-muted-foreground text-lg max-w-md mx-auto">
          Join our community of film enthusiasts and discover the best of Israeli cinema
        </p>
      </div>

      <Card className="border-2">
        <CardHeader className="space-y-1">
          <Tabs defaultValue={tab} onValueChange={(value) => setTab(value as 'sign-in' | 'sign-up')}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="sign-in">Sign In</TabsTrigger>
              <TabsTrigger value="sign-up">Create Account</TabsTrigger>
            </TabsList>
          </Tabs>
          <CardDescription className="text-center pt-4">
            {tab === 'sign-in' 
              ? 'Welcome back! Sign in to continue your journey.'
              : 'Create an account to start your cinematic journey.'
            }
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button 
            variant="outline" 
            className="w-full flex items-center justify-center gap-2"
            onClick={handleGoogleSignIn}
            disabled={loading}
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            {loading ? 'Loading...' : 'Continue with Google'}
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Or continue with email
              </span>
            </div>
          </div>

          {origin && (
            <Auth
              supabaseClient={supabase}
              appearance={{
                theme: ThemeSupa,
                variables: {
                  default: {
                    colors: {
                      brand: 'rgb(var(--primary))',
                      brandAccent: 'rgb(var(--primary))',
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
              view={tab === 'sign-in' ? 'sign_in' : 'sign_up'}
              showLinks={false}
              providers={[]}
              redirectTo={`${origin}/auth/callback`}
            />
          )}
        </CardContent>
      </Card>

      <div className="mt-8 text-center text-sm text-muted-foreground">
        <p>By continuing, you agree to our</p>
        <div className="mt-1 space-x-2">
          <a href="/terms" className="hover:underline">Terms of Service</a>
          <span>and</span>
          <a href="/privacy" className="hover:underline">Privacy Policy</a>
        </div>
      </div>
    </div>
  )
}
