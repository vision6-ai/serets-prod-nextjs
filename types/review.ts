export interface MovieReview {
  id: string;
  movie_id: string;
  user_id: string;
  rating: number;
  content?: string | null;
  created_at: string;
  updated_at?: string | null;
  profiles?: {
    email: string;
    full_name: string | null;
    avatar_url: string | null;
  };
  user?: {
    id?: string;
    email?: string;
    raw_user_meta_data?: {
      full_name?: string;
      name?: string;
      username?: string;
      avatar_url?: string;
    }
  };
}

export interface MovieReviewFormData {
  rating: number;
  content: string;
} 