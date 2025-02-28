import { redirect } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'

export const revalidate = 3600

export default async function ShortsRedirectPage() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const { data: videos } = await supabase
    .from('videos')
    .select('cloudflare_id')
    .eq('type', 'trailer')
    .eq('cloudflare_status', 'ready')
    .order('created_at', { ascending: false })
    .limit(1)

  if (videos && videos.length > 0) {
    redirect(`/shorts/${videos[0].cloudflare_id}`)
  }

  redirect('/shorts/latest')
}