'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import { createClient } from '@/lib/supabase'
import { useTheme } from 'next-themes'
import { useTranslations, useLocale } from 'next-intl'
import { launchConfetti } from '@/lib/confetti'

interface AuthDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  redirectTo?: string
}

export function AuthDialog({ open, onOpenChange, redirectTo }: AuthDialogProps) {
  const supabase = createClient()
  const { theme } = useTheme()
  const [origin, setOrigin] = useState<string>('')
  const t = useTranslations('Auth')
  const locale = useLocale()

  // Set the origin URL for redirect
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setOrigin(window.location.href)
    }
  }, [])

  // Confetti on successful login/signup
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        launchConfetti();
        onOpenChange(false);
      }
    });
    return () => subscription.unsubscribe();
  }, [supabase, onOpenChange]);

  // Prepare the full redirect URL
  const fullRedirectUrl = redirectTo 
    ? (redirectTo.startsWith('http') ? redirectTo : `${origin}`)
    : origin

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <Auth
          supabaseClient={supabase}
          appearance={{ 
            theme: ThemeSupa,
            variables: {
              default: {
                colors: {
                  brand: '#000',
                  brandAccent: '#000',
                  brandButtonText: '#fff',
                  defaultButtonBackground: '#000',
                  defaultButtonBackgroundHover: '#222',
                  defaultButtonBorder: '#000',
                  defaultButtonText: '#fff',
                  dividerBackground: '#e5e7eb',
                  inputBackground: '#fff',
                  inputBorder: '#d1d5db',
                  inputBorderHover: '#000',
                  inputBorderFocus: '#000',
                  inputText: '#000',
                  inputLabelText: '#222',
                  inputPlaceholder: '#9ca3af',
                  messageText: '#e11d48',
                  messageTextDanger: '#e11d48',
                },
              },
              dark: {
                colors: {
                  brand: '#fff',
                  brandAccent: '#fff',
                  brandButtonText: '#000',
                  defaultButtonBackground: '#fff',
                  defaultButtonBackgroundHover: '#e5e5e5',
                  defaultButtonBorder: '#fff',
                  defaultButtonText: '#000',
                  dividerBackground: '#222',
                  inputBackground: '#fff',
                  inputBorder: '#d1d5db',
                  inputBorderHover: '#000',
                  inputBorderFocus: '#000',
                  inputText: '#000',
                  inputLabelText: '#222',
                  inputPlaceholder: '#9ca3af',
                  messageText: '#e11d48',
                  messageTextDanger: '#e11d48',
                },
              },
            },
            className: {
              input: 'bg-white text-black border border-gray-300 rounded-xl px-4 py-3 placeholder-gray-400 focus:border-black focus:ring-0',
              button: 'bg-black text-white rounded-xl px-4 py-3 font-bold hover:opacity-90',
              label: 'text-gray-800',
              anchor: 'text-gray-700 hover:text-black underline',
              container: 'gap-4',
              message: 'text-red-600',
            },
          }}
          theme={theme === 'dark' ? 'dark' : 'default'}
          providers={['google']}
          redirectTo={fullRedirectUrl}
          onlyThirdPartyProviders={false}
          localization={locale === 'he' ? {
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
              forgotten_password: {
                email_label: t('email'),
                button_label: t('signIn'),
                link_text: t('forgotPassword'),
              },
              magic_link: {
                email_input_label: t('email'),
                button_label: t('signIn'),
                link_text: t('dontHaveAccount'),
              },
            }
          } : undefined}
        />
      </DialogContent>
    </Dialog>
  )
}
