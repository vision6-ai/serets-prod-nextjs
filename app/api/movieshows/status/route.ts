import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

// Initialize Supabase admin client
const supabaseAdmin = createClient(
	process.env.NEXT_PUBLIC_SUPABASE_URL!,
	process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
	try {
		const { searchParams } = new URL(request.url);
		const includeFailedMovies =
			searchParams.get('includeFailedMovies') === 'true';
		const limit = parseInt(searchParams.get('limit') || '10');

		// Get recent sync operations
		const { data: recentLogs, error: logsError } = await supabaseAdmin
			.from('logs')
			.select('*')
			.eq('level', 'info')
			.ilike('message', '%Operation completed: movieshows_sync%')
			.order('created_at', { ascending: false })
			.limit(limit);

		if (logsError) {
			return NextResponse.json(
				{ error: 'Failed to fetch sync logs' },
				{ status: 500 }
			);
		}

		// Get recent failed movies if requested
		let failedMoviesLogs = null;
		if (includeFailedMovies) {
			const { data: failedLogs, error: failedLogsError } = await supabaseAdmin
				.from('logs')
				.select('*')
				.eq('level', 'error')
				.or(
					'message.ilike.%failed movies%,message.ilike.%batch insertion failed%'
				)
				.order('created_at', { ascending: false })
				.limit(limit);

			if (!failedLogsError) {
				failedMoviesLogs = failedLogs;
			}
		}

		// Get latest movieshows count
		const { count: totalMovieshows, error: countError } = await supabaseAdmin
			.from('showtimes')
			.select('*', { count: 'exact', head: true });

		if (countError) {
			return NextResponse.json(
				{ error: 'Failed to fetch movieshows count' },
				{ status: 500 }
			);
		}

		// Process recent logs to extract summary information
		const processedLogs =
			recentLogs?.map((log) => {
				const metadata = log.metadata || {};
				return {
					timestamp: log.created_at,
					traceId: metadata.traceId,
					totalProcessed: metadata.totalProcessed || 0,
					newlyInserted: metadata.newlyInserted || 0,
					alreadyExisting: metadata.alreadyExisting || 0,
					totalFailedMovies: metadata.totalFailedMovies || 0,
					failureBreakdown: metadata.failureBreakdown || {},
					processingTime: metadata.processingTime || 0,
					fetchTime: metadata.fetchTime || 0,
				};
			}) || [];

		// Process failed movies logs
		const processedFailedMovies =
			failedMoviesLogs?.map((log) => {
				const metadata = log.metadata || {};
				return {
					timestamp: log.created_at,
					message: log.message,
					traceId: metadata.traceId,
					summary: metadata.summary || {},
					failedMovies: metadata.allFailedMovies || metadata.failedMovies || [],
					batchNumber: metadata.batchNumber,
					insertError: metadata.insertError,
				};
			}) || [];

		return NextResponse.json({
			success: true,
			data: {
				totalMovieshows,
				recentSyncOperations: processedLogs,
				...(includeFailedMovies && {
					failedMoviesLogs: processedFailedMovies,
					failedMoviesCount: processedFailedMovies.reduce(
						(sum, log) => sum + (log.failedMovies?.length || 0),
						0
					),
				}),
			},
			timestamp: new Date().toISOString(),
		});
	} catch (error) {
		console.error('Error in status endpoint:', error);
		return NextResponse.json(
			{
				error: 'Internal server error',
				details: error instanceof Error ? error.message : 'Unknown error',
			},
			{ status: 500 }
		);
	}
}
