'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { redirect, useParams, useRouter } from 'next/navigation'
import { User } from '@supabase/supabase-js'
import { Skeleton } from '@/components/ui/skeleton'

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const params = useParams();
  const locale = params && typeof params.locale === 'string' ? params.locale : 'en';
  const router = useRouter();

  useEffect(() => {
    let isMounted = true;

    const fetchUser = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser()
        if (error) throw error
        
        if (isMounted && user) {
          setUser(user)
          
          // Fetch the username from profiles
          const { data: profile } = await supabase
            .from('profiles')
            .select('username')
            .eq('id', user.id)
            .single();
            
          if (profile?.username) {
            // Redirect to the username-specific profile page
            router.replace(`/${locale}/profile/${profile.username}`);
          } else {
            // Fallback if no username - use a temporary one based on email
            const tempUsername = user.email?.split('@')[0] || 'user';
            router.replace(`/${locale}/profile/${tempUsername}`);
          }
        }
      } catch (error) {
        console.error('Error fetching user:', error)
        if (isMounted) {
          setUser(null)
          setLoading(false)
        }
      }
    }

    fetchUser();

    return () => {
      isMounted = false;
    }
  }, [locale, router]);

  // Show loading state
  if (loading) {
    return (
      <div className="container py-8">
        <div className="flex flex-col items-center gap-6">
          <Skeleton className="h-24 w-24 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-40 mx-auto" />
          </div>
          <div className="space-y-4 w-full max-w-4xl mt-8">
            <Skeleton className="h-12 w-full" />
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="aspect-[2/3] w-full rounded-lg" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Redirect if no user
  if (!user) {
    redirect(`/${locale}/auth`);
    return null;
  }

  // This should never display as we redirect in the useEffect
  return (
    <div className="container py-8 text-center">
      <p>Redirecting to your profile...</p>
    </div>
  );
}
