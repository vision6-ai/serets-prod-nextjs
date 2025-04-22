import React from 'react';
import Link from 'next/link';
import { Star } from 'lucide-react';

interface Review {
  id: string;
  movieSlug: string;
  movieTitle: string;
  moviePoster: string;
  rating: number;
  review: string;
  date: string;
}

interface ProfileReviewsProps {
  reviews: Review[];
}

export const ProfileReviews: React.FC<ProfileReviewsProps> = ({ reviews }) => {
  return (
    <section className="mt-12">
      <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">הביקורות שלי</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {reviews.map((review) => (
          <Link
            key={review.id}
            href={`/movies/${review.movieSlug}`}
            className="block group rounded-lg overflow-hidden shadow-lg bg-card hover:scale-105 transition-transform focus:outline-none focus:ring-2 focus:ring-primary"
            aria-label={review.movieTitle}
          >
            <div className="relative aspect-[2/3] w-full overflow-hidden bg-muted">
              <img
                src={review.moviePoster}
                alt={review.movieTitle}
                className="object-cover w-full h-full transition-all"
                loading="lazy"
              />
              <div className="absolute top-2 left-2 bg-black/70 text-white px-2 py-1 rounded-full flex items-center gap-1 text-xs">
                <Star className="w-4 h-4 text-yellow-400" />
                {review.rating}
              </div>
            </div>
            <div className="p-3 flex flex-col gap-2">
              <h3 className="font-semibold text-lg truncate">{review.movieTitle}</h3>
              <p className="text-sm text-muted-foreground line-clamp-3">{review.review}</p>
              <span className="text-xs text-gray-400 mt-auto">{review.date}</span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}; 