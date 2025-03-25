import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') as string;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') as string;
const TMDB_API_KEY = Deno.env.get('TMDB_API_KEY') as string;
const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY') || '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';
const TMDB_BASE = 'https://api.themoviedb.org/3';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// ========== Logging Setup ==========
const runId = crypto.randomUUID();
const summary = {
  run_id: runId,
  total_movies: 0,
  total_actors_created: 0,
  total_translations_created: 0,
  total_ai_translations: 0,
  total_links_created: 0,
  errors: [] as string[],
};

// ========== Helper Functions ==========
// Generate a clean slug from name
function generateSlug(name: string): string {
  if (!name) return '';
  
  return name
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // Remove unsupported characters
    .replace(/\s+/g, '-')     // Replace spaces with -
    .replace(/-+/g, '-')      // Replace multiple - with single -
    .trim();
}

// Translate text using OpenAI
async function translateWithOpenAI(text: string, targetLang: string): Promise<string> {
  if (!text || text.trim().length === 0) return '';
  
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: `You are a professional translator. Translate the following English text to ${targetLang}. Preserve all formatting, paragraph breaks, and maintain the same tone. Only return the translated text, nothing else.`
          },
          {
            role: 'user',
            content: text
          }
        ],
        temperature: 0.3
      })
    });

    const data = await response.json();
    
    if (data.error) {
      throw new Error(`OpenAI API Error: ${data.error.message}`);
    }
    
    if (data.choices && data.choices[0] && data.choices[0].message) {
      summary.total_ai_translations++;
      return data.choices[0].message.content.trim();
    } else {
      throw new Error('OpenAI API returned unexpected response format');
    }
  } catch (error) {
    summary.errors.push(`Translation error: ${error.message}`);
    return ''; // Return empty string on error
  }
}

// ========== Logging Function ==========
async function logRun() {
  await supabase.from('enrich_actor_logs').insert([{
    id: runId,
    total_movies: summary.total_movies,
    total_actors_created: summary.total_actors_created,
    total_translations_created: summary.total_translations_created,
    total_ai_translations: summary.total_ai_translations,
    total_links_created: summary.total_links_created,
    error_messages: summary.errors.join(' | '),
    created_at: new Date().toISOString()
  }]);
}

// ========== Fetching Functions ==========
async function fetchMovies() {
  const { data, error } = await supabase.from('movies').select('id, themoviedb_id');
  if (error) throw error;
  return data;
}

async function fetchMovieCredits(tmdbId: number) {
  const res = await fetch(`${TMDB_BASE}/movie/${tmdbId}/credits?api_key=${TMDB_API_KEY}`);
  return res.json();
}

async function fetchActorLang(actorId: number, lang: string) {
  const res = await fetch(`${TMDB_BASE}/person/${actorId}?api_key=${TMDB_API_KEY}&language=${lang}`);
  return res.json();
}

// ========== Upsert Logic ==========
async function upsertActor(actor: any) {
  const { data: existing } = await supabase
    .from('actors')
    .select('id')
    .eq('themoviedb_id', actor.id)
    .maybeSingle();

  if (existing) return existing.id;

  // Generate slug from actor name
  const slug = generateSlug(actor.name);
  
  const newId = crypto.randomUUID();
  const { error } = await supabase.from('actors').insert([{
    id: newId,
    themoviedb_id: actor.id,
    birth_date: actor.birthday,
    birth_place: actor.place_of_birth,
    photo_url: actor.profile_path ? `https://image.tmdb.org/t/p/w500${actor.profile_path}` : null,
    slug: slug,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }]);

  if (!error) summary.total_actors_created++;
  return newId;
}

async function upsertTranslation(actorId: string, actorData: any, lang: string, otherLangData?: any) {
  const { data: existing } = await supabase
    .from('actor_translations')
    .select('id')
    .eq('actor_id', actorId)
    .eq('language_code', lang)
    .maybeSingle();

  if (existing) return;

  let biography = actorData.biography || '';
  
  // For Hebrew translations, check if biography is empty and translate from English if needed
  if (lang === 'he' && (!biography || biography.trim().length === 0) && otherLangData && otherLangData.biography) {
    const translatedBio = await translateWithOpenAI(otherLangData.biography, 'Hebrew');
    biography = translatedBio;
  }

  await supabase.from('actor_translations').insert([{
    id: crypto.randomUUID(),
    actor_id: actorId,
    language_code: lang,
    name: actorData.name,
    biography: biography,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }]);

  summary.total_translations_created++;
}

async function linkActorToMovie(movieId: string, actorId: string, role: string, order: number) {
  const { data: existing } = await supabase
    .from('movie_actors')
    .select('movie_id')
    .eq('movie_id', movieId)
    .eq('actor_id', actorId)
    .maybeSingle();

  if (existing) return;

  await supabase.from('movie_actors').insert([{
    movie_id: movieId,
    actor_id: actorId,
    role,
    order
  }]);

  summary.total_links_created++;
}

// ========== Main Handler ==========
Deno.serve(async () => {
  try {
    const movies = await fetchMovies();
    summary.total_movies = movies.length;

    for (const movie of movies) {
      const credits = await fetchMovieCredits(movie.themoviedb_id);
      const cast = credits.cast?.slice(0, 10) || [];

      for (const actor of cast) {
        try {
          const [actorEn, actorHe] = await Promise.all([
            fetchActorLang(actor.id, 'en-US'),
            fetchActorLang(actor.id, 'he-IL')
          ]);

          const actorId = await upsertActor(actorEn);

          // Pass the English data as a reference for Hebrew translations if needed
          await Promise.all([
            upsertTranslation(actorId, actorEn, 'en'),
            upsertTranslation(actorId, actorHe, 'he', actorEn)
          ]);

          await linkActorToMovie(movie.id, actorId, actor.character, actor.order);
        } catch (err) {
          summary.errors.push(`Actor ${actor.id}: ${err.message}`);
        }
      }
    }

    await logRun();

    return new Response(JSON.stringify({ 
      success: true, 
      summary: {
        ...summary,
        errors: summary.errors.length > 0 ? `${summary.errors.length} errors occurred` : "No errors"
      } 
    }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    summary.errors.push(`Global: ${err.message}`);
    await logRun();
    return new Response(JSON.stringify({ success: false, error: err.message }), {
      status: 500,
    });
  }
}); 