#!/usr/bin/env node

/**
 * Monitor Failed Movies Script
 *
 * This script helps you monitor and analyze failed movies from the CountIt API sync operations.
 * It provides various options to view recent failures, analyze patterns, and export data.
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

// Configuration
const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
const OUTPUT_DIR = path.join(process.cwd(), 'logs', 'failed-movies');

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
	fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

/**
 * Make HTTP request
 */
function makeRequest(url) {
	return new Promise((resolve, reject) => {
		const protocol = url.startsWith('https://') ? https : require('http');

		protocol
			.get(url, (res) => {
				let data = '';
				res.on('data', (chunk) => (data += chunk));
				res.on('end', () => {
					try {
						resolve(JSON.parse(data));
					} catch (e) {
						reject(new Error(`Invalid JSON response: ${e.message}`));
					}
				});
			})
			.on('error', reject);
	});
}

/**
 * Get failed movies data
 */
async function getFailedMovies(options = {}) {
	const { limit = 10, includeFailedMovies = true } = options;
	const url = `${BASE_URL}/api/movieshows/status?includeFailedMovies=${includeFailedMovies}&limit=${limit}`;

	console.log(`🔍 Fetching failed movies data from: ${url}`);

	try {
		const response = await makeRequest(url);
		return response;
	} catch (error) {
		console.error('❌ Failed to fetch data:', error.message);
		throw error;
	}
}

/**
 * Analyze failed movies patterns
 */
function analyzeFailures(failedMoviesLogs) {
	const analysis = {
		totalFailedMovies: 0,
		failuresByType: {},
		failuresByReason: {},
		topFailingMovies: {},
		recentFailures: [],
		averageFailuresPerSync: 0,
	};

	failedMoviesLogs.forEach((log) => {
		const failedMovies = log.failedMovies || [];
		analysis.totalFailedMovies += failedMovies.length;

		failedMovies.forEach((movie) => {
			// Count by failure type
			const failureType = movie.failureType || 'UNKNOWN';
			analysis.failuresByType[failureType] =
				(analysis.failuresByType[failureType] || 0) + 1;

			// Count by failure reason
			const reason = movie.failureReason || movie.reason || 'UNKNOWN';
			analysis.failuresByReason[reason] =
				(analysis.failuresByReason[reason] || 0) + 1;

			// Count by movie name
			const movieKey = `${movie.movie_name || 'Unknown'} (PID: ${
				movie.moviepid || 'N/A'
			})`;
			analysis.topFailingMovies[movieKey] =
				(analysis.topFailingMovies[movieKey] || 0) + 1;

			// Add to recent failures
			if (analysis.recentFailures.length < 20) {
				analysis.recentFailures.push({
					timestamp: log.timestamp,
					movieName: movie.movie_name || 'Unknown',
					moviePid: movie.moviepid,
					failureType,
					reason,
					traceId: log.traceId,
				});
			}
		});
	});

	// Calculate averages
	if (failedMoviesLogs.length > 0) {
		analysis.averageFailuresPerSync =
			analysis.totalFailedMovies / failedMoviesLogs.length;
	}

	// Convert objects to sorted arrays
	analysis.failuresByType = Object.entries(analysis.failuresByType).sort(
		([, a], [, b]) => b - a
	);

	analysis.failuresByReason = Object.entries(analysis.failuresByReason).sort(
		([, a], [, b]) => b - a
	);

	analysis.topFailingMovies = Object.entries(analysis.topFailingMovies)
		.sort(([, a], [, b]) => b - a)
		.slice(0, 10);

	return analysis;
}

/**
 * Display analysis results
 */
function displayAnalysis(analysis) {
	console.log('\n📊 FAILED MOVIES ANALYSIS');
	console.log('='.repeat(50));

	console.log(`\n📈 SUMMARY:`);
	console.log(`   Total Failed Movies: ${analysis.totalFailedMovies}`);
	console.log(
		`   Average Failures per Sync: ${analysis.averageFailuresPerSync.toFixed(
			2
		)}`
	);

	console.log(`\n🔍 FAILURE BREAKDOWN BY TYPE:`);
	analysis.failuresByType.forEach(([type, count]) => {
		console.log(`   ${type}: ${count} movies`);
	});

	console.log(`\n🔍 FAILURE BREAKDOWN BY REASON:`);
	analysis.failuresByReason.slice(0, 10).forEach(([reason, count]) => {
		console.log(`   ${reason}: ${count} movies`);
	});

	console.log(`\n🎬 TOP 10 FAILING MOVIES:`);
	analysis.topFailingMovies.forEach(([movie, count], index) => {
		console.log(`   ${index + 1}. ${movie}: ${count} failures`);
	});

	console.log(`\n🕐 RECENT FAILURES (Last 20):`);
	analysis.recentFailures.slice(0, 10).forEach((failure, index) => {
		console.log(
			`   ${index + 1}. ${failure.movieName} (${failure.failureType})`
		);
		console.log(`      Reason: ${failure.reason}`);
		console.log(`      Time: ${new Date(failure.timestamp).toLocaleString()}`);
	});
}

/**
 * Export data to files
 */
function exportData(data, analysis) {
	const timestamp = new Date().toISOString().replace(/[:.]/g, '-');

	// Export raw data
	const rawDataFile = path.join(
		OUTPUT_DIR,
		`failed-movies-raw-${timestamp}.json`
	);
	fs.writeFileSync(rawDataFile, JSON.stringify(data, null, 2));

	// Export analysis
	const analysisFile = path.join(
		OUTPUT_DIR,
		`failed-movies-analysis-${timestamp}.json`
	);
	fs.writeFileSync(analysisFile, JSON.stringify(analysis, null, 2));

	// Export CSV for easy analysis
	const csvFile = path.join(OUTPUT_DIR, `failed-movies-${timestamp}.csv`);
	const csvData = analysis.recentFailures
		.map(
			(failure) =>
				`"${failure.timestamp}","${failure.movieName}","${failure.moviePid}","${failure.failureType}","${failure.reason}","${failure.traceId}"`
		)
		.join('\n');

	const csvHeader =
		'Timestamp,Movie Name,Movie PID,Failure Type,Reason,Trace ID\n';
	fs.writeFileSync(csvFile, csvHeader + csvData);

	console.log(`\n💾 DATA EXPORTED:`);
	console.log(`   Raw Data: ${rawDataFile}`);
	console.log(`   Analysis: ${analysisFile}`);
	console.log(`   CSV: ${csvFile}`);
}

/**
 * Main function
 */
async function main() {
	const args = process.argv.slice(2);
	const options = {};

	// Parse command line arguments
	args.forEach((arg) => {
		if (arg.startsWith('--limit=')) {
			options.limit = parseInt(arg.split('=')[1]);
		} else if (arg === '--no-export') {
			options.noExport = true;
		} else if (arg === '--help') {
			console.log(`
🎬 Failed Movies Monitor

Usage: node scripts/monitor-failed-movies.js [options]

Options:
  --limit=N       Number of recent sync operations to analyze (default: 10)
  --no-export     Don't export data to files
  --help          Show this help message

Examples:
  node scripts/monitor-failed-movies.js
  node scripts/monitor-failed-movies.js --limit=20
  node scripts/monitor-failed-movies.js --limit=5 --no-export
            `);
			process.exit(0);
		}
	});

	try {
		console.log('🎬 Starting Failed Movies Monitor...');

		// Get data
		const data = await getFailedMovies(options);

		if (!data.success) {
			console.error('❌ Failed to get data:', data.error);
			process.exit(1);
		}

		// Check if we have failed movies data
		if (
			!data.data.failedMoviesLogs ||
			data.data.failedMoviesLogs.length === 0
		) {
			console.log('✅ No failed movies found in recent sync operations!');
			process.exit(0);
		}

		// Analyze failures
		const analysis = analyzeFailures(data.data.failedMoviesLogs);

		// Display results
		displayAnalysis(analysis);

		// Export data if requested
		if (!options.noExport) {
			exportData(data, analysis);
		}

		console.log('\n✅ Analysis complete!');
	} catch (error) {
		console.error('❌ Error:', error.message);
		process.exit(1);
	}
}

// Run if called directly
if (require.main === module) {
	main();
}

module.exports = {
	getFailedMovies,
	analyzeFailures,
	displayAnalysis,
	exportData,
};
