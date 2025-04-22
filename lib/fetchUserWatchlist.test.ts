import { fetchUserWatchlist } from './fetchUserWatchlist';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { jest } from '@jest/globals';

type SelectMock = {
  select: () => SelectMock;
  eq: () => SelectMock;
  in: () => SelectMock;
  selectImpl: (table: string) => Promise<any>;
};

const mockSupabase = (watchlistRows: any, movies: any, watchlistError?: any, moviesError?: any): SupabaseClient => {
  return {
    from: (table: string) => {
      const obj: any = {
        eq: () => obj,
        in: () => obj,
        select: async () => {
          if (table === 'watchlists') {
            return { data: watchlistRows, error: watchlistError };
          }
          if (table === 'movie_translations') {
            return { data: movies, error: moviesError };
          }
          return { data: null, error: null };
        },
      };
      return obj;
    },
  } as any;
};

describe('fetchUserWatchlist', () => {
  it('returns 3 movies for a user with 3 watchlist entries', async () => {
    const userId = 'user-1';
    const locale = 'he';
    const watchlistRows = [
      { movie_id: 'm1' },
      { movie_id: 'm2' },
      { movie_id: 'm3' },
    ];
    const movies = [
      { movie_id: 'm1', slug: 'slug-1', title: 'Title 1', poster_url: 'url1', release_date: '2020-01-01' },
      { movie_id: 'm2', slug: 'slug-2', title: 'Title 2', poster_url: 'url2', release_date: '2021-01-01' },
      { movie_id: 'm3', slug: 'slug-3', title: 'Title 3', poster_url: 'url3', release_date: '2022-01-01' },
    ];
    const supabase = mockSupabase(watchlistRows, movies);
    const result = await fetchUserWatchlist(userId, locale, supabase);
    expect(result).toHaveLength(3);
    expect(result[0]).toMatchObject({ id: 'm1', slug: 'slug-1', title: 'Title 1', posterUrl: 'url1', year: '2020' });
    expect(result[1]).toMatchObject({ id: 'm2', slug: 'slug-2', title: 'Title 2', posterUrl: 'url2', year: '2021' });
    expect(result[2]).toMatchObject({ id: 'm3', slug: 'slug-3', title: 'Title 3', posterUrl: 'url3', year: '2022' });
  });

  it('returns an empty array if user has no watchlist entries', async () => {
    const userId = 'user-2';
    const locale = 'he';
    const supabase = mockSupabase([], []);
    const result = await fetchUserWatchlist(userId, locale, supabase);
    expect(result).toEqual([]);
  });

  it('throws if there is a watchlist fetch error', async () => {
    const userId = 'user-3';
    const locale = 'he';
    const supabase = mockSupabase(null, null, { message: 'Watchlist error' });
    await expect(fetchUserWatchlist(userId, locale, supabase)).rejects.toThrow('Watchlist fetch error: Watchlist error');
  });

  it('throws if there is a movie translations fetch error', async () => {
    const userId = 'user-4';
    const locale = 'he';
    const watchlistRows = [{ movie_id: 'm1' }];
    const supabase = mockSupabase(watchlistRows, null, undefined, { message: 'Movies error' });
    await expect(fetchUserWatchlist(userId, locale, supabase)).rejects.toThrow('Movies fetch error: Movies error');
  });
}); 