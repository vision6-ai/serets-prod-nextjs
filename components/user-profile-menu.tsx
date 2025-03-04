'use client'

import { useState, useEffect } from 'react'
import { User } from '@supabase/supabase-js'
import { Link } from '@/app/i18n'
import { useLocale, useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useToast } from '@/components/ui/use-toast'
import { User as UserIcon, Settings, LogOut } from 'lucide-react'

export function UserProfileMenu() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const locale = useLocale()
  const t = useTranslations('Profile')
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createClient()

  useEffect(() => {
    async function getUser() {
      const { data: { session } } = await supabase.auth.getSession()
      setUser(session?.user || null)
      setLoading(false)
    }

    getUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null)
    })

    return () => subscription.unsubscribe()
  }, [supabase])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    toast({
      title: t('signOut'),
      description: "You have been signed out successfully."
    })
    router.push(`/${locale}`)
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
          Sign In
        </Link>
      </Button>
    )
  }

  // Get user initials for avatar fallback
  const getInitials = () => {
    const email = user.email || ''
    return email.substring(0, 2).toUpperCase()
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
          <DropdownMenuItem asChild>
            <Link href="/profile?tab=wishlist">
              <Settings className="mr-2 h-4 w-4" />
              <span>{t('wishlist')}</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/profile?tab=reviews">
              <Settings className="mr-2 h-4 w-4" />
              <span>{t('reviews')}</span>
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