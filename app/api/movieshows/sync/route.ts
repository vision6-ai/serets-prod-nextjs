import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

// Initialize Supabase admin client with service role key (bypasses RLS)
const supabaseAdmin = createClient(
	process.env.NEXT_PUBLIC_SUPABASE_URL!,
	process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// External API URL
const SHOWTIMES_API_URL =
	'https://admin.countit.online/api/v2/getview/showtimes_webSite/5000/ISRAEL';
const API_KEY = process.env.SHOWTIMES_API_KEY;

// This configures the route as a Vercel Background Function
export const runtime = 'edge';
export const preferredRegion = 'fra1'; // Europe (Frankfurt)
export const maxDuration = 300; // 5 minutes

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

		console.log('Fetching showtimes from external API', {
			url: SHOWTIMES_API_URL,
		});

		const response = await fetch(`${SHOWTIMES_API_URL}?key=${API_KEY}`);
		console.log('External API response status', { status: response.status });

		if (!response.ok) {
			const errorText = await response.text();
			console.error('External API error', errorText, {
				status: response.status,
			});
			throw new Error(
				`API responded with status: ${response.status}, body: ${errorText}`
			);
		}

		const responseJson = await response.json();

		// Validate response format
		if (!responseJson || typeof responseJson !== 'object') {
			console.error('Invalid API response format', { response: responseJson });
			throw new Error('API returned invalid response format');
		}

		// Extract the data array from the response
		const data = responseJson.data;

		if (!Array.isArray(data)) {
			console.error('Invalid data format', {
				dataType: typeof data,
			});
			throw new Error(`API data is not an array: ${typeof data}`);
		}

		console.log('Successfully fetched showtimes', {
			itemCount: data.length,
		});

		if (data.length > 0) {
			// Validate required fields in first item
			const requiredFields = ['SHOWTIME_PID', 'MOVIE_Name', 'MoviePID'];
			const missingFields = requiredFields.filter(
				(field) => !data[0].hasOwnProperty(field)
			);
			if (missingFields.length > 0) {
				console.error('Missing required fields', { missingFields });
				throw new Error(
					`API response missing required fields: ${missingFields.join(', ')}`
				);
			}
		}

		return data;
	} catch (error) {
		console.error('Error in fetchShowtimes', error);
		throw error;
	}
}

// Handle both GET and POST methods
export async function GET(request: NextRequest) {
	return handleRequest(request);
}

export async function POST(request: NextRequest) {
	return handleRequest(request);
}

// Common handler for both GET and POST
async function handleRequest(request: NextRequest) {
	console.log('Starting background sync operation', {
		url: request.url,
		method: request.method,
		timestamp: new Date().toISOString(),
	});

	try {
		// Create a trace ID for tracking this specific run
		const traceId = `sync-${Date.now()}-${Math.random()
			.toString(36)
			.substring(2, 9)}`;
		console.log('Generated trace ID for background operation', { traceId });

		// Return immediate response while processing continues in background
		const responseStream = new TransformStream();
		const writer = responseStream.writable.getWriter();
		const encoder = new TextEncoder();

		// Send immediate response
		writer.write(
			encoder.encode(
				JSON.stringify({
					success: true,
					message: 'Background sync started successfully',
					traceId,
					timestamp: new Date().toISOString(),
				})
			)
		);
		writer.close();

		// Continue processing in background
		processSyncInBackground(traceId).catch((error) => {
			console.error('Unhandled error in background processing', error, {
				traceId,
				timestamp: new Date().toISOString(),
			});
		});

		return new Response(responseStream.readable, {
			status: 202,
			headers: {
				'Content-Type': 'application/json',
			},
		});
	} catch (error) {
		console.error('Unhandled error in background sync', error, {
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

// Function to process sync in background
async function processSyncInBackground(traceId: string) {
	console.log('Background processing started', {
		traceId,
		timestamp: new Date().toISOString(),
	});

	try {
		// Step 1: Fetch data from external API
		const startTimeFetch = performance.now();
		console.log('Starting external API fetch', {
			traceId,
			timestamp: new Date().toISOString(),
		});

		const showtimesData = await fetchShowtimes();
		const fetchTime = performance.now() - startTimeFetch;

		console.log('External API fetch completed', {
			executionTimeMs: fetchTime,
			recordCount: showtimesData?.length || 0,
			traceId,
			timestamp: new Date().toISOString(),
		});

		if (!showtimesData || !Array.isArray(showtimesData)) {
			console.error('Invalid API response structure', {
				dataType: typeof showtimesData,
				isArray: Array.isArray(showtimesData),
				traceId,
				timestamp: new Date().toISOString(),
			});
			return;
		}

		// Step 2: Process and save data
		const results = {
			success: 0,
			existing: 0,
			failed: 0,
			errors: [] as string[],
		};

		console.log('Beginning batch processing', {
			totalRecords: showtimesData.length,
			traceId,
			timestamp: new Date().toISOString(),
		});

		const startTimeProcess = performance.now();
		const totalItems = showtimesData.length;
		const progressInterval = Math.max(Math.floor(totalItems / 10), 1); // Log progress after each ~10%

		for (let i = 0; i < showtimesData.length; i++) {
			const showtime = showtimesData[i];
			// Log progress every ~10% of items
			if (i % progressInterval === 0 || i === showtimesData.length - 1) {
				console.log('Sync progress', {
					processed: i + 1,
					total: totalItems,
					percentComplete: Math.round(((i + 1) / totalItems) * 100),
					traceId,
					timestamp: new Date().toISOString(),
				});
			}

			try {
				console.log('Processing individual showtime', {
					showtime_pid: showtime.SHOWTIME_PID,
					movie_name: showtime.MOVIE_Name,
					day: showtime.DAY,
					cinema: showtime.CINEMA,
					index: i,
					traceId,
					timestamp: new Date().toISOString(),
				});

				const { data: existingMovieshow, error: checkError } =
					await supabaseAdmin
						.from('movieshows')
						.select('id')
						.eq('showtime_pid', showtime.SHOWTIME_PID)
						.single();

				if (checkError && checkError.code !== 'PGRST116') {
					console.error('Existence check failed', {
						errorMessage: checkError.message,
						errorCode: checkError.code,
						showtime_pid: showtime.SHOWTIME_PID,
						traceId,
						timestamp: new Date().toISOString(),
					});
					results.failed++;
					results.errors.push(
						`Error checking ${showtime.SHOWTIME_PID}: ${checkError.message}`
					);
					continue;
				}

				if (existingMovieshow) {
					console.log('Skipping existing showtime', {
						showtime_pid: showtime.SHOWTIME_PID,
						traceId,
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
					console.error('Insert operation failed', {
						errorMessage: insertError.message,
						errorCode: insertError.code,
						errorDetails: insertError.details,
						showtime_pid: showtime.SHOWTIME_PID,
						traceId,
						timestamp: new Date().toISOString(),
					});
					results.failed++;
					results.errors.push(
						`Error inserting ${showtime.SHOWTIME_PID}: ${insertError.message}`
					);
					continue;
				}

				console.log('Successfully inserted showtime', {
					showtime_pid: showtime.SHOWTIME_PID,
					movie_name: showtime.MOVIE_Name,
					traceId,
					timestamp: new Date().toISOString(),
				});
				results.success++;
			} catch (error) {
				console.error('Showtime processing error', {
					errorMessage:
						error instanceof Error ? error.message : 'Unknown error',
					showtime_pid: showtime.SHOWTIME_PID,
					errorStack: error instanceof Error ? error.stack : undefined,
					traceId,
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
		console.log('Batch processing completed successfully', {
			executionTimeMs: processingTime,
			results,
			averageTimePerRecord: processingTime / showtimesData.length,
			traceId,
			timestamp: new Date().toISOString(),
		});
	} catch (error) {
		console.error('Error in background processing', error, {
			traceId,
			timestamp: new Date().toISOString(),
		});
	}
}
