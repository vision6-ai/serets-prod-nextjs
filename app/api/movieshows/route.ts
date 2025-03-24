import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logger';

// Initialize Supabase admin client with service role key (bypasses RLS)
const supabaseAdmin = createClient(
	process.env.NEXT_PUBLIC_SUPABASE_URL!,
	process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// External API URL
const SHOWTIMES_API_URL =
	'https://admin.countit.online/api/v2/getview/showtimes_webSite/5000/ISRAEL';
const API_KEY = process.env.SHOWTIMES_API_KEY;

// Function to fetch showtimes from external API
async function fetchShowtimes() {
	try {
		// Validate environment variables
		if (
			!process.env.NEXT_PUBLIC_SUPABASE_URL ||
			!process.env.SUPABASE_SERVICE_ROLE_KEY
		) {
			throw new Error('Missing required environment variables for Supabase');
		}

		logger.info('Fetching showtimes from external API', {
			url: SHOWTIMES_API_URL,
		});

		const response = await fetch(`${SHOWTIMES_API_URL}?key=${API_KEY}`);
		logger.debug('External API response status', { status: response.status });

		if (!response.ok) {
			const errorText = await response.text();
			logger.error('External API error', new Error(errorText), {
				status: response.status,
			});
			throw new Error(
				`API responded with status: ${response.status}, body: ${errorText}`
			);
		}

		const responseJson = await response.json();

		// Validate response format
		if (!responseJson || typeof responseJson !== 'object') {
			logger.error(
				'Invalid API response format',
				new Error('Invalid response format'),
				{ response: responseJson }
			);
			throw new Error('API returned invalid response format');
		}

		// Extract the data array from the response
		const data = responseJson.data;

		if (!Array.isArray(data)) {
			logger.error('Invalid data format', new Error('Data is not an array'), {
				dataType: typeof data,
			});
			throw new Error(`API data is not an array: ${typeof data}`);
		}

		logger.info('Successfully fetched showtimes', {
			itemCount: data.length,
		});

		if (data.length > 0) {
			// Validate required fields in first item
			const requiredFields = ['SHOWTIME_PID', 'MOVIE_Name', 'MoviePID'];
			const missingFields = requiredFields.filter(
				(field) => !data[0].hasOwnProperty(field)
			);
			if (missingFields.length > 0) {
				logger.error(
					'Missing required fields',
					new Error('Missing fields in API response'),
					{ missingFields }
				);
				throw new Error(
					`API response missing required fields: ${missingFields.join(', ')}`
				);
			}
		}

		return data;
	} catch (error) {
		logger.error('Error in fetchShowtimes', error as Error);
		throw error;
	}
}

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
		const fetchAll = searchParams.get('fetchAll');
		const city = searchParams.get('city');
		const isCronJob =
			request.headers.get('authorization') ===
			`Bearer ${process.env.CRON_SECRET}`;

		logger.info('Request parameters parsed', {
			moviepid,
			fetchAll,
			city,
			isCronJob,
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
				.from('movieshows')
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
		if (moviepid && !city && !fetchAll) {
			logger.info('Starting cities fetch for movie', {
				moviepid,
				timestamp: new Date().toISOString(),
			});

			const startTime = performance.now();
			const { data: cities, error } = await supabaseAdmin
				.from('movieshows')
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

		// If it's a cron job request or fetchAll=true, proceed with full sync
		if (isCronJob || fetchAll === 'true') {
			logger.info('Starting full sync operation', {
				trigger: isCronJob ? 'CRON_JOB' : 'FETCH_ALL',
				timestamp: new Date().toISOString(),
			});

			// Step 1: Fetch data from external API
			const startTimeFetch = performance.now();
			const showtimesData = await fetchShowtimes();
			const fetchTime = performance.now() - startTimeFetch;

			logger.info('External API fetch completed', {
				executionTimeMs: fetchTime,
				recordCount: showtimesData?.length || 0,
				timestamp: new Date().toISOString(),
			});

			if (!showtimesData || !Array.isArray(showtimesData)) {
				const apiError = new Error('Invalid API response structure');
				logger.error('Invalid API response structure', apiError, {
					dataType: typeof showtimesData,
					isArray: Array.isArray(showtimesData),
					timestamp: new Date().toISOString(),
				});
				return NextResponse.json(
					{ error: 'Invalid response from external API' },
					{ status: 500 }
				);
			}

			// Step 2: Process and save data
			const results = {
				success: 0,
				existing: 0,
				failed: 0,
				errors: [] as string[],
			};

			logger.info('Beginning batch processing', {
				totalRecords: showtimesData.length,
				timestamp: new Date().toISOString(),
			});

			const startTimeProcess = performance.now();

			for (const showtime of showtimesData) {
				try {
					logger.debug('Processing individual showtime', {
						showtime_pid: showtime.SHOWTIME_PID,
						movie_name: showtime.MOVIE_Name,
						day: showtime.DAY,
						cinema: showtime.CINEMA,
						timestamp: new Date().toISOString(),
					});

					const { data: existingMovieshow, error: checkError } =
						await supabaseAdmin
							.from('movieshows')
							.select('id')
							.eq('showtime_pid', showtime.SHOWTIME_PID)
							.single();

					if (checkError && checkError.code !== 'PGRST116') {
						const existenceError = new Error('Existence check failed');
						logger.error('Existence check failed', existenceError, {
							errorMessage: checkError.message,
							errorCode: checkError.code,
							showtime_pid: showtime.SHOWTIME_PID,
							timestamp: new Date().toISOString(),
						});
						results.failed++;
						results.errors.push(
							`Error checking ${showtime.SHOWTIME_PID}: ${checkError.message}`
						);
						continue;
					}

					if (existingMovieshow) {
						logger.debug('Skipping existing showtime', {
							showtime_pid: showtime.SHOWTIME_PID,
							timestamp: new Date().toISOString(),
						});
						results.existing++;
						continue;
					}

					const { error: insertError } = await supabaseAdmin
						.from('movieshows')
						.insert({
							moviepid: showtime.MoviePID,
							showtime_pid: showtime.SHOWTIME_PID,
							movie_name: showtime.MOVIE_Name,
							movie_english: showtime.MOVIE_English,
							banner: showtime.BANNER,
							genres: showtime.GENRES,
							day: new Date(showtime.DAY).toISOString(),
							time: showtime.TIME,
							cinema: showtime.CINEMA,
							city: showtime.CITY,
							chain: showtime.CHAIN,
							available_seats: showtime.AvailableSEATS,
							deep_link: showtime.DeepLink,
							imdbid: showtime.IMDBID,
						});

					if (insertError) {
						const insertionError = new Error('Insert operation failed');
						logger.error('Insert operation failed', insertionError, {
							errorMessage: insertError.message,
							errorCode: insertError.code,
							errorDetails: insertError.details,
							showtime_pid: showtime.SHOWTIME_PID,
							timestamp: new Date().toISOString(),
						});
						results.failed++;
						results.errors.push(
							`Error inserting ${showtime.SHOWTIME_PID}: ${insertError.message}`
						);
						continue;
					}

					logger.debug('Successfully inserted showtime', {
						showtime_pid: showtime.SHOWTIME_PID,
						movie_name: showtime.MOVIE_Name,
						timestamp: new Date().toISOString(),
					});
					results.success++;
				} catch (error) {
					const processingError = new Error('Showtime processing error');
					logger.error('Showtime processing error', processingError, {
						errorMessage:
							error instanceof Error ? error.message : 'Unknown error',
						showtime_pid: showtime.SHOWTIME_PID,
						errorStack: error instanceof Error ? error.stack : undefined,
						timestamp: new Date().toISOString(),
					});
					results.failed++;
					results.errors.push(
						`Error processing showtime: ${
							error instanceof Error ? error.message : 'Unknown error'
						}`
					);
				}
			}

			const processingTime = performance.now() - startTimeProcess;
			logger.info('Batch processing completed', {
				executionTimeMs: processingTime,
				results,
				averageTimePerRecord: processingTime / showtimesData.length,
				timestamp: new Date().toISOString(),
			});

			return NextResponse.json({
				success: true,
				message: 'Processed showtimes from external API',
				results,
				total_processed: showtimesData.length,
				execution_time_ms: processingTime,
			});
		}

		// If no valid parameters provided and not a cron job
		logger.warning('Invalid request parameters', {
			params: Object.fromEntries(searchParams),
			isCronJob,
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
