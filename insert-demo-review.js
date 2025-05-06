const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Main function to run the demo
async function main() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
  
  // Get a recent popular movie - we'll use Tron: Ares
  const { data: movie, error: movieError } = await supabase
    .from('movies')
    .select('id, slug, release_date, rating')
    .eq('slug', 'tron-ares')
    .single();
  
  if (movieError) {
    console.error('Error fetching movie:', movieError);
    return;
  }
  
  console.log('Selected movie:', movie.slug, '(ID:', movie.id, ')');
  
  // Get users/profiles to use as the author - fix the query by removing bio
  const { data: profiles, error: profilesError } = await supabase
    .from('profiles')
    .select('id, full_name, avatar_url')
    .limit(5);
  
  if (profilesError) {
    console.error('Error fetching profiles:', profilesError);
    return;
  }
  
  if (!profiles || profiles.length === 0) {
    console.error('No profiles found - need to create a demo profile');
    // For simplicity, let's create a demo user
    const { data: newProfile, error: createError } = await supabase
      .from('profiles')
      .insert({
        full_name: 'Movie Critic',
        avatar_url: 'https://i.pravatar.cc/150?u=moviecritic'
      })
      .select('id, full_name')
      .single();
      
    if (createError) {
      console.error('Error creating profile:', createError);
      return;
    }
    
    console.log('Created demo profile:', newProfile.full_name, '(ID:', newProfile.id, ')');
    
    // Use the new profile
    const profile = newProfile;
    
    // Create a detailed movie review
    await createMovieReview(supabase, movie, profile);
  } else {
    console.log('Using existing profile:', profiles[0].full_name, '(ID:', profiles[0].id, ')');
    
    // Use the first profile
    const profile = profiles[0];
    
    // Create a detailed movie review
    await createMovieReview(supabase, movie, profile);
  }
}

async function createMovieReview(supabase, movie, profile) {
  console.log('Creating review for', movie.slug, 'by', profile.full_name);
  
  // The detailed review content
  const reviewContent = `
TRON: ARES - A Stunning Return to the Digital Frontier

Joaquin Phoenix dazzles as the titular program in Disney's long-awaited return to the TRON universe. Set decades after the events of TRON: Legacy, this visually spectacular film pushes the franchise into bold new territory while honoring what made the originals so beloved.

Director Joachim Rønning creates a mesmerizing digital landscape that feels both familiar and revolutionary. The world of TRON has evolved, becoming more complex and dangerous than ever before. The visual effects team delivers stunning set pieces that immerse viewers in a digital realm that feels tangible and alive.

Phoenix delivers a nuanced performance as Ares, a powerful program with conflicting loyalties caught between the human world and the digital domain. His character's journey from obedient enforcer to revolutionary is both compelling and emotionally resonant. Jared Leto's villainous portrayal of a corrupt tech CEO obsessed with immortality provides the perfect foil for Phoenix's troubled protagonist.

The action sequences are breathtaking, combining sleek light cycle battles with innovative combat that expands the TRON mythology. Each set piece is choreographed with precision, creating moments of genuine suspense and exhilaration that will satisfy both newcomers and longtime fans.

What truly elevates TRON: Ares is how it balances spectacular visuals with thoughtful commentary on artificial intelligence, digital privacy, and the growing divide between technology and humanity. The script tackles these complex themes without sacrificing entertainment value, making for a sci-fi experience that's as thought-provoking as it is thrilling.

Daft Punk's return to compose the score is another triumph, blending their signature electronic sound with orchestral elements that enhance every scene. The music becomes a character itself, pulsing with energy during action sequences and providing emotional depth in quieter moments.

While the plot occasionally becomes convoluted in its attempt to connect to previous films, these minor stumbles don't detract from what is otherwise a spectacular achievement in science fiction filmmaking. TRON: Ares stands as proof that blockbuster entertainment can be both visually stunning and intellectually engaging.

For fans who have waited years for a return to the Grid, TRON: Ares delivers everything they could hope for while opening exciting new possibilities for the future of the franchise. This is premium sci-fi entertainment that demands to be experienced on the biggest screen possible.
  `.trim();
  
  // Insert the review
  const { data: review, error: reviewError } = await supabase
    .from('reviews')
    .insert({
      movie_id: movie.id,
      user_id: profile.id,
      rating: 9, // High rating (out of 10)
      content: reviewContent,
    })
    .select('id')
    .single();
  
  if (reviewError) {
    console.error('Error creating review:', reviewError);
    return;
  }
  
  console.log('Successfully created review with ID:', review.id);
  console.log('You can now view this blog post at: /en/blog/' + movie.slug + '-review-' + profile.full_name.toLowerCase().replace(/\s+/g, '-'));
}

main().catch(console.error);

