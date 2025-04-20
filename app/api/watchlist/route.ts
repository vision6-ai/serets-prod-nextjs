import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

// POST: Add to watchlist
// DELETE: Remove from watchlist
// GET: Check if in watchlist

export async function POST(req: NextRequest) {
  const supabase = createRouteHandlerClient({ cookies });
  const { movieId } = await req.json();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  if (!movieId) {
    return NextResponse.json({ error: 'Missing movieId' }, { status: 400 });
  }
  // Insert into watchlists
  const { error } = await supabase.from('watchlists').insert({ user_id: user.id, movie_id: movieId });
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ success: true });
}

export async function DELETE(req: NextRequest) {
  const supabase = createRouteHandlerClient({ cookies });
  const { movieId } = await req.json();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  if (!movieId) {
    return NextResponse.json({ error: 'Missing movieId' }, { status: 400 });
  }
  // Remove from watchlists
  const { error } = await supabase.from('watchlists').delete().eq('user_id', user.id).eq('movie_id', movieId);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ success: true });
}

export async function GET(req: NextRequest) {
  const supabase = createRouteHandlerClient({ cookies });
  const { searchParams } = new URL(req.url);
  const movieId = searchParams.get('movieId');
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError || !user) {
    return NextResponse.json({ inWatchlist: false }, { status: 200 });
  }
  if (!movieId) {
    return NextResponse.json({ inWatchlist: false }, { status: 200 });
  }
  // Check if in watchlist
  const { data, error } = await supabase
    .from('watchlists')
    .select('id')
    .eq('user_id', user.id)
    .eq('movie_id', movieId)
    .single();
  if (error && error.code !== 'PGRST116') {
    // PGRST116 = no rows found
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ inWatchlist: !!data });
} 