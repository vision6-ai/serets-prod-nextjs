# Actor Enrichment Edge Function

This Supabase Edge Function enriches actor data for all movies in the database using The Movie Database (TMDB) API.

## Purpose

The function performs the following tasks:
- Fetches all movies from the database
- For each movie, fetches cast information from TMDB
- For each actor (up to 10 per movie):
  - Creates or updates actor records
  - Creates or updates actor translations in English and Hebrew
  - Links actors to movies
- Logs detailed statistics about the enrichment process

## Tables Used

- `movies` - Source of movie IDs and TMDB IDs
- `actors` - Stores actor information
- `actor_translations` - Stores actor names and biographies in multiple languages
- `movie_actors` - Links movies to actors with role information
- `enrich_actor_logs` - Logs statistics and errors from each run

## Environment Variables

The function requires the following environment variables:

```bash
SUPABASE_URL=your-project-url
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
TMDB_API_KEY=your-tmdb-api-key
```

## Running Locally

```bash
supabase functions serve enrich-actors --env-file .env.local
```

## Deploying

```bash
supabase functions deploy enrich-actors --project-ref your-project-ref
```

## Setting Secrets

```bash
supabase secrets set TMDB_API_KEY=your-tmdb-api-key --project-ref your-project-ref
```

## Invoking the Function

```bash
curl -X POST 'https://your-project-ref.supabase.co/functions/v1/enrich-actors' \
  -H 'Authorization: Bearer YOUR_ANON_KEY'
```

## Rate Limiting and Performance

This function makes multiple API calls to TMDB. Be aware of TMDB's rate limits and consider implementing additional throttling if needed when processing large datasets. 