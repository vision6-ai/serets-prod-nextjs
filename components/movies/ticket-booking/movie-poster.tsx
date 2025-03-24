import Image from 'next/image';
import { MoviePosterProps } from './types';

export function MoviePoster({ posterUrl, movieTitle }: MoviePosterProps) {
	return (
		<div className="hidden md:block">
			<div className="aspect-[2/3] relative rounded-lg overflow-hidden bg-muted">
				{posterUrl ? (
					<Image
						src={posterUrl}
						alt={movieTitle}
						fill
						className="object-cover"
					/>
				) : (
					<div className="absolute inset-0 flex items-center justify-center p-4 text-center text-muted-foreground">
						<span>{movieTitle}</span>
					</div>
				)}
			</div>
		</div>
	);
}
