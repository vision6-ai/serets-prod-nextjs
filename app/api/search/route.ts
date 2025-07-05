import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

// Cache for database results
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Utility functions for caching
const getCachedData = (key: string) => {
	const cached = cache.get(key);
	if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
		return cached.data;
	}
	return null;
};

const setCachedData = (key: string, data: any) => {
	cache.set(key, { data, timestamp: Date.now() });
};

export async function GET(request: NextRequest) {
	const { searchParams } = new URL(request.url);
	const type = searchParams.get('type');
	const query = searchParams.get('query');
	const clearCache = searchParams.get('clearCache') === 'true';

	// Clear cache if requested
	if (clearCache) {
		cache.clear();
		console.log('Cache cleared');
	}

	try {
		const supabase = createRouteHandlerClient({ cookies });

		switch (type) {
			case 'cities':
				return await getCities(supabase);
			case 'suggestions':
				if (!query) {
					return NextResponse.json(
						{ error: 'Query parameter required for suggestions' },
						{ status: 400 }
					);
				}
				return await getSearchSuggestions(supabase, query);
			default:
				return NextResponse.json(
					{ error: 'Invalid type parameter' },
					{ status: 400 }
				);
		}
	} catch (error) {
		console.error('Search API error:', error);
		return NextResponse.json(
			{ error: 'Internal server error' },
			{ status: 500 }
		);
	}
}

async function getCities(supabase: any) {
	const cacheKey = 'unique_cities';
	const cachedCities = getCachedData(cacheKey);

	if (cachedCities) {
		return NextResponse.json({ cities: cachedCities });
	}

	try {
		// Use a more efficient query with DISTINCT at database level
		const { data, error } = await supabase.rpc('get_distinct_cities');

		if (error) {
			// Fallback: Use pagination to get all cities and process unique values
			let allCities: string[] = [];
			let hasMore = true;
			let offset = 0;
			const limit = 1000;

			console.log(
				'RPC failed, using pagination fallback to fetch all cities...'
			);

			while (hasMore) {
				const { data: batchData, error: batchError } = await supabase
					.from('movieshows')
					.select('city')
					.not('city', 'is', null)
					.range(offset, offset + limit - 1)
					.order('city');

				if (batchError) {
					throw batchError;
				}

				console.log(
					`Fetched batch ${offset}-${offset + limit - 1}: ${
						batchData.length
					} records`
				);

				if (batchData.length === 0) {
					hasMore = false;
				} else {
					allCities = allCities.concat(batchData.map((item: any) => item.city));
					offset += limit;
					hasMore = batchData.length === limit;
				}
			}

			console.log(`Total cities collected: ${allCities.length}`);

			// Count occurrences of each city
			const cityCounts = new Map<string, number>();
			allCities.forEach((city) => {
				if (city) {
					cityCounts.set(city, (cityCounts.get(city) || 0) + 1);
				}
			});

			// Sort cities by occurrence count (descending), then alphabetically
			const uniqueCities = Array.from(cityCounts.entries())
				.sort((a, b) => {
					// First sort by count (descending)
					if (b[1] !== a[1]) {
						return b[1] - a[1];
					}
					// Then sort alphabetically
					return a[0].localeCompare(b[0]);
				})
				.map(([city]) => city);

			console.log(`Unique cities found: ${uniqueCities.length}`);
			console.log(
				'Top 5 cities by movie show count:',
				Array.from(cityCounts.entries())
					.sort((a, b) => b[1] - a[1])
					.slice(0, 5)
					.map(([city, count]) => `${city}: ${count}`)
			);
			setCachedData(cacheKey, uniqueCities);
			return NextResponse.json({ cities: uniqueCities });
		}

		// The RPC function returns distinct cities, but we need to get counts for proper sorting
		// Fall back to pagination to get proper counts
		console.log(
			'RPC succeeded but we need counts for sorting, using pagination...'
		);

		let allCities: string[] = [];
		let hasMore = true;
		let offset = 0;
		const limit = 1000;

		while (hasMore) {
			const { data: batchData, error: batchError } = await supabase
				.from('movieshows')
				.select('city')
				.not('city', 'is', null)
				.range(offset, offset + limit - 1)
				.order('city');

			if (batchError) {
				throw batchError;
			}

			if (batchData.length === 0) {
				hasMore = false;
			} else {
				allCities = allCities.concat(batchData.map((item: any) => item.city));
				offset += limit;
				hasMore = batchData.length === limit;
			}
		}

		// Count occurrences and sort by popularity
		const cityCounts = new Map<string, number>();
		allCities.forEach((city) => {
			if (city) {
				cityCounts.set(city, (cityCounts.get(city) || 0) + 1);
			}
		});

		const sortedCities = Array.from(cityCounts.entries())
			.sort((a, b) => {
				if (b[1] !== a[1]) {
					return b[1] - a[1];
				}
				return a[0].localeCompare(b[0]);
			})
			.map(([city]) => city);

		console.log(
			'Top 5 cities by movie show count:',
			Array.from(cityCounts.entries())
				.sort((a, b) => b[1] - a[1])
				.slice(0, 5)
				.map(([city, count]) => `${city}: ${count}`)
		);

		setCachedData(cacheKey, sortedCities);
		return NextResponse.json({ cities: sortedCities });
	} catch (error) {
		console.error('Error fetching cities:', error);
		throw error;
	}
}

async function getSearchSuggestions(supabase: any, query: string) {
	if (query.length < 2) {
		return NextResponse.json({ suggestions: [] });
	}

	const cacheKey = `search_suggestions_${query.toLowerCase()}`;
	const cachedSuggestions = getCachedData(cacheKey);

	if (cachedSuggestions) {
		return NextResponse.json({ suggestions: cachedSuggestions });
	}

	try {
		const searchTerm = `%${query.toLowerCase()}%`;

		// Get unique movie names and theaters efficiently
		const { data, error } = await supabase
			.from('movieshows')
			.select('movie_name, theater_name')
			.or(`movie_name.ilike.${searchTerm},theater_name.ilike.${searchTerm}`)
			.limit(20); // Fetch more to get good unique results

		if (error) {
			throw error;
		}

		// Process and deduplicate suggestions
		const movieNames = new Set<string>();
		const theaterNames = new Set<string>();

		data?.forEach((item: any) => {
			if (
				item.movie_name &&
				item.movie_name.toLowerCase().includes(query.toLowerCase())
			) {
				movieNames.add(item.movie_name);
			}
			if (
				item.theater_name &&
				item.theater_name.toLowerCase().includes(query.toLowerCase())
			) {
				theaterNames.add(item.theater_name);
			}
		});

		const suggestions = [
			...Array.from(movieNames)
				.slice(0, 5)
				.map((name) => ({
					type: 'movie',
					id: name,
					name,
					subtitle: 'Movie',
				})),
			...Array.from(theaterNames)
				.slice(0, 5)
				.map((name) => ({
					type: 'theater',
					id: name,
					name,
					subtitle: 'Theater',
				})),
		];

		setCachedData(cacheKey, suggestions);
		return NextResponse.json({ suggestions });
	} catch (error) {
		console.error('Error fetching search suggestions:', error);
		throw error;
	}
}

// Optional: Create the database function for better performance
export async function POST(request: NextRequest) {
	try {
		const supabase = createRouteHandlerClient({ cookies });

		// Create the RPC function if it doesn't exist
		const { error } = await supabase.rpc('exec_sql', {
			sql: `
				CREATE OR REPLACE FUNCTION get_distinct_cities()
				RETURNS TABLE(city TEXT) AS $$
				BEGIN
					RETURN QUERY
					SELECT DISTINCT movieshows.city
					FROM movieshows
					WHERE movieshows.city IS NOT NULL
					ORDER BY movieshows.city;
				END;
				$$ LANGUAGE plpgsql;
			`,
		});

		if (error) {
			return NextResponse.json(
				{ error: 'Failed to create database function' },
				{ status: 500 }
			);
		}

		return NextResponse.json({
			message: 'Database function created successfully',
		});
	} catch (error) {
		console.error('Error creating database function:', error);
		return NextResponse.json(
			{ error: 'Internal server error' },
			{ status: 500 }
		);
	}
}
