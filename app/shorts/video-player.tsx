'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Hls from 'hls.js';
import { useInView } from 'react-intersection-observer';
import Link from 'next/link';
import { Volume2, VolumeX, Play, Pause } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface Movie {
	id: string;
	title: string;
	hebrew_title: string | null;
	poster_url: string | null;
	slug: string;
}

interface Trailer {
	id: string;
	title: string;
	cloudflare_id: string;
	language: string | null;
	movies: Movie;
}

interface VideoPlayerProps {
	trailer: Trailer;
	isActive: boolean;
	className?: string;
}

export default function VideoPlayer({
	trailer,
	isActive,
	className,
}: VideoPlayerProps) {
	const [playing, setPlaying] = useState(false);
	const [muted, setMuted] = useState(true);
	const [progress, setProgress] = useState(0);
	const [ready, setReady] = useState(false);
	const [userPaused, setUserPaused] = useState(false);
	const [showControls, setShowControls] = useState(false);
	const videoRef = useRef<HTMLVideoElement>(null);
	const hlsRef = useRef<Hls | null>(null);
	const controlsTimeoutRef = useRef<NodeJS.Timeout>();
	const { ref, inView } = useInView({
		threshold: 0.6,
	});

	// Initialize HLS
	useEffect(() => {
		if (!videoRef.current) return;

		const video = videoRef.current;
		const videoUrl = `https://videodelivery.net/${trailer.cloudflare_id}/manifest/video.m3u8`;

		if (Hls.isSupported()) {
			const hls = new Hls({
				enableWorker: false,
				startLevel: 1,
				debug: false,
				maxBufferLength: 15,
				maxMaxBufferLength: 30,
			});

			hls.loadSource(videoUrl);
			hls.attachMedia(video);
			hlsRef.current = hls;

			hls.on(Hls.Events.MANIFEST_PARSED, () => {
				console.log('Video Ready:', trailer.cloudflare_id);
				setReady(true);
			});

			hls.on(Hls.Events.ERROR, (event, data) => {
				console.error('HLS Error:', {
					videoId: trailer.cloudflare_id,
					event,
					data,
				});
			});
		} else if (video.canPlayType('application/vnd.apple.mpegurl')) {
			// For Safari, which has native HLS support
			video.src = videoUrl;
			video.addEventListener('loadedmetadata', () => {
				console.log('Video Ready:', trailer.cloudflare_id);
				setReady(true);
			});
		}

		return () => {
			if (hlsRef.current) {
				hlsRef.current.destroy();
				hlsRef.current = null;
			}
		};
	}, [trailer.cloudflare_id]);

	// Handle controls visibility
	const handleMouseEnter = () => {
		setShowControls(true);
		if (controlsTimeoutRef.current) {
			clearTimeout(controlsTimeoutRef.current);
		}
	};

	const handleMouseLeave = () => {
		if (playing) {
			controlsTimeoutRef.current = setTimeout(() => {
				setShowControls(false);
			}, 2000);
		} else {
			setShowControls(true);
		}
	};

	// Cleanup timeout on unmount
	useEffect(() => {
		return () => {
			if (controlsTimeoutRef.current) {
				clearTimeout(controlsTimeoutRef.current);
			}
		};
	}, []);

	// Auto-play when in view and active
	useEffect(() => {
		if (!videoRef.current) return;

		console.log('Video Player State:', {
			videoId: trailer.cloudflare_id,
			inView,
			isActive,
			ready,
			playing,
			userPaused,
			timestamp: new Date().toISOString(),
		});

		if (inView && isActive && ready && !userPaused) {
			console.log('Starting video playback:', {
				videoId: trailer.cloudflare_id,
				reason: 'In view, active, and ready',
			});
			videoRef.current.play();
			setPlaying(true);
		}
		if ((!inView || !isActive) && playing) {
			console.log('Stopping video playback:', {
				videoId: trailer.cloudflare_id,
				reason: !inView ? 'Not in view' : 'Not active',
			});
			videoRef.current.pause();
			setPlaying(false);
			setUserPaused(false); // Reset user pause state when video is not active
		}
	}, [inView, isActive, ready, playing, userPaused, trailer.cloudflare_id]);

	const handlePlayPause = () => {
		if (!videoRef.current) return;

		const newPlayingState = !playing;
		if (newPlayingState) {
			videoRef.current.play();
		} else {
			videoRef.current.pause();
		}
		setPlaying(newPlayingState);
		setUserPaused(!newPlayingState);
		setShowControls(true);
		console.log('User clicked play/pause:', {
			videoId: trailer.cloudflare_id,
			newState: newPlayingState ? 'playing' : 'paused',
		});
	};

	const handleTimeUpdate = () => {
		if (!videoRef.current) return;
		const progressPercent =
			(videoRef.current.currentTime / videoRef.current.duration) * 100;
		setProgress(progressPercent);
		if (progressPercent % 25 === 0) {
			// Log every 25%
			console.log('Video Progress:', {
				videoId: trailer.cloudflare_id,
				progress: progressPercent.toFixed(1) + '%',
				loaded:
					(videoRef.current.buffered.length > 0
						? (videoRef.current.buffered.end(
								videoRef.current.buffered.length - 1
						  ) /
								videoRef.current.duration) *
						  100
						: 0
					).toFixed(1) + '%',
			});
		}
	};

	const handleEnded = () => {
		console.log('Video Ended:', trailer.cloudflare_id);
		setPlaying(false);
		setUserPaused(true);
		if (videoRef.current) {
			videoRef.current.currentTime = 0;
		}
	};

	return (
		<div
			ref={ref}
			className={cn(
				'relative h-screen w-full bg-black overflow-hidden cursor-pointer',
				className
			)}
			data-testid={`video-player-${trailer.cloudflare_id}`}
			onMouseEnter={handleMouseEnter}
			onMouseLeave={handleMouseLeave}
			onClick={handlePlayPause}>
			<video
				ref={videoRef}
				className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full h-full object-cover"
				playsInline
				muted={muted}
				poster={`https://videodelivery.net/${trailer.cloudflare_id}/thumbnails/thumbnail.jpg`}
				onTimeUpdate={handleTimeUpdate}
				onEnded={handleEnded}
				onError={(e) => {
					console.error('Video Error:', {
						videoId: trailer.cloudflare_id,
						error: e,
					});
				}}
			/>

			{/* Center Play/Pause Button */}
			<div
				className={cn(
					'absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2',
					'w-16 h-16 rounded-full bg-black/50 flex items-center justify-center',
					'opacity-0 transition-opacity duration-200',
					showControls && 'opacity-100',
					!playing && 'opacity-100'
				)}>
				{!playing ? (
					<Play className="h-8 w-8 text-white" />
				) : (
					<Pause className="h-8 w-8 text-white" />
				)}
			</div>

			{/* Controls Overlay */}
			<div
				className={cn(
					'absolute inset-0 flex flex-col',
					'bg-gradient-to-b from-black/50 via-transparent to-black/50',
					'opacity-0 transition-opacity duration-200',
					showControls && 'opacity-100'
				)}>
				{/* Top Controls */}
				<div className="flex items-center justify-between p-4">
					<div className="flex items-center gap-2">
						<Button
							variant="ghost"
							size="icon"
							className="text-white hover:bg-white/20"
							onClick={(e) => {
								e.stopPropagation();
								handlePlayPause();
							}}>
							{!playing ? (
								<Play className="h-6 w-6" />
							) : (
								<Pause className="h-6 w-6" />
							)}
						</Button>

						<Button
							variant="ghost"
							size="icon"
							className="text-white hover:bg-white/20"
							onClick={(e) => {
								e.stopPropagation();
								setMuted(!muted);
							}}>
							{muted ? (
								<VolumeX className="h-6 w-6" />
							) : (
								<Volume2 className="h-6 w-6" />
							)}
						</Button>
					</div>
				</div>

				{/* Movie Info */}
				<div className="px-4 mt-2">
					<h2 className="text-white font-semibold text-lg">
						{trailer.movies.title || trailer.movies.slug}
					</h2>
					{trailer.movies.hebrew_title &&
						trailer.movies.hebrew_title !== trailer.movies.title && (
							<p className="text-white/80 text-sm">
								{trailer.movies.hebrew_title}
							</p>
						)}
				</div>

				{/* Progress Bar - Moved higher */}
				<div className="absolute bottom-32 left-4 right-4 h-1 bg-white/20 rounded-full overflow-hidden">
					<div
						className="h-full bg-primary transition-all duration-200"
						style={{ width: `${progress}%` }}
					/>
				</div>
			</div>

			{/* Always Visible View Movie Button */}
			<div className="absolute bottom-20 md:bottom-4 right-4 z-50">
				<Button
					variant="default"
					className="bg-primary hover:bg-primary/90 text-white shadow-lg"
					asChild>
					<Link href={`/movies/${trailer.movies.slug}`}>View Movie</Link>
				</Button>
			</div>
		</div>
	);
}
