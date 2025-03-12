import { createClient } from '@supabase/supabase-js'

export interface Theater {
  id: string
  name: string
  location: string
  bigger_id: string | null
}

export async function getTheaters(): Promise<Theater[]> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const { data, error } = await supabase
    .from('theaters')
    .select('id, name, location, bigger_id')
    .order('name')

  if (error) {
    console.error('Error fetching theaters:', error)
    return []
  }

  return data || []
} 