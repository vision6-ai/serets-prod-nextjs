#!/usr/bin/env node

/**
 * List Unique Failed Movies
 *
 * This script fetches data directly from CountIt API and saves all unique movies to CSV.
 * Also displays unique movies that failed to insert from recent sync operations.
 */

require('dotenv').config();

const https = require('https');
const fs = require('fs');
const path = require('path');

// Configuration
const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
const OUTPUT_DIR = path.join(process.cwd(), 'logs', 'failed-movies');
const SHOWTIMES_API_URL =
	'https://admin.countit.online/api/v2/getview/showtimes_webSite/5000/ISRAEL';
const API_KEY = process.env.SHOWTIMES_API_KEY;

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
 * Fetch data directly from CountIt API
 */
async function fetchCountItApiData() {
	if (!API_KEY) {
		throw new Error('SHOWTIMES_API_KEY environment variable is not set');
	}

	const fullUrl = `${SHOWTIMES_API_URL}?key=${API_KEY}`;

	console.log('🔍 Fetching data from CountIt API...');
	console.log(`📡 URL: ${SHOWTIMES_API_URL}`);

	try {
		const response = await makeRequest(fullUrl);

		if (!response || !response.data || !Array.isArray(response.data)) {
			throw new Error('Invalid response format from CountIt API');
		}

		console.log(`✅ Fetched ${response.data.length} records from CountIt API`);
		return response.data;
	} catch (error) {
		throw new Error(`Failed to fetch from CountIt API: ${error.message}`);
	}
}

/**
 * Get unique movies from CountIt API data
 */
function getUniqueMoviesFromCountItData(showtimesData) {
	const uniqueMovies = new Map();

	showtimesData.forEach((showtime) => {
		const moviePID = showtime.MoviePID;
		const movieName = showtime.MOVIE_Name || 'Unknown';

		// Use MoviePID as the unique key
		if (!uniqueMovies.has(moviePID)) {
			uniqueMovies.set(moviePID, {
				moviePID: moviePID,
				movieName: movieName,
				movieEnglish: showtime.MOVIE_English || '',
				genres: showtime.GENRES || '',
				banner: showtime.BANNER || '',
				imdbid: showtime.IMDBID || '',
				showtimeCount: 1,
				cities: new Set([showtime.CITY || '']),
				cinemas: new Set([showtime.CINEMA || '']),
				chains: new Set([showtime.CHAIN || '']),
				days: new Set([showtime.DAY || '']),
				totalAvailableSeats: parseInt(showtime.AvailableSEATS) || 0,
				deepLinks: new Set([showtime.DeepLink || '']),
				lastUpdate: showtime.LastUpdate || '',
				// Store first showtime record for reference
				sampleShowtime: {
					showtimePID: showtime.SHOWTIME_PID,
					time: showtime.TIME,
					day: showtime.DAY,
					cinema: showtime.CINEMA,
					city: showtime.CITY,
					chain: showtime.CHAIN,
					availableSeats: showtime.AvailableSEATS,
					deepLink: showtime.DeepLink,
				},
			});
		} else {
			// Update existing movie with additional showtime data
			const existing = uniqueMovies.get(moviePID);
			existing.showtimeCount++;
			existing.cities.add(showtime.CITY || '');
			existing.cinemas.add(showtime.CINEMA || '');
			existing.chains.add(showtime.CHAIN || '');
			existing.days.add(showtime.DAY || '');
			existing.totalAvailableSeats += parseInt(showtime.AvailableSEATS) || 0;
			existing.deepLinks.add(showtime.DeepLink || '');
		}
	});

	// Convert sets to arrays and sort by showtime count
	return Array.from(uniqueMovies.values())
		.map((movie) => ({
			...movie,
			cities: Array.from(movie.cities)
				.filter((city) => city)
				.sort(),
			cinemas: Array.from(movie.cinemas)
				.filter((cinema) => cinema)
				.sort(),
			chains: Array.from(movie.chains)
				.filter((chain) => chain)
				.sort(),
			days: Array.from(movie.days)
				.filter((day) => day)
				.sort(),
			deepLinks: Array.from(movie.deepLinks).filter((link) => link),
		}))
		.sort((a, b) => b.showtimeCount - a.showtimeCount);
}

/**
 * Export unique movies from CountIt API to CSV
 */
function exportUniqueMoviesToCSV(movies) {
	if (movies.length === 0) {
		console.log('✅ No movies to export!');
		return null;
	}

	const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
	const csvFile = path.join(
		OUTPUT_DIR,
		`countit-unique-movies-${timestamp}.csv`
	);

	// CSV Headers - All CountIt API fields plus aggregated data
	const headers = [
		'Movie PID',
		'Movie Name (Hebrew)',
		'Movie Name (English)',
		'Genres',
		'IMDB ID',
		'Banner',
		'Showtime Count',
		'Total Available Seats',
		'Cities',
		'Cinemas',
		'Chains',
		'Days',
		'Sample Showtime PID',
		'Sample Time',
		'Sample Day',
		'Sample Cinema',
		'Sample City',
		'Sample Chain',
		'Sample Available Seats',
		'Sample Deep Link',
		'Last Update',
	];

	// Convert movies to CSV rows
	const csvRows = movies.map((movie) => {
		return [
			movie.moviePID || 'NULL',
			`"${movie.movieName.replace(/"/g, '""')}"`, // Escape quotes
			`"${movie.movieEnglish.replace(/"/g, '""')}"`,
			`"${movie.genres.replace(/"/g, '""')}"`,
			`"${movie.imdbid}"`,
			`"${movie.banner}"`,
			movie.showtimeCount,
			movie.totalAvailableSeats,
			`"${movie.cities.join('; ')}"`,
			`"${movie.cinemas.join('; ')}"`,
			`"${movie.chains.join('; ')}"`,
			`"${movie.days.join('; ')}"`,
			movie.sampleShowtime.showtimePID || 'NULL',
			`"${movie.sampleShowtime.time || ''}"`,
			`"${movie.sampleShowtime.day || ''}"`,
			`"${movie.sampleShowtime.cinema || ''}"`,
			`"${movie.sampleShowtime.city || ''}"`,
			`"${movie.sampleShowtime.chain || ''}"`,
			movie.sampleShowtime.availableSeats || 0,
			`"${movie.sampleShowtime.deepLink || ''}"`,
			`"${movie.lastUpdate}"`,
		].join(',');
	});

	// Combine headers and rows
	const csvContent = [headers.join(','), ...csvRows].join('\n');

	// Write to file
	fs.writeFileSync(csvFile, csvContent, 'utf8');

	console.log(`\n💾 COUNTIT MOVIES CSV EXPORT SUCCESSFUL:`);
	console.log(`   File: ${csvFile}`);
	console.log(`   Records: ${movies.length}`);
	console.log(`   Size: ${(csvContent.length / 1024).toFixed(2)} KB`);

	return csvFile;
}

/**
 * Get unique failed movies
 */
async function getUniqueFailedMovies(limit = 50) {
	const url = `${BASE_URL}/api/movieshows/status?includeFailedMovies=true&limit=${limit}`;

	try {
		const response = await makeRequest(url);

		if (!response.success) {
			throw new Error(response.error || 'Failed to fetch data');
		}

		if (!response.data.failedMoviesLogs) {
			return [];
		}

		// Extract all failed movies from all logs
		const allFailedMovies = [];
		response.data.failedMoviesLogs.forEach((log) => {
			const failedMovies = log.failedMovies || [];
			failedMovies.forEach((movie) => {
				allFailedMovies.push({
					moviepid: movie.moviepid,
					movie_name: movie.movie_name || movie.name || 'Unknown',
					showtime_pid: movie.showtime_pid,
					failureType: movie.failureType || 'UNKNOWN',
					failureReason:
						movie.failureReason ||
						movie.reason ||
						movie.error ||
						'Unknown reason',
					timestamp: log.timestamp,
					traceId: log.traceId,
				});
			});
		});

		// Create unique list by movie name and PID
		const uniqueMovies = new Map();
		allFailedMovies.forEach((movie) => {
			const key = `${movie.movie_name}_${movie.moviepid}`;
			if (!uniqueMovies.has(key)) {
				uniqueMovies.set(key, {
					...movie,
					failureCount: 1,
					firstSeen: movie.timestamp,
					lastSeen: movie.timestamp,
					failureReasons: new Set([movie.failureReason]),
					failureTypes: new Set([movie.failureType]),
				});
			} else {
				const existing = uniqueMovies.get(key);
				existing.failureCount++;
				existing.failureReasons.add(movie.failureReason);
				existing.failureTypes.add(movie.failureType);
				if (new Date(movie.timestamp) > new Date(existing.lastSeen)) {
					existing.lastSeen = movie.timestamp;
				}
				if (new Date(movie.timestamp) < new Date(existing.firstSeen)) {
					existing.firstSeen = movie.timestamp;
				}
			}
		});

		// Convert back to array and sort by failure count (descending)
		return Array.from(uniqueMovies.values())
			.map((movie) => ({
				...movie,
				failureReasons: Array.from(movie.failureReasons),
				failureTypes: Array.from(movie.failureTypes),
			}))
			.sort((a, b) => b.failureCount - a.failureCount);
	} catch (error) {
		throw new Error(`Failed to fetch failed movies: ${error.message}`);
	}
}

/**
 * Display unique failed movies
 */
function displayUniqueFailedMovies(movies) {
	if (movies.length === 0) {
		console.log('✅ No failed movies found in recent sync operations!');
		return;
	}

	console.log(`\n🎬 UNIQUE FAILED MOVIES (${movies.length} total)`);
	console.log('='.repeat(80));

	movies.forEach((movie, index) => {
		console.log(`\n${index + 1}. ${movie.movie_name}`);
		console.log(`   Movie PID: ${movie.moviepid}`);
		console.log(`   Failure Count: ${movie.failureCount} time(s)`);
		console.log(`   Failure Types: ${movie.failureTypes.join(', ')}`);
		console.log(`   Failure Reasons: ${movie.failureReasons.join(', ')}`);
		console.log(`   First Seen: ${new Date(movie.firstSeen).toLocaleString()}`);
		console.log(`   Last Seen: ${new Date(movie.lastSeen).toLocaleString()}`);
	});

	console.log('\n📊 SUMMARY:');
	console.log(`   Total Unique Failed Movies: ${movies.length}`);
	console.log(
		`   Most Failed Movie: ${movies[0]?.movie_name} (${movies[0]?.failureCount} failures)`
	);

	// Group by failure reason
	const reasonCounts = {};
	movies.forEach((movie) => {
		movie.failureReasons.forEach((reason) => {
			reasonCounts[reason] = (reasonCounts[reason] || 0) + 1;
		});
	});

	console.log('\n🔍 FAILURE REASONS BREAKDOWN:');
	Object.entries(reasonCounts)
		.sort(([, a], [, b]) => b - a)
		.forEach(([reason, count]) => {
			console.log(`   ${reason}: ${count} movies`);
		});
}

/**
 * Export failed movies to CSV format
 */
function exportFailedMoviesToCSV(movies) {
	if (movies.length === 0) {
		console.log('✅ No failed movies to export!');
		return null;
	}

	const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
	const csvFile = path.join(
		OUTPUT_DIR,
		`unique-failed-movies-${timestamp}.csv`
	);

	// CSV Headers
	const headers = [
		'Movie Name',
		'Movie PID',
		'Failure Count',
		'Failure Types',
		'Failure Reasons',
		'First Seen',
		'Last Seen',
		'Days Active',
	];

	// Convert movies to CSV rows
	const csvRows = movies.map((movie) => {
		const firstSeen = new Date(movie.firstSeen);
		const lastSeen = new Date(movie.lastSeen);
		const daysActive =
			Math.ceil((lastSeen - firstSeen) / (1000 * 60 * 60 * 24)) || 1;

		return [
			`"${movie.movie_name.replace(/"/g, '""')}"`, // Escape quotes in movie names
			movie.moviepid || 'NULL',
			movie.failureCount,
			`"${movie.failureTypes.join(', ')}"`,
			`"${movie.failureReasons.join(', ').replace(/"/g, '""')}"`, // Escape quotes
			firstSeen.toISOString(),
			lastSeen.toISOString(),
			daysActive,
		].join(',');
	});

	// Combine headers and rows
	const csvContent = [headers.join(','), ...csvRows].join('\n');

	// Write to file
	fs.writeFileSync(csvFile, csvContent, 'utf8');

	console.log(`\n💾 CSV EXPORT SUCCESSFUL:`);
	console.log(`   File: ${csvFile}`);
	console.log(`   Records: ${movies.length}`);
	console.log(`   Size: ${(csvContent.length / 1024).toFixed(2)} KB`);

	return csvFile;
}

/**
 * Export detailed CSV with all failure instances
 */
function exportDetailedFailedMoviesToCSV(movies) {
	if (movies.length === 0) {
		console.log('✅ No failed movies to export!');
		return null;
	}

	const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
	const csvFile = path.join(
		OUTPUT_DIR,
		`detailed-failed-movies-${timestamp}.csv`
	);

	// CSV Headers for detailed export
	const headers = [
		'Movie Name',
		'Movie PID',
		'Showtime PID',
		'Failure Type',
		'Failure Reason',
		'Timestamp',
		'Trace ID',
	];

	// Convert all failure instances to CSV rows
	const csvRows = [];
	movies.forEach((movie) => {
		// Create a row for each failure type and reason combination
		movie.failureTypes.forEach((failureType) => {
			movie.failureReasons.forEach((failureReason) => {
				csvRows.push(
					[
						`"${movie.movie_name.replace(/"/g, '""')}"`,
						movie.moviepid || 'NULL',
						movie.showtime_pid || 'NULL',
						`"${failureType}"`,
						`"${failureReason.replace(/"/g, '""')}"`,
						new Date(movie.lastSeen).toISOString(),
						`"${movie.traceId || 'N/A'}"`,
					].join(',')
				);
			});
		});
	});

	// Combine headers and rows
	const csvContent = [headers.join(','), ...csvRows].join('\n');

	// Write to file
	fs.writeFileSync(csvFile, csvContent, 'utf8');

	console.log(`\n💾 DETAILED CSV EXPORT SUCCESSFUL:`);
	console.log(`   File: ${csvFile}`);
	console.log(`   Records: ${csvRows.length}`);
	console.log(`   Size: ${(csvContent.length / 1024).toFixed(2)} KB`);

	return csvFile;
}

/**
 * Main function
 */
async function main() {
	const args = process.argv.slice(2);
	let limit = 50;
	let fetchFromCountIt = false;
	let exportCSV = false;

	// Parse command line arguments
	args.forEach((arg) => {
		if (arg.startsWith('--limit=')) {
			limit = parseInt(arg.split('=')[1]);
		} else if (arg === '--countit') {
			fetchFromCountIt = true;
		} else if (arg === '--csv') {
			exportCSV = true;
		} else if (arg === '--help') {
			console.log(`
🎬 Unique Failed Movies List & CountIt API Export

Usage: node scripts/list-unique-failed-movies.js [options]

Options:
  --limit=N       Number of recent sync operations to analyze (default: 50)
  --countit       Fetch data directly from CountIt API and export unique movies
  --csv           Export data to CSV format
  --help          Show this help message

Examples:
  # Show failed movies from recent sync operations
  node scripts/list-unique-failed-movies.js

  # Export all unique movies from CountIt API to CSV
  node scripts/list-unique-failed-movies.js --countit --csv

  # Show failed movies and export to CSV
  node scripts/list-unique-failed-movies.js --csv --limit=100

  # Just fetch and display CountIt data
  node scripts/list-unique-failed-movies.js --countit
            `);
			process.exit(0);
		}
	});

	try {
		if (fetchFromCountIt) {
			// Fetch data directly from CountIt API
			console.log('🌐 COUNTIT API MODE - Fetching all movies...');
			console.log('='.repeat(50));

			const countitData = await fetchCountItApiData();
			const uniqueMovies = getUniqueMoviesFromCountItData(countitData);

			console.log(
				`\n🎬 UNIQUE MOVIES FROM COUNTIT API (${uniqueMovies.length} total)`
			);
			console.log('='.repeat(80));

			// Display top 10 movies
			uniqueMovies.slice(0, 10).forEach((movie, index) => {
				console.log(`\n${index + 1}. ${movie.movieName}`);
				console.log(`   Movie PID: ${movie.moviePID}`);
				console.log(`   English Name: ${movie.movieEnglish}`);
				console.log(`   Genres: ${movie.genres}`);
				console.log(`   IMDB ID: ${movie.imdbid}`);
				console.log(`   Showtime Count: ${movie.showtimeCount}`);
				console.log(
					`   Cities: ${movie.cities.slice(0, 3).join(', ')}${
						movie.cities.length > 3 ? '...' : ''
					}`
				);
				console.log(`   Total Available Seats: ${movie.totalAvailableSeats}`);
			});

			if (uniqueMovies.length > 10) {
				console.log(`\n... and ${uniqueMovies.length - 10} more movies`);
			}

			console.log('\n📊 COUNTIT API SUMMARY:');
			console.log(`   Total Unique Movies: ${uniqueMovies.length}`);
			console.log(
				`   Most Popular Movie: ${uniqueMovies[0]?.movieName} (${uniqueMovies[0]?.showtimeCount} showtimes)`
			);

			// Export to CSV if requested
			if (exportCSV) {
				exportUniqueMoviesToCSV(uniqueMovies);
			}
		} else {
			// Original functionality - show failed movies
			console.log('🔍 Fetching unique failed movies...');

			const uniqueFailedMovies = await getUniqueFailedMovies(limit);
			displayUniqueFailedMovies(uniqueFailedMovies);

			// Export to CSV if requested
			if (exportCSV) {
				exportFailedMoviesToCSV(uniqueFailedMovies);
			}
		}
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
	getUniqueFailedMovies,
	displayUniqueFailedMovies,
	fetchCountItApiData,
	getUniqueMoviesFromCountItData,
	exportUniqueMoviesToCSV,
};
