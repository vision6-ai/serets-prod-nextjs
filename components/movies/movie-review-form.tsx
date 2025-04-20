'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Star, StarHalf } from 'lucide-react';
import { createClient } from '@/lib/supabase';
import { MovieReviewFormData } from '@/types/review';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/components/auth/auth-provider';
import { AuthDialog } from '@/components/auth/auth-dialog';
import { useTranslations } from 'next-intl';

interface MovieReviewFormProps {
  movieId: string;
  onReviewSubmitted: () => void;
}

export function MovieReviewForm({ movieId, onReviewSubmitted }: MovieReviewFormProps) {
  const { user } = useAuth();
  const [isAuthDialogOpen, setIsAuthDialogOpen] = useState(false);
  const [rating, setRating] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const supabase = createClient();
  const t = useTranslations('reviews');
  
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<MovieReviewFormData>({
    defaultValues: {
      rating: 0,
      content: '',
    },
  });

  const onSubmit = async (data: MovieReviewFormData) => {
    if (!user) {
      setIsAuthDialogOpen(true);
      return;
    }

    if (rating === 0) {
      toast({
        title: t('ratingRequired'),
        description: t('pleaseSelectRating'),
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsSubmitting(true);

      // Check if user already submitted a review for this movie
      const { data: existingReview, error: checkError } = await supabase
        .from('reviews')
        .select('id')
        .eq('movie_id', movieId)
        .eq('user_id', user.id)
        .maybeSingle();

      if (checkError) throw checkError;

      let result;
      
      if (existingReview) {
        // Update existing review
        result = await supabase
          .from('reviews')
          .update({
            rating,
            content: data.content,
            updated_at: new Date().toISOString(),
          })
          .eq('id', existingReview.id);
      } else {
        // Insert new review
        result = await supabase.from('reviews').insert({
          movie_id: movieId,
          user_id: user.id,
          rating,
          content: data.content,
        });
      }

      if (result.error) throw result.error;

      toast({
        title: existingReview ? t('reviewUpdated') : t('reviewSubmitted'),
        description: existingReview ? t('reviewUpdatedMsg') : t('reviewSubmittedMsg'),
      });

      // Reset form
      reset();
      setRating(0);
      
      // Refresh reviews
      onReviewSubmitted();

    } catch (error: any) {
      console.error('Error submitting review:', error);
      toast({
        title: t('errorSubmitting'),
        description: error.message || t('tryAgain'),
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRatingClick = (value: number) => {
    setRating(value);
  };

  if (!user) {
    return (
      <div className="border rounded-lg p-6 bg-card mb-6">
        <h3 className="text-xl font-semibold mb-4">{t('writeReview')}</h3>
        <p className="mb-4 text-muted-foreground">{t('loginToReview')}</p>
        <Button onClick={() => setIsAuthDialogOpen(true)}>
          {t('signIn')}
        </Button>
        <AuthDialog 
          open={isAuthDialogOpen} 
          onOpenChange={setIsAuthDialogOpen} 
          redirectTo={window.location.href}
        />
      </div>
    );
  }

  return (
    <div className="border rounded-lg p-4 md:p-6 bg-card mb-4 md:mb-6">
      <h3 className="text-lg md:text-xl font-semibold mb-3 md:mb-4">{t('writeReview')}</h3>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">
            {t('rating')}
          </label>
          <div className="flex flex-wrap gap-1 md:gap-2">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => handleRatingClick(value)}
                className="p-0.5 md:p-1 focus:outline-none"
              >
                {value <= rating ? (
                  <Star className="h-5 w-5 md:h-6 md:w-6 fill-primary text-primary" />
                ) : (
                  <Star className="h-5 w-5 md:h-6 md:w-6 text-muted-foreground" />
                )}
              </button>
            ))}
          </div>
          {rating > 0 && (
            <p className="text-xs md:text-sm mt-1">
              {rating}/10
            </p>
          )}
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2">
            {t('review')}
          </label>
          <Textarea
            {...register('content')}
            placeholder={t('shareTroughts')}
            className="min-h-[100px] md:min-h-[120px] text-sm md:text-base"
          />
        </div>
        
        <div className="flex justify-between items-center">
          <Button 
            type="submit" 
            disabled={isSubmitting}
            size="sm"
            className="text-sm md:text-base px-3 py-1.5 md:px-4 md:py-2 w-full"
          >
            {isSubmitting ? t('submitting') : t('submitReview')}
          </Button>
        </div>
      </form>
    </div>
  );
} 