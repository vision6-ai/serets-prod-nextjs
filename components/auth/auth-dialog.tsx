'use client'

import { useRouter } from 'next/navigation'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Heart, Star } from 'lucide-react'
import { useTranslations } from 'next-intl'

interface AuthDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  trigger?: React.ReactNode
}

export function AuthDialog({ open, onOpenChange, trigger }: AuthDialogProps) {
  const router = useRouter()
  const t = useTranslations('Auth')

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-2xl text-center">{t('joinCommunity')}</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center gap-6 py-6">
          <div className="flex gap-4 text-muted-foreground">
            <Heart className="w-8 h-8" />
            <Star className="w-8 h-8" />
          </div>
          <DialogDescription className="text-center text-lg">
            {t('authDescription')}
          </DialogDescription>
          <div className="flex flex-col gap-3 w-full">
            <Button 
              size="lg" 
              className="w-full"
              onClick={() => {
                router.push('/auth')
                onOpenChange(false)
              }}
            >
              {t('signIn')}
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              className="w-full"
              onClick={() => {
                router.push('/auth?tab=sign-up')
                onOpenChange(false)
              }}
            >
              {t('createAccount')}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
} 