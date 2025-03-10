import { PostgrestFilterBuilder } from '@supabase/postgrest-js'
import { cacheManager } from './cache-manager'

// Define appropriate types for Schema, Row, Result, RelationName, and Relationships if needed
type Schema = any;
type Row = any;
type Result = any;
type RelationName = any;
type Relationships = any;

// Cache wrapper for Supabase queries
export async function cacheQuery<T>(
  key: string,
  query: PostgrestFilterBuilder<Schema, Row, Result, RelationName, Relationships>,
  ttl?: number
): Promise<T> {
  return cacheManager.withCache(
    `supabase:${key}`,
    async () => {
      const { data, error } = await query
      if (error) throw error
      return data as T
    },
    { ttl }
  )
}

// Helper to generate cache key from query params
export function generateCacheKey(base: string, params: Record<string, any>): string {
  return `${base}:${JSON.stringify(params)}`
}
