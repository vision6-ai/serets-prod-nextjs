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

interface AuthDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  trigger?: React.ReactNode
}

export function AuthDialog({ open, onOpenChange, trigger }: AuthDialogProps) {
  const router = useRouter()

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-2xl text-center">Join Our Community!</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center gap-6 py-6">
          <div className="flex gap-4 text-muted-foreground">
            <Heart className="w-8 h-8" />
            <Star className="w-8 h-8" />
          </div>
          <DialogDescription className="text-center text-lg">
            Create your personalized movie experience! Save favorites to your wishlist, 
            share your thoughts with reviews, and join our vibrant community of Israeli 
            cinema enthusiasts.
          </DialogDescription>
          <div className="flex flex-col gap-3 w-full">
            <Button 
              size="lg" 
              className="w-full"
              onClick={() => router.push('/auth')}
            >
              Sign In
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              className="w-full"
              onClick={() => router.push('/auth')}
            >
              Create Account
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}