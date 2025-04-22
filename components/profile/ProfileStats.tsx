import React from 'react';
import { FilmIcon, Star } from 'lucide-react';

interface ProfileStatsProps {
  watchlistCount: number;
  reviewsCount: number;
}

export function ProfileStats({ watchlistCount, reviewsCount }: ProfileStatsProps) {
  return (
    <div className="flex justify-center gap-8 p-4 bg-muted rounded-xl">
      <div className="flex flex-col items-center gap-1">
        <div className="flex items-center gap-2">
          <FilmIcon className="w-4 h-4 text-primary" />
          <span className="text-lg font-bold">{watchlistCount}</span>
        </div>
        <div className="text-sm text-muted-foreground">סרטים ברשימה</div>
      </div>
      
      <div className="flex flex-col items-center gap-1">
        <div className="flex items-center gap-2">
          <Star className="w-4 h-4 text-primary" />
          <span className="text-lg font-bold">{reviewsCount}</span>
        </div>
        <div className="text-sm text-muted-foreground">ביקורות</div>
      </div>
    </div>
  );
} 