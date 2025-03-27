import { createClient } from '@supabase/supabase-js';
import ShortsFeed from './shorts-feed';

export const revalidate = 3600;

export default async function ShortsPage() {
	console.log('🎬 [Shorts] Starting shorts page');
	const supabase = createClient(
		process.env.NEXT_PUBLIC_SUPABASE_URL!,
		process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
	);

	console.log('🎬 [Shorts] Fetching videos...');
	const { data: videos, error } = await supabase
		.from('videos')
		.select('*')
		.eq('type', 'trailer')
		.eq('cloudflare_status', 'ready')
		.order('created_at', { ascending: false });

	if (error) {
		console.error('🎬 [Shorts] Error fetching videos:', error);
		return (
			<div className="fixed inset-0 flex items-center justify-center bg-black">
				<div className="text-center">
					<h1 className="text-4xl font-bold mb-4">Error Loading Trailers</h1>
					<p className="text-xl text-white/80">Please try again later.</p>
				</div>
			</div>
		);
	}

	console.log('🎬 [Shorts] Found videos:', videos);
	if (!videos || videos.length === 0) {
		return (
			<div className="fixed inset-0 flex items-center justify-center bg-black">
				<div className="text-center">
					<h1 className="text-4xl font-bold mb-4">No Trailers Available</h1>
					<p className="text-xl text-white/80">
						Check back later for new movie trailers.
					</p>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen">
			<ShortsFeed
				videos={videos.map((video) => ({
					...video,
					movies: {
						id: video.movie_id,
						title: video.title,
						hebrew_title: null,
						poster_url: null,
						slug: video.title.toLowerCase().replace(/\s+/g, '-'),
					},
				}))}
			/>
		</div>
	);
}
