import { useState } from 'react'
import Image from 'next/image'
import { cn } from '@/lib/utils'

interface OptimizedImageProps {
  src: string
  alt: string
  width: number
  height: number
  className?: string
  priority?: boolean
  objectFit?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down'
  placeholder?: 'blur' | 'empty'
  blurDataURL?: string
  sizes?: string
  onLoad?: () => void
}

export function OptimizedImage({
  src,
  alt,
  width,
  height,
  className,
  priority = false,
  objectFit = 'cover',
  placeholder = 'empty',
  blurDataURL,
  sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
  onLoad,
  ...props
}: OptimizedImageProps) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [error, setError] = useState(false)

  // Generate placeholder if not provided
  const placeholderUrl = blurDataURL || `data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 ${width} ${height}'%3E%3Crect width='100%25' height='100%25' fill='%23f3f4f6'/%3E%3C/svg%3E`

  // Handle image load
  const handleLoad = () => {
    setIsLoaded(true)
    if (onLoad) onLoad()
  }

  // Handle image error
  const handleError = () => {
    setError(true)
    console.warn(`Failed to load image: ${src}`)
  }

  return (
    <div className="relative overflow-hidden">
      {/* Placeholder/background */}
      <div 
        className={cn(
          "absolute inset-0 bg-muted",
          isLoaded ? "opacity-0" : "opacity-100",
          "transition-opacity duration-500 ease-in-out"
        )}
        style={{
          backgroundImage: placeholder === 'blur' ? `url(${placeholderUrl})` : undefined,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      />
      
      {/* Actual image */}
      {!error ? (
        <Image
          src={src}
          alt={alt}
          width={width}
          height={height}
          className={cn(
            className,
            isLoaded ? "opacity-100" : "opacity-0",
            "transition-opacity duration-500 ease-in-out",
            objectFit === 'cover' && "object-cover",
            objectFit === 'contain' && "object-contain",
            objectFit === 'fill' && "object-fill",
            objectFit === 'none' && "object-none",
            objectFit === 'scale-down' && "object-scale-down"
          )}
          sizes={sizes}
          priority={priority}
          onLoad={handleLoad}
          onError={handleError}
          {...props}
        />
      ) : (
        // Fallback for error state
        <div 
          className="absolute inset-0 flex items-center justify-center bg-muted text-muted-foreground text-sm"
        >
          {alt || 'Image not available'}
        </div>
      )}
    </div>
  )
}

interface MoviePosterProps {
  src: string | null
  alt: string
  className?: string
  priority?: boolean
}

export function MoviePoster({
  src,
  alt,
  className,
  priority = false,
}: MoviePosterProps) {
  if (!src) {
    return (
      <div className={cn(
        "aspect-[2/3] bg-muted rounded-lg flex items-center justify-center p-4 text-center text-muted-foreground",
        className
      )}>
        {alt}
      </div>
    )
  }

  return (
    <OptimizedImage
      src={src}
      alt={alt}
      width={300}
      height={450}
      className={cn("rounded-lg", className)}
      objectFit="cover"
      placeholder="blur"
      blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjQ1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PC9zdmc+"
      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 25vw"
      priority={priority}
    />
  )
}

interface ActorPhotoProps {
  src: string | null
  alt: string
  className?: string
  size?: number
}

export function ActorPhoto({
  src,
  alt,
  className,
  size = 256,
}: ActorPhotoProps) {
  if (!src) {
    return (
      <div className={cn(
        "aspect-square rounded-full bg-muted flex items-center justify-center",
        className
      )}>
        <span className="text-2xl font-semibold text-muted-foreground">
          {alt.charAt(0)}
        </span>
      </div>
    )
  }

  return (
    <OptimizedImage
      src={src}
      alt={alt}
      width={size}
      height={size}
      className={cn("rounded-full", className)}
      objectFit="cover"
      placeholder="blur"
      blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjU2IiBoZWlnaHQ9IjI1NiIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSIxMjgiIGN5PSIxMjgiIHI9IjEyOCIgZmlsbD0iI2YzZjRmNiIvPjwvc3ZnPg=="
      sizes="(max-width: 768px) 100vw, 256px"
    />
  )
}

interface TheaterImageProps {
  src: string | null
  alt: string
  className?: string
  aspectRatio?: string
  priority?: boolean
}

export function TheaterImage({
  src,
  alt,
  className,
  aspectRatio = "16/9",
  priority = false,
}: TheaterImageProps) {
  // Calculate width and height based on aspect ratio
  const [width, height] = aspectRatio.split('/').map(Number)
  const calculatedWidth = 800
  const calculatedHeight = (calculatedWidth / width) * height

  if (!src) {
    return (
      <div 
        className={cn(
          "bg-muted rounded-lg flex items-center justify-center text-muted-foreground",
          className
        )}
        style={{ aspectRatio }}
      >
        {alt}
      </div>
    )
  }

  return (
    <OptimizedImage
      src={src}
      alt={alt}
      width={calculatedWidth}
      height={calculatedHeight}
      className={cn("rounded-lg", className)}
      objectFit="cover"
      placeholder="blur"
      blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjQ1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PC9zdmc+"
      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 800px"
      priority={priority}
    />
  )
}