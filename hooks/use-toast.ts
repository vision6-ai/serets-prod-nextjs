import { toast } from 'sonner'

type ToastProps = {
  title?: string
  description?: string
  action?: {
    label: string
    onClick: () => void
  }
  variant?: 'default' | 'destructive'
}

export function useToast() {
  return {
    toast: ({ title, description, action, variant }: ToastProps) => {
      toast(title, {
        description,
        action: action ? {
          label: action.label,
          onClick: action.onClick,
        } : undefined,
        className: variant === 'destructive' ? 'bg-destructive text-destructive-foreground' : undefined,
      })
    }
  }
}
