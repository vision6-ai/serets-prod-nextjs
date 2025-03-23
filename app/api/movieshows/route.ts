import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

// Initialize Supabase admin client with service role key (bypasses RLS)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// External API URL
const SHOWTIMES_API_URL = 'https://admin.countit.online/api/v2/getview/showtimes_webSite/100/ISRAEL';
const API_KEY = '20a3cb24-04c5-11f0-bec4-42010a13f03d';

// Function to fetch showtimes from external API
async function fetchShowtimes() {
  try {
    console.log(`Fetching data from: ${SHOWTIMES_API_URL}?key=${API_KEY}`);
    const response = await fetch(`${SHOWTIMES_API_URL}?key=${API_KEY}`);
    
    if (!response.ok) {
      throw new Error(`API responded with status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log(`Fetched ${Array.isArray(data) ? data.length : 0} items from API`);
    
    if (Array.isArray(data) && data.length > 0) {
      console.log('Sample item:', JSON.stringify(data[0], null, 2));
    }
    
    return data;
  } catch (error) {
    console.error('Error fetching showtimes:', error);
    throw error;
  }
}

// GET endpoint to fetch from API and save to DB
export async function GET(request: NextRequest) {
  try {
    console.log('Starting movieshows API handler');
    
    // Step 1: Fetch data from external API
    console.log('Fetching from external API...');
    const showtimesData = await fetchShowtimes();
    
    if (!showtimesData || !Array.isArray(showtimesData)) {
      console.error('Invalid response from external API', showtimesData);
      return NextResponse.json(
        { error: 'Invalid response from external API' },
        { status: 500 }
      );
    }
    
    console.log(`Successfully fetched ${showtimesData.length} items from API`);
    
    // Step 2: Process and save data
    const results = {
      success: 0,
      existing: 0,
      failed: 0,
      errors: [] as string[]
    };
    
    console.log('Starting to process and save items...');
    
    for (const showtime of showtimesData) {
      try {
        // Log the current item being processed
        console.log(`Processing item: SHOWTIME_PID=${showtime.SHOWTIME_PID}, Movie=${showtime.MOVIE_Name}`);
        
        // Check if showtime already exists
        const { data: existingMovieshow, error: checkError } = await supabaseAdmin
          .from('movieshows')
          .select('id')
          .eq('showtime_pid', showtime.SHOWTIME_PID)
          .single();

        if (checkError && checkError.code !== 'PGRST116') {
          console.error(`Error checking movieshow ${showtime.SHOWTIME_PID}:`, checkError);
          results.failed++;
          results.errors.push(`Error checking ${showtime.SHOWTIME_PID}: ${checkError.message}`);
          continue;
        }

        // If showtime already exists, skip insertion
        if (existingMovieshow) {
          console.log(`Movieshow with SHOWTIME_PID=${showtime.SHOWTIME_PID} already exists, skipping`);
          results.existing++;
          continue;
        }

        console.log(`Inserting new movieshow: SHOWTIME_PID=${showtime.SHOWTIME_PID}`);
        
        // Parse genres string into array if provided
        const genresArray = showtime.GENRES ? showtime.GENRES.split(', ').map((genre: string) => genre.trim()) : [];
        
        // Insert new showtime
        const { error: insertError } = await supabaseAdmin
          .from('movieshows')
          .insert({
            movie_pid: showtime.MoviePID,
            showtime_pid: showtime.SHOWTIME_PID,
            movie_name: showtime.MOVIE_Name,
            movie_english: showtime.MOVIE_English,
            banner: showtime.BANNER,
            genres: genresArray,
            day: new Date(showtime.DAY).toISOString(),
            time: showtime.TIME,
            cinema: showtime.CINEMA,
            city: showtime.CITY,
            chain: showtime.CHAIN,
            available_seats: showtime.AvailableSEATS,
            deep_link: showtime.DeepLink,
            imdb_id: showtime.IMDBID,
            created_at: new Date().toISOString(),
          });

        if (insertError) {
          console.error(`Error inserting movieshow ${showtime.SHOWTIME_PID}:`, insertError);
          results.failed++;
          results.errors.push(`Error inserting ${showtime.SHOWTIME_PID}: ${insertError.message}`);
          continue;
        }

        console.log(`Successfully inserted movieshow: SHOWTIME_PID=${showtime.SHOWTIME_PID}`);
        results.success++;
      } catch (error) {
        console.error('Error processing showtime:', error);
        results.failed++;
        results.errors.push(`Error processing showtime: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }
    
    console.log('Completed processing all items');
    console.log('Results summary:', {
      total: showtimesData.length,
      success: results.success,
      existing: results.existing,
      failed: results.failed
    });
    
    if (results.errors.length > 0) {
      console.log('Errors encountered:', results.errors);
    }
    
    return NextResponse.json({
      success: true,
      message: 'Processed showtimes from external API',
      results,
      total_processed: showtimesData.length
    });
  } catch (error) {
    console.error('Server error:', error);
    return NextResponse.json(
      { 
        error: 'Server error', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
} 