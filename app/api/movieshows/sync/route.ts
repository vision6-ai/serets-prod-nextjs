import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import {
	logError,
	consoleInfo,
	consoleError,
	consoleWarn,
	saveOperationLog,
} from '@/app/utils/logger';

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
export const runtime = 'nodejs';
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

		// Validate API key
		if (!API_KEY) {
			throw new Error('SHOWTIMES_API_KEY environment variable is not set');
		}

		const fullUrl = `${SHOWTIMES_API_URL}?key=${API_KEY}`;

		consoleInfo('Fetching showtimes from external API', {
			url: SHOWTIMES_API_URL,
			apiKeyPresent: !!API_KEY,
			apiKeyLength: API_KEY?.length || 0,
			apiKeyMasked: API_KEY
				? `${API_KEY.substring(0, 8)}...${API_KEY.substring(
						API_KEY.length - 4
				  )}`
				: 'NOT_SET',
			fullUrl: `${SHOWTIMES_API_URL}?key=***MASKED***`,
		});

		const response = await fetch(fullUrl);
		consoleInfo('External API response status', {
			status: response.status,
			statusText: response.statusText,
			headers: Object.fromEntries(response.headers.entries()),
		});

		if (!response.ok) {
			const errorText = await response.text();
			consoleError('External API error', {
				errorText,
				status: response.status,
			});
			throw new Error(
				`API responded with status: ${response.status}, body: ${errorText}`
			);
		}

		const responseJson = await response.json();

		// Validate response format
		if (!responseJson || typeof responseJson !== 'object') {
			consoleError('Invalid API response format', { response: responseJson });
			throw new Error('API returned invalid response format');
		}

		// Extract the data array from the response
		const data = responseJson.data;

		if (!Array.isArray(data)) {
			consoleError('Invalid data format', {
				dataType: typeof data,
			});
			throw new Error(`API data is not an array: ${typeof data}`);
		}

		consoleInfo('Successfully fetched showtimes', {
			itemCount: data.length,
		});

		if (data.length > 0) {
			// Validate required fields in first item
			const requiredFields = ['SHOWTIME_PID', 'MOVIE_Name', 'MoviePID'];
			const missingFields = requiredFields.filter(
				(field) => !data[0].hasOwnProperty(field)
			);
			if (missingFields.length > 0) {
				consoleError('Missing required fields', { missingFields });
				throw new Error(
					`API response missing required fields: ${missingFields.join(', ')}`
				);
			}
		}

		return data;
	} catch (error) {
		consoleError('Error in fetchShowtimes', {
			errorMessage: error instanceof Error ? error.message : 'Unknown error',
			errorStack: error instanceof Error ? error.stack : undefined,
		});
		throw error;
	}
}

// Handle both GET and POST methods
export async function GET(request: NextRequest) {
	try {
		// Generate trace ID for tracking this sync operation
		const traceId = crypto.randomUUID();
		consoleInfo('Starting sync process', { traceId });

		// Process the sync in the background
		processSyncInBackground(traceId);

		return NextResponse.json({
			success: true,
			message: 'Sync process started',
			traceId,
		});
	} catch (error) {
		console.error('Unexpected error:', error);
		return NextResponse.json(
			{ error: 'Internal server error' },
			{ status: 500 }
		);
	}
}

export async function POST(request: NextRequest) {
	return handleRequest(request);
}

// Common handler for both GET and POST
async function handleRequest(request: NextRequest) {
	consoleInfo('Starting background sync operation', {
		url: request.url,
		method: request.method,
		timestamp: new Date().toISOString(),
	});

	try {
		// Create a trace ID for tracking this specific run
		const traceId = `sync-${Date.now()}-${Math.random()
			.toString(36)
			.substring(2, 9)}`;
		consoleInfo('Generated trace ID for background operation', { traceId });

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
			consoleError('Unhandled error in background processing', {
				errorMessage: error instanceof Error ? error.message : 'Unknown error',
				errorStack: error instanceof Error ? error.stack : undefined,
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
		consoleError('Unhandled error in background sync', {
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

// Function to process sync in background
async function processSyncInBackground(traceId: string) {
	consoleInfo('Background processing started', {
		traceId,
		timestamp: new Date().toISOString(),
	});

	try {
		// Variables to track timing
		let totalProcessingTime = 0;

		// Step 1: Fetch data from external API
		const startTimeFetch = performance.now();
		consoleInfo('Starting external API fetch', {
			traceId,
			timestamp: new Date().toISOString(),
		});

		const showtimesData = await fetchShowtimes();
		const fetchTime = performance.now() - startTimeFetch;

		consoleInfo('External API fetch completed', {
			executionTimeMs: fetchTime,
			recordCount: showtimesData?.length || 0,
			traceId,
			timestamp: new Date().toISOString(),
		});

		if (!showtimesData || !Array.isArray(showtimesData)) {
			consoleError('Invalid API response structure', {
				dataType: typeof showtimesData,
				isArray: Array.isArray(showtimesData),
				traceId,
				timestamp: new Date().toISOString(),
			});
			return;
		}

		// Step 2: Fetch all existing records from database
		consoleInfo('Fetching existing records from database', {
			traceId,
			timestamp: new Date().toISOString(),
		});

		// Get both movieshows and movies for proper validation
		const { data: existingMovieshows, error: fetchError } = await supabaseAdmin
			.from('movieshows')
			.select('showtime_pid, moviepid')
			.order('moviepid');

		if (fetchError) {
			consoleError('Error fetching existing records', {
				errorMessage: fetchError.message,
				errorCode: fetchError.code,
				traceId,
				timestamp: new Date().toISOString(),
			});
			throw fetchError;
		}

		// Fetch existing movies to check foreign key constraints
		const { data: existingMovies, error: moviesError } = await supabaseAdmin
			.from('movies')
			.select('countit_pid')
			.order('countit_pid');

		if (moviesError) {
			consoleError('Error fetching movies', {
				errorMessage: moviesError.message,
				errorCode: moviesError.code,
				traceId,
				timestamp: new Date().toISOString(),
			});
			throw moviesError;
		}

		consoleInfo('Fetched records', {
			movieshowsCount: existingMovieshows?.length || 0,
			moviesCount: existingMovies?.length || 0,
			traceId,
			timestamp: new Date().toISOString(),
		});

		// Create maps for quick lookups
		const existingMap = new Map();
		existingMovieshows?.forEach((show) => {
			existingMap.set(show.showtime_pid, show.moviepid);
		});

		consoleInfo('Setup existing map with entries', {
			mapSize: existingMap.size,
			sampleKeys:
				existingMovieshows?.slice(0, 3).map((s) => s.showtime_pid) || [],
		});

		// Create a set of valid movie PIDs
		const validMoviePIDs = new Set();
		existingMovies?.forEach((movie) => {
			validMoviePIDs.add(movie.countit_pid);
		});

		// Step 3: Prepare records for insertion and updating
		const recordsToInsert = [];
		const skippedRecords = [];
		const existingRecords = [];

		// Use a Set to ensure no duplicates by showtime_pid
		const processedShowtimePIDs = new Set();

		// Process and categorize records
		for (const showtime of showtimesData) {
			// CRITICAL CHECK: Skip if showtime_pid already exists in database
			// This is the most important check to prevent duplicates
			if (
				existingMap.has(parseInt(showtime.SHOWTIME_PID)) ||
				existingMap.has(showtime.SHOWTIME_PID)
			) {
				existingRecords.push({
					showtime_pid: showtime.SHOWTIME_PID,
					moviepid: showtime.MoviePID,
					movie_name: showtime.MOVIE_Name || '',
				});
				continue;
			}

			// Secondary check: Skip if we've already processed this showtime_pid in this batch
			if (processedShowtimePIDs.has(showtime.SHOWTIME_PID)) {
				continue;
			}

			// Mark this showtime_pid as processed for this batch
			processedShowtimePIDs.add(showtime.SHOWTIME_PID);

			// Skip records with invalid moviepid (foreign key constraint)
			if (!showtime.MoviePID || !validMoviePIDs.has(showtime.MoviePID)) {
				skippedRecords.push({
					showtime_pid: showtime.SHOWTIME_PID,
					moviepid: showtime.MoviePID,
					movie_name: showtime.MOVIE_Name || '',
					reason: !showtime.MoviePID
						? 'Missing MoviePID'
						: 'MoviePID not found in movies table',
				});
				continue;
			}

			// Ensure genres is not null
			const genres = showtime.GENRES || '';

			// Add to records to insert
			recordsToInsert.push({
				moviepid: showtime.MoviePID,
				showtime_pid: showtime.SHOWTIME_PID,
				movie_name: showtime.MOVIE_Name || '',
				movie_english: showtime.MOVIE_English || '',
				banner: showtime.BANNER || '',
				genres: genres,
				day: new Date(showtime.DAY).toISOString(),
				time: showtime.TIME || '00:00:00',
				cinema: showtime.CINEMA || '',
				city: showtime.CITY || '',
				chain: showtime.CHAIN || '',
				available_seats: showtime.AvailableSEATS || 0,
				deep_link: showtime.DeepLink || '',
				imdbid: showtime.IMDBID || '',
				created_at: new Date().toISOString(),
			});
		}

		// After categorizing records
		consoleInfo('Records categorized', {
			toInsert: recordsToInsert.length,
			existing: existingRecords.length,
			skipped: skippedRecords.length,
			traceId,
		});

		// Enhanced logging for skipped movies
		if (skippedRecords.length > 0) {
			consoleWarn(
				`SKIPPED MOVIES - ${skippedRecords.length} movies could not be processed`,
				{
					traceId,
					timestamp: new Date().toISOString(),
				}
			);

			// Log each skipped movie with detailed reason
			skippedRecords.forEach((movie, index) => {
				consoleWarn(`Skipped Movie ${index + 1}`, {
					moviepid: movie.moviepid,
					movie_name: movie.movie_name,
					showtime_pid: movie.showtime_pid,
					reason: movie.reason,
					traceId,
				});
			});

			// Log summary of skipped movies by reason
			const skippedByReason = skippedRecords.reduce((acc, movie) => {
				acc[movie.reason] = (acc[movie.reason] || 0) + 1;
				return acc;
			}, {} as Record<string, number>);

			consoleWarn('Skipped Movies Summary by Reason', {
				breakdown: skippedByReason,
				totalSkipped: skippedRecords.length,
				traceId,
			});
		}

		// Step 4: Batch insert new records
		const results = {
			success: 0,
			existing: existingRecords.length,
			failed: 0,
			errors: [] as string[],
			successList: [] as {
				moviepid: number;
				movie_name: string;
				showtime_pid: number;
			}[],
			failedList: [] as {
				moviepid: number;
				movie_name: string;
				showtime_pid: number;
				error: string;
			}[],
		};

		if (recordsToInsert.length === 0) {
			consoleInfo('No new records to insert', { traceId });
		} else {
			consoleInfo(`Inserting ${recordsToInsert.length} new records`, {
				traceId,
			});

			const startTimeProcess = performance.now();

			// Insert records in batches of 100
			const BATCH_SIZE = 100;
			for (let i = 0; i < recordsToInsert.length; i += BATCH_SIZE) {
				const batch = recordsToInsert.slice(i, i + BATCH_SIZE);

				if (batch.length === 0) continue;

				// Minimal progress logging
				if (recordsToInsert.length > BATCH_SIZE) {
					consoleInfo(`Processing batch ${Math.floor(i / BATCH_SIZE) + 1}`, {
						progress: `${i + 1}-${Math.min(
							i + batch.length,
							recordsToInsert.length
						)} of ${recordsToInsert.length}`,
						traceId,
					});
				}

				// Use regular insert since there's no unique constraint on showtime_pid
				const { error: insertError } = await supabaseAdmin
					.from('movieshows')
					.insert(batch);

				if (insertError) {
					results.failed += batch.length;
					results.errors.push(`Error inserting batch: ${insertError.message}`);

					// Enhanced logging for failed insertions
					consoleError(
						`BATCH INSERTION FAILED - ${batch.length} movies failed to insert`,
						{
							batchNumber: Math.floor(i / BATCH_SIZE) + 1,
							errorMessage: insertError.message,
							errorCode: insertError.code,
							errorDetails: insertError.details,
							traceId,
							timestamp: new Date().toISOString(),
						}
					);

					// Add failed movies to the failedList with detailed logging
					batch.forEach((movie, movieIndex) => {
						const failedMovie = {
							moviepid: movie.moviepid,
							movie_name: movie.movie_name,
							showtime_pid: movie.showtime_pid,
							error: insertError.message,
						};

						results.failedList.push(failedMovie);

						// Log each failed movie individually
						consoleError(
							`Failed Movie ${movieIndex + 1} in Batch ${
								Math.floor(i / BATCH_SIZE) + 1
							}`,
							{
								...failedMovie,
								cinema: movie.cinema,
								city: movie.city,
								day: movie.day,
								time: movie.time,
								traceId,
							}
						);
					});

					// Log the failed movies to database for persistent tracking
					await logError(`Batch insertion failed for ${batch.length} movies`, {
						batchNumber: Math.floor(i / BATCH_SIZE) + 1,
						failedMovies: batch.map((movie) => ({
							moviepid: movie.moviepid,
							movie_name: movie.movie_name,
							showtime_pid: movie.showtime_pid,
							cinema: movie.cinema,
							city: movie.city,
						})),
						insertError: {
							message: insertError.message,
							code: insertError.code,
							details: insertError.details,
						},
						traceId,
					});
				} else {
					results.success += batch.length;

					// Add successful movies to the successList
					batch.forEach((movie) => {
						results.successList.push({
							moviepid: movie.moviepid,
							movie_name: movie.movie_name,
							showtime_pid: movie.showtime_pid,
						});
					});
				}
			}

			const processingTime = performance.now() - startTimeProcess;
			totalProcessingTime = processingTime; // Store in the outer variable

			// After processing
			consoleInfo(`Processing completed`, {
				executionTimeMs: Math.round(processingTime),
				traceId,
			});
		}

		// Enhanced logging for all failed movies
		const totalFailedMovies = results.failedList.length + skippedRecords.length;
		if (totalFailedMovies > 0) {
			consoleError(
				`TOTAL FAILED MOVIES - ${totalFailedMovies} movies failed processing`,
				{
					insertionFailures: results.failedList.length,
					validationFailures: skippedRecords.length,
					traceId,
					timestamp: new Date().toISOString(),
				}
			);

			// Log detailed breakdown of all failed movies
			const allFailedMovies = [
				...results.failedList.map((movie) => ({
					...movie,
					failureType: 'INSERTION_FAILURE',
					failureReason: movie.error,
				})),
				...skippedRecords.map((movie) => ({
					moviepid: movie.moviepid,
					movie_name: movie.movie_name,
					showtime_pid: movie.showtime_pid,
					failureType: 'VALIDATION_FAILURE',
					failureReason: movie.reason,
				})),
			];

			// Log comprehensive failed movies list to database
			await logError(`Total failed movies: ${totalFailedMovies}`, {
				summary: {
					totalFailed: totalFailedMovies,
					insertionFailures: results.failedList.length,
					validationFailures: skippedRecords.length,
				},
				allFailedMovies,
				traceId,
				timestamp: new Date().toISOString(),
			});

			// Log top failing movies by name for analysis
			const movieFailureCounts = allFailedMovies.reduce((acc, movie) => {
				const key = `${movie.movie_name} (PID: ${movie.moviepid})`;
				acc[key] = (acc[key] || 0) + 1;
				return acc;
			}, {} as Record<string, number>);

			const topFailingMovies = Object.entries(movieFailureCounts)
				.sort(([, a], [, b]) => b - a)
				.slice(0, 10);

			if (topFailingMovies.length > 0) {
				consoleWarn('Top 10 Failing Movies', {
					topFailingMovies,
					traceId,
				});
			}
		}

		// Comprehensive final summary
		const totalFailedMoviesForSummary =
			results.failedList.length + skippedRecords.length;
		const summaryData = {
			// Main metrics
			totalProcessed: showtimesData.length,
			newlyInserted: results.success,
			alreadyExisting: results.existing,
			failedToInsert: results.failed,
			skippedDueToValidation: skippedRecords.length,
			totalFailedMovies: totalFailedMoviesForSummary,

			// Processing details
			processingTime: Math.round(totalProcessingTime),
			fetchTime: Math.round(fetchTime),

			// Lists
			newMovies: results.successList.map((m) => ({
				name: m.movie_name,
				pid: m.moviepid,
				showtime_pid: m.showtime_pid,
			})),

			failedMovies: results.failedList.map((m) => ({
				name: m.movie_name,
				pid: m.moviepid,
				showtime_pid: m.showtime_pid,
				error: m.error,
				failureType: 'INSERTION_FAILURE',
			})),

			skippedMovies: skippedRecords.map((m) => ({
				name: m.movie_name,
				pid: m.moviepid,
				showtime_pid: m.showtime_pid,
				reason: m.reason,
				failureType: 'VALIDATION_FAILURE',
			})),

			// Enhanced failure analysis
			failureBreakdown: {
				insertionFailures: results.failedList.length,
				validationFailures: skippedRecords.length,
				totalFailures: totalFailedMoviesForSummary,
				failureRate:
					totalFailedMoviesForSummary > 0
						? (
								(totalFailedMoviesForSummary / showtimesData.length) *
								100
						  ).toFixed(2) + '%'
						: '0%',
			},

			// Summary counts
			errorCount: results.errors.length,
			validMoviesCount: validMoviePIDs.size,
			existingShowsCount: existingMap.size,

			// Trace info
			traceId,
			timestamp: new Date().toISOString(),
		};

		// Final console summary
		consoleInfo('SYNC OPERATION SUMMARY', summaryData);

		// Save entire operation result to the database as a single log entry
		await saveOperationLog('movieshows_sync', summaryData);
	} catch (error) {
		const errorData = {
			errorMessage: error instanceof Error ? error.message : 'Unknown error',
			errorStack: error instanceof Error ? error.stack : undefined,
			traceId,
			timestamp: new Date().toISOString(),
		};

		consoleError('Error in background processing', errorData);

		// Still log errors to the database
		await logError('Error in background processing', errorData);
	}
}
