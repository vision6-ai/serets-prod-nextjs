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
	'https://admin.countit.online/api/v2/getview/showtimes_webSite/2000/ISRAEL';
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
	try {
		const { searchParams } = new URL(request.url);
		const moviepid = searchParams.get('moviepid');
		const fetchAll = searchParams.get('fetchAll');
		const city = searchParams.get('city');
		const isCronJob =
			request.headers.get('authorization') ===
			`Bearer ${process.env.CRON_SECRET}`;

		logger.info('Received API request', {
			moviepid,
			fetchAll,
			city,
			isCronJob,
			url: request.url,
		});

		// If moviepid is provided and city is provided, fetch specific movie shows for that city
		if (moviepid && city) {
			logger.debug('Fetching movie shows for specific city', {
				moviepid,
				city,
			});

			const { data: movieshows, error } = await supabaseAdmin
				.from('movieshows')
				.select('*')
				.eq('moviepid', moviepid)
				.eq('city', city)
				.order('day', { ascending: true })
				.order('time', { ascending: true });

			if (error) {
				logger.error('Database query error', error, { moviepid, city });
				return NextResponse.json(
					{ error: 'Failed to fetch movieshows', details: error.message },
					{ status: 500 }
				);
			}

			logger.info('Successfully fetched movie shows for city', {
				moviepid,
				city,
				count: movieshows.length,
			});

			return NextResponse.json({
				success: true,
				data: movieshows,
				count: movieshows.length,
			});
		}

		// If only moviepid is provided, fetch available cities for that movie
		if (moviepid && !city && !fetchAll) {
			logger.debug('Fetching available cities for movie', { moviepid });

			const { data: cities, error } = await supabaseAdmin
				.from('movieshows')
				.select('city')
				.eq('moviepid', moviepid)
				.order('city');

			if (error) {
				logger.error('Error fetching cities', error, { moviepid });
				return NextResponse.json(
					{ error: 'Failed to fetch cities', details: error.message },
					{ status: 500 }
				);
			}

			// Process distinct cities
			const distinctCities = [...new Set(cities.map((c) => c.city))];

			logger.info('Successfully fetched cities for movie', {
				moviepid,
				cityCount: distinctCities.length,
			});

			return NextResponse.json({
				success: true,
				data: distinctCities,
			});
		}

		// If it's a cron job request or fetchAll=true, proceed with full sync
		if (isCronJob || fetchAll === 'true') {
			logger.info('Starting full sync with external API');

			// Step 1: Fetch data from external API
			const showtimesData = await fetchShowtimes();

			if (!showtimesData || !Array.isArray(showtimesData)) {
				const errorMsg = 'Invalid response from external API';
				logger.error('Invalid API response', new Error(errorMsg), {
					response: showtimesData,
				});
				return NextResponse.json({ error: errorMsg }, { status: 500 });
			}

			// Step 2: Process and save data
			const results = {
				success: 0,
				existing: 0,
				failed: 0,
				errors: [] as string[],
			};

			logger.info('Processing fetched shows', {
				total: showtimesData.length,
			});

			for (const showtime of showtimesData) {
				try {
					logger.debug('Processing showtime', {
						showtime_pid: showtime.SHOWTIME_PID,
						movie: showtime.MOVIE_Name,
					});

					// Check if showtime already exists
					const { data: existingMovieshow, error: checkError } =
						await supabaseAdmin
							.from('movieshows')
							.select('id')
							.eq('showtime_pid', showtime.SHOWTIME_PID)
							.single();

					if (checkError && checkError.code !== 'PGRST116') {
						logger.error('Error checking existing showtime', checkError, {
							showtime_pid: showtime.SHOWTIME_PID,
						});
						results.failed++;
						results.errors.push(
							`Error checking ${showtime.SHOWTIME_PID}: ${checkError.message}`
						);
						continue;
					}

					// If showtime already exists, skip insertion
					if (existingMovieshow) {
						logger.debug('Showtime already exists', {
							showtime_pid: showtime.SHOWTIME_PID,
						});
						results.existing++;
						continue;
					}

					// Insert new showtime
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
						logger.error('Error inserting showtime', insertError, {
							showtime_pid: showtime.SHOWTIME_PID,
						});
						results.failed++;
						results.errors.push(
							`Error inserting ${showtime.SHOWTIME_PID}: ${insertError.message}`
						);
						continue;
					}

					logger.debug('Successfully inserted showtime', {
						showtime_pid: showtime.SHOWTIME_PID,
					});
					results.success++;
				} catch (error) {
					logger.error('Error processing showtime', error as Error, {
						showtime: showtime,
					});
					results.failed++;
					results.errors.push(
						`Error processing showtime: ${
							error instanceof Error ? error.message : 'Unknown error'
						}`
					);
				}
			}

			logger.info('Completed processing shows', {
				results,
				total: showtimesData.length,
			});

			return NextResponse.json({
				success: true,
				message: 'Processed showtimes from external API',
				results,
				total_processed: showtimesData.length,
			});
		}

		// If no valid parameters provided and not a cron job
		if (!isCronJob) {
			logger.warning('Missing moviepid parameter', {
				params: Object.fromEntries(searchParams),
			});
			return NextResponse.json(
				{ error: 'Missing moviepid parameter' },
				{ status: 400 }
			);
		}
	} catch (error) {
		logger.error('Server error in GET handler', error as Error);
		return NextResponse.json(
			{
				error: 'Server error',
				details: error instanceof Error ? error.message : 'Unknown error',
			},
			{ status: 500 }
		);
	}
}
