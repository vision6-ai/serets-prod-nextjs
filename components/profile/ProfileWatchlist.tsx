import React from 'react';
import Link from 'next/link';

interface Movie {
  id: string;
  slug: string;
  title: string;
  year: number;
  posterUrl: string;
}

interface ProfileWatchlistProps {
  movies: Movie[];
}

export const ProfileWatchlist: React.FC<ProfileWatchlistProps> = ({ movies }) => {
  return (
    <section className="mt-10">
      <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">רשימת הצפייה שלי</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {movies.map((movie) => (
          <Link
            key={movie.id}
            href={`/movies/${movie.slug}`}
            className="group block overflow-hidden rounded-lg transition-all hover:scale-105 focus:outline-none focus:ring-2 focus:ring-primary"
            aria-label={movie.title}
          >
            <div className="relative aspect-[2/3] overflow-hidden rounded-lg bg-muted">
              <img
                src={movie.posterUrl}
                alt={movie.title}
                className="object-cover w-full h-full transition-all"
                loading="lazy"
              />
            </div>
            <div className="space-y-1 p-2">
              <h3 className="font-semibold leading-none">{movie.title}</h3>
              <p className="text-sm text-muted-foreground">{movie.year}</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}; 