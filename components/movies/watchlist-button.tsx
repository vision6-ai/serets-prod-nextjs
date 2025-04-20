"use client";

import { useState } from "react";
import useSWR from "swr";
import { useUser } from "@supabase/auth-helpers-react";
import { AuthDialog } from "@/components/auth/auth-dialog";
import { Button } from "@/components/ui/button";
import { useTranslations } from 'next-intl';

interface WatchlistButtonProps {
  movieId: string;
}

async function fetchWatchlistStatus(movieId: string) {
  const res = await fetch(`/api/watchlist?movieId=${movieId}`);
  if (!res.ok) throw new Error("Failed to fetch watchlist status");
  return res.json();
}

export function WatchlistButton({ movieId }: WatchlistButtonProps) {
  const user = useUser();
  const t = useTranslations();
  const [showAuth, setShowAuth] = useState(false);
  const { data, isLoading, mutate } = useSWR(
    movieId ? ["watchlist", movieId] : null,
    () => fetchWatchlistStatus(movieId)
  );
  const inWatchlist = data?.inWatchlist;
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    if (!user) {
      setShowAuth(true);
      return;
    }
    setLoading(true);
    try {
      if (inWatchlist) {
        // Remove from watchlist
        await fetch("/api/watchlist", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ movieId }),
        });
        mutate({ inWatchlist: false }, false);
      } else {
        // Add to watchlist
        await fetch("/api/watchlist", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ movieId }),
        });
        mutate({ inWatchlist: true }, false);
      }
    } catch (e) {
      // Optionally show error toast
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button
        onClick={handleClick}
        disabled={isLoading || loading}
        className={`w-full flex items-center justify-center gap-2 rounded-lg px-4 py-2 font-medium transition-all
          ${inWatchlist
            ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90 dark:bg-destructive dark:text-destructive-foreground'
            : 'bg-primary text-primary-foreground hover:bg-primary/90 dark:bg-primary dark:text-primary-foreground'}
        `}
        aria-pressed={!!inWatchlist}
      >
        {loading || isLoading ? (
          <span className="animate-spin h-5 w-5 border-2 border-current border-t-transparent rounded-full"></span>
        ) : inWatchlist ? (
          <>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
            {t('watchlist.remove')}
          </>
        ) : (
          <>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
            {t('watchlist.add')}
          </>
        )}
      </Button>
      <AuthDialog open={showAuth} onOpenChange={setShowAuth} />
    </>
  );
} 