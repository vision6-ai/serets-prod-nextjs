import {Suspense} from 'react';
import {useTranslations} from 'next-intl';
import {Locale} from '@/config/i18n';
import {Button} from '@/components/ui/button';
import {Link} from '@/app/i18n';
import {MovieSections} from '@/components/movies/movie-sections';
import {FeaturedActors} from '@/components/featured-actors';
import {MovieSkeleton, ActorSkeleton} from '@/components/skeletons';
import {unstable_setRequestLocale} from 'next-intl/server';
import { NowInTheaters } from '@/components/movies/now-in-theaters';

export default function HomePage({params: {locale}}: {params: {locale: Locale}}) {
  unstable_setRequestLocale(locale);
  const t = useTranslations('home');

  return (
    <div className="container mx-auto px-4 py-8 overflow-hidden">
      {/* Now In Theaters Section */}
      <NowInTheaters locale={locale} />

      {/* Featured Movies Section */}
      <Suspense fallback={<MovieSkeleton />}>
        <MovieSections locale={locale} />
      </Suspense>

      {/* Featured Actors Section */}
      <Suspense fallback={<ActorSkeleton />}>
        <FeaturedActors />
      </Suspense>
    </div>
  )
}