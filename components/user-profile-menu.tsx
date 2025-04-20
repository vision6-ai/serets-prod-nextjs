'use client'

import { useState, useEffect } from 'react'
import { User } from '@supabase/supabase-js'
import { Link } from '@/app/i18n'
import { useLocale, useTranslations } from 'next-intl'
import type { Locale } from '@/config/i18n'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { Button } from './ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu'
import { useToast } from '@/components/ui/use-toast'
import { User as UserIcon, LogOut } from 'lucide-react'

export function UserProfileMenu() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const locale = useLocale()
  const t = useTranslations('Profile') as (key: string) => string
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createClient()

  useEffect(() => {
    async function getUser() {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        setUser(session?.user || null)
      } catch (error) {
        console.error('Error fetching user session:', error)
      } finally {
        setLoading(false)
      }
    }

    getUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null)
    })

    return () => subscription.unsubscribe()
  }, [supabase])

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut()
      toast({
        title: t('signOut'),
        description: "You have been signed out successfully."
      })
      router.push(`/${locale}`)
    } catch (error) {
      console.error('Error signing out:', error)
      toast({
        title: "Error",
        description: "There was a problem signing out. Please try again.",
        variant: "destructive"
      })
    }
  }

  if (loading) {
    return (
      <Button variant="outline" disabled className="hidden md:inline-flex">
        <span className="h-4 w-4 mr-2 rounded-full animate-pulse bg-primary/20"></span>
        Loading...
      </Button>
    )
  }

  if (!user) {
    return (
      <Button asChild variant="outline" className="hidden md:inline-flex">
        <Link href="/auth">
          <UserIcon className="h-4 w-4 mr-2" />
          {t('signIn')}
        </Link>
      </Button>
    )
  }

  // Get user initials for avatar fallback
  const getInitials = () => {
    if (!user.email) return 'U'
    return user.email.substring(0, 2).toUpperCase()
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="hidden md:inline-flex">
          <Avatar className="h-6 w-6 mr-2">
            <AvatarImage src={user.user_metadata.avatar_url} />
            <AvatarFallback>{getInitials()}</AvatarFallback>
          </Avatar>
          <span className="max-w-[100px] truncate">
            {user.user_metadata.full_name || user.email?.split('@')[0]}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end">
        <DropdownMenuLabel>{t('myProfile')}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            <Link href="/profile">
              <UserIcon className="mr-2 h-4 w-4" />
              <span>{t('profile')}</span>
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleSignOut}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>{t('signOut')}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}