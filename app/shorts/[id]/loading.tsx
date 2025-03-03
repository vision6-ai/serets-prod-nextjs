import { cn } from '@/lib/utils'

export default function ShortsLoading() {
  return (
    <div className="fixed inset-0 bg-black">
      {/* Video Player Skeleton */}
      <div className="relative w-full h-full">
        {/* Thumbnail Skeleton */}
        <div className="absolute inset-0 bg-muted animate-pulse" />
        
        {/* Controls Overlay */}
        <div className={cn(
          "absolute inset-0 flex flex-col justify-between p-6",
          "bg-gradient-to-b from-black/50 via-transparent to-black/50"
        )}>
          {/* Top Info Skeleton */}
          <div>
            <div className="h-6 w-48 bg-white/20 rounded animate-pulse mb-2" />
            <div className="h-4 w-32 bg-white/20 rounded animate-pulse" />
          </div>

          {/* Progress Bar Skeleton */}
          <div className="absolute bottom-24 left-6 right-6 h-1 bg-white/20 rounded-full" />

          {/* Bottom Controls Skeleton */}
          <div className="flex items-center justify-between mt-8">
            <div className="w-10 h-10 rounded-full bg-white/20 animate-pulse" />
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-white/20 animate-pulse" />
              <div className="w-24 h-10 rounded-md bg-white/20 animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}