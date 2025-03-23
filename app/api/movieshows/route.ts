import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

// Initialize Supabase admin client with service role key (bypasses RLS)
const supabaseAdmin = createClient(
	process.env.NEXT_PUBLIC_SUPABASE_URL!,
	process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// External API URL
const SHOWTIMES_API_URL =
	'https://admin.countit.online/api/v2/getview/showtimes_webSite/1000/ISRAEL';
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

		console.log('Starting API request to:', SHOWTIMES_API_URL);
		const response = await fetch(`${SHOWTIMES_API_URL}?key=${API_KEY}`);

		console.log('API Response status:', response.status);

		if (!response.ok) {
			const errorText = await response.text();
			console.error('API Error Response:', errorText);
			throw new Error(
				`API responded with status: ${response.status}, body: ${errorText}`
			);
		}

		const responseJson = await response.json();

		// Validate response format
		if (!responseJson || typeof responseJson !== 'object') {
			console.error('API returned invalid response:', responseJson);
			throw new Error('API returned invalid response format');
		}

		// Extract the data array from the response
		const data = responseJson.data;

		if (!Array.isArray(data)) {
			console.error('API data is not an array:', typeof data);
			throw new Error(`API data is not an array: ${typeof data}`);
		}

		console.log(`Successfully fetched ${data.length} items from API`);

		if (data.length > 0) {
			console.log('First item structure:', Object.keys(data[0]));
			// Validate required fields in first item
			const requiredFields = ['SHOWTIME_PID', 'MOVIE_Name', 'MoviePID'];
			const missingFields = requiredFields.filter(
				(field) => !data[0].hasOwnProperty(field)
			);
			if (missingFields.length > 0) {
				throw new Error(
					`API response missing required fields: ${missingFields.join(', ')}`
				);
			}
		}

		return data;
	} catch (error) {
		console.error('Error in fetchShowtimes:', error);
		throw error;
	}
}

// GET endpoint to fetch movieshows by moviepid
export async function GET(request: NextRequest) {
	try {
		const { searchParams } = new URL(request.url);
		const moviepid = searchParams.get('moviepid');
		const fetchAll = searchParams.get('fetchAll');

		// If moviepid is provided, fetch specific movie shows
		if (moviepid) {
			console.log(`Fetching movieshows for moviepid: ${moviepid}`);
			const { data: movieshows, error } = await supabaseAdmin
				.from('movieshows')
				.select('*')
				.eq('moviepid', moviepid)
				.order('day', { ascending: true })
				.order('time', { ascending: true });

			if (error) {
				console.error('Error fetching movieshows:', error);
				return NextResponse.json(
					{ error: 'Failed to fetch movieshows', details: error.message },
					{ status: 500 }
				);
			}

			return NextResponse.json({
				success: true,
				data: movieshows,
				count: movieshows.length,
			});
		}

		// If fetchAll is not explicitly set to true, return an error
		if (fetchAll !== 'true') {
			return NextResponse.json(
				{ error: 'Missing moviepid parameter' },
				{ status: 400 }
			);
		}

		// If we get here, proceed with the original fetch-and-update functionality
		console.log('Starting movieshows API handler');

		// Step 1: Fetch data from external API
		console.log('Initiating external API call...');
		const showtimesData = await fetchShowtimes();

		if (!showtimesData || !Array.isArray(showtimesData)) {
			const errorMsg =
				'Invalid response from external API: ' +
				(showtimesData
					? `unexpected type: ${typeof showtimesData}`
					: 'no data received');
			console.error(errorMsg);
			return NextResponse.json({ error: errorMsg }, { status: 500 });
		}

		console.log(`Successfully fetched ${showtimesData.length} items from API`);

		// Step 2: Process and save data
		const results = {
			success: 0,
			existing: 0,
			failed: 0,
			errors: [] as string[],
		};

		console.log('Starting to process and save items...');

		for (const showtime of showtimesData) {
			try {
				// Log the current item being processed
				console.log(
					`Processing item: SHOWTIME_PID=${showtime.SHOWTIME_PID}, Movie=${showtime.MOVIE_Name}`
				);

				// Check if showtime already exists
				const { data: existingMovieshow, error: checkError } =
					await supabaseAdmin
						.from('movieshows')
						.select('id')
						.eq('showtime_pid', showtime.SHOWTIME_PID)
						.single();

				if (checkError && checkError.code !== 'PGRST116') {
					console.error(
						`Error checking movieshow ${showtime.SHOWTIME_PID}:`,
						checkError
					);
					results.failed++;
					results.errors.push(
						`Error checking ${showtime.SHOWTIME_PID}: ${checkError.message}`
					);
					continue;
				}

				// If showtime already exists, skip insertion
				if (existingMovieshow) {
					console.log(
						`Movieshow with SHOWTIME_PID=${showtime.SHOWTIME_PID} already exists, skipping`
					);
					results.existing++;
					continue;
				}

				console.log(
					`Inserting new movieshow: SHOWTIME_PID=${showtime.SHOWTIME_PID}`
				);

				// Insert new showtime
				const { error: insertError } = await supabaseAdmin
					.from('movieshows')
					.insert({
						moviepid: showtime.MoviePID,
						showtime_pid: showtime.SHOWTIME_PID,
						movie_name: showtime.MOVIE_Name,
						movie_english: showtime.MOVIE_English,
						banner: showtime.BANNER,
						genres: showtime.GENRES, // Store as text instead of array
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
					console.error(
						`Error inserting movieshow ${showtime.SHOWTIME_PID}:`,
						insertError
					);
					results.failed++;
					results.errors.push(
						`Error inserting ${showtime.SHOWTIME_PID}: ${insertError.message}`
					);
					continue;
				}

				console.log(
					`Successfully inserted movieshow: SHOWTIME_PID=${showtime.SHOWTIME_PID}`
				);
				results.success++;
			} catch (error) {
				console.error('Error processing showtime:', error);
				results.failed++;
				results.errors.push(
					`Error processing showtime: ${
						error instanceof Error ? error.message : 'Unknown error'
					}`
				);
			}
		}

		console.log('Completed processing all items');
		console.log('Results summary:', {
			total: showtimesData.length,
			success: results.success,
			existing: results.existing,
			failed: results.failed,
		});

		if (results.errors.length > 0) {
			console.log('Errors encountered:', results.errors);
		}

		return NextResponse.json({
			success: true,
			message: 'Processed showtimes from external API',
			results,
			total_processed: showtimesData.length,
		});
	} catch (error) {
		console.error('Server error:', error);
		return NextResponse.json(
			{
				error: 'Server error',
				details: error instanceof Error ? error.message : 'Unknown error',
			},
			{ status: 500 }
		);
	}
}
