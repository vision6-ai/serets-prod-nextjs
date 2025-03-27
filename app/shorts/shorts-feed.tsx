'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronUp, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import VideoPlayer from './video-player';
import { cn } from '@/lib/utils';

interface Movie {
	id: string;
	title: string;
	hebrew_title: string | null;
	poster_url: string | null;
	slug: string;
}

interface Video {
	id: string;
	title: string;
	cloudflare_id: string;
	language: string | null;
	movies: Movie;
}

interface ShortsFeedProps {
	videos: Video[];
	initialVideoId?: string;
}

export default function ShortsFeed({
	videos,
	initialVideoId,
}: ShortsFeedProps) {
	const [activeIndex, setActiveIndex] = useState(0);
	const [touchStart, setTouchStart] = useState<number | null>(null);
	const [touchEnd, setTouchEnd] = useState<number | null>(null);
	const [isScrolling, setIsScrolling] = useState(false);
	const [touchDirection, setTouchDirection] = useState<'up' | 'down' | null>(
		null
	);
	const router = useRouter();
	const touchStartTime = useRef<number>(0);
	const lastTouchPosition = useRef<number | null>(null);
	const performanceMetrics = useRef({
		lastFrameTime: 0,
		frameCount: 0,
		fps: 0,
	});

	// Debug logging for component state
	useEffect(() => {
		console.log('ShortsFeed State:', {
			activeIndex,
			totalVideos: videos.length,
			currentVideo: videos[activeIndex]?.cloudflare_id,
			isScrolling,
			touchDirection,
		});
	}, [activeIndex, videos, isScrolling, touchDirection]);

	// Set initial video index based on URL
	useEffect(() => {
		if (initialVideoId) {
			const index = videos.findIndex((v) => v.cloudflare_id === initialVideoId);
			if (index >= 0) {
				console.log('Setting initial video:', { initialVideoId, index });
				setActiveIndex(index);
			}
		}
	}, [initialVideoId, videos]);

	// Performance monitoring
	useEffect(() => {
		if (typeof window === 'undefined') return;

		let animationFrameId: number;

		const measurePerformance = () => {
			const now = performance.now();
			const timeDiff = now - performanceMetrics.current.lastFrameTime;

			if (timeDiff >= 1000) {
				// Calculate FPS every second
				performanceMetrics.current.fps = performanceMetrics.current.frameCount;
				performanceMetrics.current.frameCount = 0;
				performanceMetrics.current.lastFrameTime = now;

				if (isScrolling) {
					console.log('Performance Metrics:', {
						fps: performanceMetrics.current.fps,
						isScrolling,
						timestamp: new Date().toISOString(),
					});
				}
			} else {
				performanceMetrics.current.frameCount++;
			}

			animationFrameId = requestAnimationFrame(measurePerformance);
		};

		animationFrameId = requestAnimationFrame(measurePerformance);
		return () => cancelAnimationFrame(animationFrameId);
	}, [isScrolling]);

	const onTouchStart = (e: React.TouchEvent) => {
		const touch = e.targetTouches[0].clientY;
		touchStartTime.current = performance.now();
		lastTouchPosition.current = touch;

		console.log('Touch Start:', {
			position: touch,
			timestamp: touchStartTime.current,
		});

		setTouchEnd(null);
		setTouchStart(touch);
		setIsScrolling(true);
		setTouchDirection(null);
	};

	const onTouchMove = (e: React.TouchEvent) => {
		if (!touchStart) return;

		const currentTouch = e.targetTouches[0].clientY;
		const distance = touchStart - currentTouch;
		const timeDiff = performance.now() - touchStartTime.current;
		const velocity = Math.abs(distance) / timeDiff;

		console.log('Touch Move:', {
			currentPosition: currentTouch,
			distance,
			velocity: velocity.toFixed(2),
			timeSinceStart: timeDiff.toFixed(2),
			direction: distance > 0 ? 'up' : 'down',
		});

		lastTouchPosition.current = currentTouch;

		if (distance > 0) {
			setTouchDirection('up');
		} else if (distance < 0) {
			setTouchDirection('down');
		}

		setTouchEnd(currentTouch);
	};

	const onTouchEnd = () => {
		if (!touchStart || !touchEnd) {
			console.log('Touch End: Invalid touch state', { touchStart, touchEnd });
			return;
		}

		const distance = touchStart - touchEnd;
		const duration = performance.now() - touchStartTime.current;
		const velocity = Math.abs(distance) / duration;

		console.log('Touch End:', {
			totalDistance: distance.toFixed(2),
			duration: duration.toFixed(2),
			velocity: velocity.toFixed(2),
			direction: distance > 0 ? 'up' : 'down',
			currentIndex: activeIndex,
			canMoveUp: activeIndex < videos.length - 1,
			canMoveDown: activeIndex > 0,
		});

		const minSwipeDistance = 50;
		const minVelocity = 0.3;

		const isValidSwipe =
			Math.abs(distance) > minSwipeDistance ||
			(velocity > minVelocity && Math.abs(distance) > 20);

		if (isValidSwipe) {
			if (distance > 0 && activeIndex < videos.length - 1) {
				console.log('Swiping Up to index:', activeIndex + 1);
				setActiveIndex((prev) => prev + 1);
			} else if (distance < 0 && activeIndex > 0) {
				console.log('Swiping Down to index:', activeIndex - 1);
				setActiveIndex((prev) => prev - 1);
			}
		}

		setTouchStart(null);
		setTouchEnd(null);
		setIsScrolling(false);
		setTouchDirection(null);
		lastTouchPosition.current = null;
	};

	// Handle keyboard navigation
	const handleKeyDown = useCallback(
		(e: KeyboardEvent) => {
			console.log('Keyboard Navigation:', {
				key: e.key,
				currentIndex: activeIndex,
				canMoveUp: activeIndex < videos.length - 1,
				canMoveDown: activeIndex > 0,
			});

			if (e.key === 'ArrowUp' && activeIndex > 0) {
				setActiveIndex((prev) => prev - 1);
			} else if (e.key === 'ArrowDown' && activeIndex < videos.length - 1) {
				setActiveIndex((prev) => prev + 1);
			}
		},
		[activeIndex, videos.length]
	);

	useEffect(() => {
		if (typeof window === 'undefined') return;

		window.addEventListener('keydown', handleKeyDown);
		return () => window.removeEventListener('keydown', handleKeyDown);
	}, [handleKeyDown]);

	return (
		<div
			className="fixed inset-0 bg-black touch-none"
			onTouchStart={onTouchStart}
			onTouchMove={onTouchMove}
			onTouchEnd={onTouchEnd}
			data-testid="shorts-feed">
			<div className="relative h-full w-full">
				{videos.map((video, index) => (
					<div
						key={video.id}
						className={cn(
							'fixed inset-0 transition-transform duration-300',
							'will-change-transform',
							isScrolling
								? 'transition-none'
								: 'transition-transform duration-300 ease-out',
							index === activeIndex
								? 'translate-y-0 z-10'
								: index < activeIndex
								? '-translate-y-full z-0'
								: 'translate-y-full z-0'
						)}
						data-testid={`video-container-${video.cloudflare_id}`}>
						<VideoPlayer
							trailer={{
								...video,
								movies: video.movies,
							}}
							isActive={index === activeIndex}
						/>
					</div>
				))}
			</div>

			{/* Navigation Indicators */}
			<div className="fixed right-4 top-20 z-50 flex flex-col items-center gap-2">
				<Button
					variant="ghost"
					size="icon"
					className="text-white/50 hover:text-white"
					onClick={() => {
						console.log('Navigation: Moving Up');
						activeIndex > 0 && setActiveIndex((prev) => prev - 1);
					}}
					disabled={activeIndex === 0}
					data-testid="nav-up">
					<ChevronUp className="h-6 w-6" />
				</Button>
				<span className="text-sm text-white/80">
					{activeIndex + 1} / {videos.length}
				</span>
				<Button
					variant="ghost"
					size="icon"
					className="text-white/50 hover:text-white"
					onClick={() => {
						console.log('Navigation: Moving Down');
						activeIndex < videos.length - 1 &&
							setActiveIndex((prev) => prev + 1);
					}}
					disabled={activeIndex === videos.length - 1}
					data-testid="nav-down">
					<ChevronDown className="h-6 w-6" />
				</Button>
			</div>
		</div>
	);
}
