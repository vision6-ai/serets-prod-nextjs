// Test data for shorts feature
export const mockTrailers = [
  {
    id: "trailer1",
    title: "Test Trailer 1 - Main Video",
    cloudflare_id: "8d4a9738ce0108e5b6db3d3aefcf56c7", // Your actual Cloudflare video ID
    language: "en",
    cloudflare_status: "ready",
    type: "trailer",
    created_at: new Date().toISOString(),
    movies: [
      {
        id: "movie1",
        title: "Test Movie 1",
        hebrew_title: "סרט בדיקה 1",
        poster_url: null,
        slug: "test-movie-1"
      }
    ]
  },
  {
    id: "trailer2",
    title: "Test Trailer 2 - Second Video",
    cloudflare_id: "8d4a9738ce0108e5b6db3d3aefcf56c7", // Same video ID for testing
    language: "he",
    cloudflare_status: "ready",
    type: "trailer",
    created_at: new Date(Date.now() - 1000 * 60).toISOString(), // 1 minute older
    movies: [
      {
        id: "movie2",
        title: "Test Movie 2",
        hebrew_title: "סרט בדיקה 2",
        poster_url: null,
        slug: "test-movie-2"
      }
    ]
  }
];

// Function to add test data to Supabase
export async function addTestTrailers(supabase: any) {
  try {
    console.log('Starting to add test data to Supabase...');
    
    // First, check database structure
    console.log('Checking database tables...');
    
    // Check movies table structure
    const { data: movieColumns, error: movieColumnsError } = await supabase.rpc(
      'get_column_names', 
      { table_name: 'movies' }
    ).select('*');
    
    if (movieColumnsError) {
      console.log('Could not check movies table structure:', movieColumnsError.message);
    } else {
      console.log('Movies table columns:', movieColumns);
    }
    
    // Check videos table structure
    const { data: videoColumns, error: videoColumnsError } = await supabase.rpc(
      'get_column_names',
      { table_name: 'videos' }
    ).select('*');
    
    if (videoColumnsError) {
      console.log('Could not check videos table structure:', videoColumnsError.message);
    } else {
      console.log('Videos table columns:', videoColumns);
    }
    
    // First, look for the old video ID that might be causing issues
    const oldVideoId = '09df3dd1f83a66cb3089605f111c8bb4';
    const { data: oldVideo } = await supabase
      .from('videos')
      .select('id')
      .eq('cloudflare_id', oldVideoId)
      .single();
    
    if (oldVideo) {
      console.log(`Found old test video with ID ${oldVideoId}, removing it...`);
      await supabase
        .from('videos')
        .delete()
        .eq('cloudflare_id', oldVideoId);
    }
    
    // Add test movies
    for (const trailer of mockTrailers) {
      // Check if movie exists
      const movieId = trailer.movies[0].id;
      const { data: existingMovie } = await supabase
        .from('movies')
        .select('*')
        .eq('id', movieId);
      
      if (!existingMovie || existingMovie.length === 0) {
        console.log(`Adding test movie ${movieId} to database...`);
        
        // Structure to insert depends on actual columns in the database
        const movieData: Record<string, any> = {
          id: trailer.movies[0].id,
          slug: trailer.movies[0].slug
        };
        
        // Add known movie fields if they exist in the database
        try {
          // These might not exist, so we'll try to add them
          if (Array.isArray(movieColumns) && movieColumns.some(col => col.column_name === 'title')) {
            movieData.title = trailer.movies[0].title;
          }
          
          if (Array.isArray(movieColumns) && movieColumns.some(col => col.column_name === 'hebrew_title')) {
            movieData.hebrew_title = trailer.movies[0].hebrew_title;
          }
          
          const { error: insertMovieError } = await supabase
            .from('movies')
            .insert([movieData]);
          
          if (insertMovieError) {
            console.error(`Error adding movie ${movieId}:`, insertMovieError);
          }
        } catch (error) {
          console.error(`Error trying to add movie ${movieId}:`, error);
        }
      } else {
        console.log(`Test movie ${movieId} already exists`);
      }
    }
    
    // Check for existing trailers
    const trailersToAdd = [];
    
    for (const trailer of mockTrailers) {
      const { data: existingTrailer } = await supabase
        .from('videos')
        .select('*')
        .eq('id', trailer.id);
      
      if (!existingTrailer || existingTrailer.length === 0) {
        console.log(`Adding test trailer ${trailer.id} to database...`);
        trailersToAdd.push({
          id: trailer.id,
          title: trailer.title,
          cloudflare_id: trailer.cloudflare_id,
          language: trailer.language,
          cloudflare_status: trailer.cloudflare_status,
          type: trailer.type,
          movie_id: trailer.movies[0].id,
          created_at: trailer.created_at
        });
      } else {
        console.log(`Test trailer ${trailer.id} already exists, updating...`);
        await supabase
          .from('videos')
          .update({
            title: trailer.title,
            cloudflare_status: 'ready',
            movie_id: trailer.movies[0].id
          })
          .eq('id', trailer.id);
      }
    }
    
    // Add any new trailers
    if (trailersToAdd.length > 0) {
      const { data: newTrailers, error } = await supabase
        .from('videos')
        .insert(trailersToAdd)
        .select();
      
      if (error) {
        console.error('Error adding test trailers:', error);
        throw error;
      }
      
      console.log('Test trailers added successfully:', newTrailers);
      return newTrailers;
    } else {
      console.log('No new trailers needed to be added');
      const { data: existingTrailers } = await supabase
        .from('videos')
        .select('*')
        .in('id', mockTrailers.map(t => t.id));
        
      return existingTrailers;
    }
  } catch (error) {
    console.error('Error adding test data:', error);
    throw error;
  }
} 