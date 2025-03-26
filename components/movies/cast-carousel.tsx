'use client'

import { Link } from 'app/i18n'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel'
import { cn } from '@/lib/utils'
import { Locale } from '@/config/i18n'
import { useTranslations } from 'next-intl'
import { Badge } from '@/components/ui/badge'

interface CastCarouselProps {
  cast: {
    id: string;
    name: string;
    hebrew_name: string | null;
    slug: string;
    photo_url: string | null;
    role: string | null;
    order?: number | null;
  }[];
  locale?: Locale;
}

export function CastCarousel({ cast, locale = 'en' }: CastCarouselProps) {
  const isRtl = locale === 'he';
  const t = useTranslations('movies');
  
  // Sort cast by order if available (already sorted on server, this is a backup)
  const sortedCast = [...cast].sort((a, b) => {
    const orderA = a.order ?? 999;
    const orderB = b.order ?? 999;
    return orderA - orderB;
  });
  
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold">{t('cast')}</h2>
      
      {/* Carousel */}
      <Carousel
        opts={{
          align: 'start',
          loop: true,
          direction: isRtl ? 'rtl' : 'ltr',
          slidesToScroll: 1
        }}
        className="w-full overflow-x-hidden"
        dir={isRtl ? 'rtl' : 'ltr'}
      >
        <CarouselContent className={cn(
          isRtl ? "-mr-2 md:-mr-4" : "-ml-2 md:-ml-4"
        )}>
          {sortedCast.map((actor) => {
            const isMainActor = actor.order === 1;
            
            return (
              <CarouselItem
                key={actor.id}
                className={cn(
                  isRtl ? "pr-2 md:pr-4" : "pl-2 md:pl-4",
                  "basis-1/3 sm:basis-1/4 md:basis-1/5 lg:basis-1/6"
                )}
              >
                <Link 
                  href={`/actors/${actor.slug}`}
                  locale={locale}
                  className="group block text-center"
                >
                  <div className="relative">
                    <div className="aspect-square rounded-full overflow-hidden mb-2 transition-all hover:scale-105">
                      <img
                        src={actor.photo_url || '/placeholder-avatar.jpg'}
                        alt={actor.name}
                        className={cn(
                          "w-full h-full object-cover",
                          isMainActor && "ring-2 ring-primary ring-offset-2"
                        )}
                        loading="lazy"
                      />
                    </div>
                    {isMainActor && (
                      <Badge 
                        className="absolute top-0 right-0 z-10"
                        variant="secondary"
                      >
                        ★
                      </Badge>
                    )}
                  </div>
                  <div className={cn("space-y-1", isRtl && "text-right")}>
                    <h3 className="font-medium text-sm">
                      {isRtl && actor.hebrew_name ? actor.hebrew_name : actor.name}
                    </h3>
                    {actor.role && (
                      <p className="text-xs text-muted-foreground">
                        {actor.role}
                      </p>
                    )}
                  </div>
                </Link>
              </CarouselItem>
            );
          })}
        </CarouselContent>
        <CarouselPrevious className={cn(
          isRtl ? "-right-12" : "-left-12",
          "md:flex hidden"
        )} />
        <CarouselNext className={cn(
          isRtl ? "-left-12" : "-right-12", 
          "md:flex hidden"
        )} />
      </Carousel>
    </div>
  )
} 