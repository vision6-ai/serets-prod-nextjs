'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useTheme } from 'next-themes'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Film, Clapperboard, Star } from 'lucide-react'

export default function AuthPage() {
  const router = useRouter()
  const { theme } = useTheme()
  const supabase = createClientComponentClient()
  const [tab, setTab] = useState<'sign-in' | 'sign-up'>('sign-in')
  const [origin, setOrigin] = useState<string>('')

  useEffect(() => {
    setOrigin(window.location.origin)
  }, [])

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
              providers={['google']}
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
