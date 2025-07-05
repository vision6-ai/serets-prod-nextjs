'use client';

import { Link } from 'app/i18n';
import {
	Carousel,
	CarouselContent,
	CarouselItem,
	CarouselNext,
	CarouselPrevious,
} from '@/components/ui/carousel';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import type { Movie } from '@/types/movie';
import { Locale } from '@/config/i18n';
import { cn } from '@/lib/utils';

interface MovieSliderProps {
	movies: Movie[];
	locale?: Locale; // Use the Locale type from config
	title?: string;
	loading?: boolean;
	viewAllHref?: string;
}

export function MovieSlider({
	movies,
	locale = 'en',
	title,
	loading,
	viewAllHref,
}: MovieSliderProps) {
	const isRtl = locale === 'he';

	return (
		<div className="space-y-4">
			{/* Title and View All link */}
			{title && (
				<div
					className={cn(
						'flex justify-between items-center',
						isRtl && 'flex-row-reverse'
					)}>
					<h2 className="text-2xl font-bold">{title}</h2>
					{viewAllHref && (
						<Button variant="ghost" size="sm" asChild>
							<Link
								href={viewAllHref}
								className={cn(
									'flex items-center',
									isRtl && 'flex-row-reverse'
								)}>
								{isRtl ? (
									<>
										<ChevronLeft className="mr-1 h-4 w-4" />
										View All
									</>
								) : (
									<>
										View All
										<ChevronRight className="ml-1 h-4 w-4" />
									</>
								)}
							</Link>
						</Button>
					)}
				</div>
			)}

			{/* Carousel */}
			<Carousel
				opts={{
					align: 'start',
					loop: true,
					direction: isRtl ? 'rtl' : 'ltr',
					// Start with more slides visible by default to fix the RTL single slide issue
					slidesToScroll: 2,
				}}
				className="w-full overflow-x-hidden"
				dir={isRtl ? 'rtl' : 'ltr'}>
				<CarouselContent
					className={cn(isRtl ? '-mr-2 md:-mr-4' : '-ml-2 md:-ml-4')}>
					{movies.map((movie) => (
						<CarouselItem
							key={movie.id}
							className={cn(
								isRtl ? 'pr-2 md:pr-4' : 'pl-2 md:pl-4',
								'basis-1/2 sm:basis-1/3 md:basis-1/4 lg:basis-1/5'
							)}>
							<Link
								href={`/movies/${movie.slug}`}
								locale={locale}
								className="group block overflow-hidden rounded-lg transition-all hover:scale-105">
								<div className="relative aspect-[2/3] overflow-hidden rounded-lg bg-muted">
									{movie.poster_url ? (
										<img
											src={movie.poster_url}
											alt={movie.title}
											className="object-cover w-full h-full transition-all"
											loading="lazy"
										/>
									) : (
										<div className="absolute inset-0 flex items-center justify-center bg-muted">
											<span className="text-muted-foreground">
												{movie.title}
											</span>
										</div>
									)}
								</div>
								<div className={cn('space-y-1 p-2', isRtl && 'text-right')}>
									<h3 className="font-semibold leading-none">{movie.title}</h3>
									{movie.release_date && (
										<p className="text-sm text-muted-foreground">
											{new Date(movie.release_date).getFullYear()}
										</p>
									)}
									{movie.rating && (
										<div
											className={cn(
												'flex items-center gap-1',
												isRtl && 'flex-row-reverse justify-end'
											)}>
											<span className="text-sm font-medium">
												{movie.rating.toFixed(1)}
											</span>
											<svg
												className="h-4 w-4 fill-current text-yellow-400"
												viewBox="0 0 24 24">
												<path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
											</svg>
										</div>
									)}
								</div>
							</Link>
						</CarouselItem>
					))}
				</CarouselContent>
				<CarouselPrevious
					className={cn(isRtl ? '-right-12' : '-left-12', 'md:flex hidden')}
				/>
				<CarouselNext
					className={cn(isRtl ? '-left-12' : '-right-12', 'md:flex hidden')}
				/>
			</Carousel>
		</div>
	);
}
