export interface Genre {
  id: number
  name: string
  hebrew_name: string | null
  slug: string // Will be generated from id
  created_at: string
  updated_at: string
}
