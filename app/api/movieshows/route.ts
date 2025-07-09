import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logger';

// Initialize Supabase admin client with service role key (bypasses RLS)
const supabaseAdmin = createClient(
	process.env.NEXT_PUBLIC_SUPABASE_URL!,
	process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET endpoint to fetch movieshows by moviepid
export async function GET(request: NextRequest) {
	logger.info('Starting GET request handler', {
		url: request.url,
		headers: Object.fromEntries(request.headers.entries()),
		method: request.method,
		timestamp: new Date().toISOString(),
	});

	try {
		const { searchParams } = new URL(request.url);
		const moviepid = searchParams.get('moviepid');
		const city = searchParams.get('city');

		logger.info('Request parameters parsed', {
			moviepid,
			city,
			allParams: Object.fromEntries(searchParams.entries()),
			timestamp: new Date().toISOString(),
		});

		// If moviepid is provided and city is provided, fetch specific movie shows for that city
		if (moviepid && city) {
			logger.info('Starting city-specific movie shows fetch', {
				moviepid,
				city,
				timestamp: new Date().toISOString(),
			});

			const startTime = performance.now();
			const { data: movieshows, error } = await supabaseAdmin
				.from('showtimes')
				.select('*')
				.eq('moviepid', moviepid)
				.eq('city', city)
				.order('day', { ascending: true })
				.order('time', { ascending: true });

			const queryTime = performance.now() - startTime;
			logger.info('Database query completed', {
				executionTimeMs: queryTime,
				resultCount: movieshows?.length || 0,
				hasError: !!error,
				timestamp: new Date().toISOString(),
			});

			if (error) {
				const dbError = new Error('Database query failed');
				logger.error('Database query failed', dbError, {
					errorMessage: error.message,
					errorCode: error.code,
					errorDetails: error.details,
					errorHint: error.hint,
					moviepid,
					city,
					timestamp: new Date().toISOString(),
				});
				return NextResponse.json(
					{ error: 'Failed to fetch movieshows', details: error.message },
					{ status: 500 }
				);
			}

			logger.info('Successfully returning movie shows', {
				moviepid,
				city,
				count: movieshows.length,
				firstShowDate: movieshows[0]?.day,
				lastShowDate: movieshows[movieshows.length - 1]?.day,
				timestamp: new Date().toISOString(),
			});

			return NextResponse.json({
				success: true,
				data: movieshows,
				count: movieshows.length,
			});
		}

		// If only moviepid is provided, fetch available cities for that movie
		if (moviepid && !city) {
			logger.info('Starting cities fetch for movie', {
				moviepid,
				timestamp: new Date().toISOString(),
			});

			const startTime = performance.now();
			const { data: cities, error } = await supabaseAdmin
				.from('showtimes')
				.select('city')
				.eq('moviepid', moviepid)
				.order('city');

			const queryTime = performance.now() - startTime;
			logger.info('Cities query completed', {
				executionTimeMs: queryTime,
				resultCount: cities?.length || 0,
				hasError: !!error,
				timestamp: new Date().toISOString(),
			});

			if (error) {
				const dbError = new Error('Cities fetch failed');
				logger.error('Cities fetch failed', dbError, {
					errorMessage: error.message,
					errorCode: error.code,
					errorDetails: error.details,
					errorHint: error.hint,
					moviepid,
					timestamp: new Date().toISOString(),
				});
				return NextResponse.json(
					{ error: 'Failed to fetch cities', details: error.message },
					{ status: 500 }
				);
			}

			const distinctCities = [...new Set(cities.map((c) => c.city))];
			logger.info('Processed distinct cities', {
				moviepid,
				totalCities: cities.length,
				distinctCitiesCount: distinctCities.length,
				cities: distinctCities,
				timestamp: new Date().toISOString(),
			});

			return NextResponse.json({
				success: true,
				data: distinctCities,
			});
		}

		// If no valid parameters provided
		logger.warning('Invalid request parameters', {
			params: Object.fromEntries(searchParams),
			timestamp: new Date().toISOString(),
		});
		return NextResponse.json(
			{ error: 'Missing moviepid parameter' },
			{ status: 400 }
		);
	} catch (error) {
		const unhandledError = new Error('Unhandled error in GET handler');
		logger.error('Unhandled error in GET handler', unhandledError, {
			errorMessage: error instanceof Error ? error.message : 'Unknown error',
			errorStack: error instanceof Error ? error.stack : undefined,
			timestamp: new Date().toISOString(),
		});
		return NextResponse.json(
			{
				error: 'Server error',
				details: error instanceof Error ? error.message : 'Unknown error',
			},
			{ status: 500 }
		);
	}
}
