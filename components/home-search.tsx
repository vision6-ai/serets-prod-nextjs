'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { Search, MapPin, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Locale } from '@/config/i18n';
import { cn } from '@/lib/utils';

interface HomeSearchProps {
	locale: Locale;
	onSearch: (query: string, city: string | null) => void;
}

interface SearchSuggestion {
	type: 'movie' | 'actor' | 'theater';
	id: string;
	name: string;
	subtitle?: string;
}

// Debounce helper function
const debounce = <F extends (...args: any[]) => any>(
	func: F,
	waitFor: number
) => {
	let timeout: ReturnType<typeof setTimeout> | null = null;
	return (...args: Parameters<F>): void => {
		if (timeout !== null) {
			clearTimeout(timeout);
		}
		timeout = setTimeout(() => func(...args), waitFor);
	};
};

// Cache for cities and search results
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Utility to get cached data
const getCachedData = (key: string) => {
	const cached = cache.get(key);
	if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
		return cached.data;
	}
	return null;
};

// Utility to set cached data
const setCachedData = (key: string, data: any) => {
	cache.set(key, { data, timestamp: Date.now() });
};

export function HomeSearch({ locale, onSearch }: HomeSearchProps) {
	const t = useTranslations('home.search');
	const citiesT = useTranslations('cities');
	const [searchQuery, setSearchQuery] = useState('');
	const [selectedCity, setSelectedCity] = useState<string | null>(null);
	const [cities, setCities] = useState<string[]>([]);
	const [filteredCities, setFilteredCities] = useState<string[]>([]);
	const [searchSuggestions, setSearchSuggestions] = useState<
		SearchSuggestion[]
	>([]);
	const [cityFilter, setCityFilter] = useState('');
	const [loading, setLoading] = useState(false);
	const [isOpen, setIsOpen] = useState(false);
	const [showSuggestions, setShowSuggestions] = useState(false);
	const isRtl = locale === 'he';
	const citySearchInputRef = useRef<HTMLInputElement>(null);
	const dropdownRef = useRef<HTMLDivElement>(null);
	const suggestionsRef = useRef<HTMLDivElement>(null);

	// Load saved city from localStorage
	useEffect(() => {
		if (typeof window !== 'undefined') {
			const savedCity = localStorage.getItem('selectedCity');
			if (savedCity) {
				setSelectedCity(savedCity);
				onSearch('', savedCity);
			}
		}
	}, [onSearch]);

	// Fetch unique cities efficiently via API
	const fetchUniqueCities = useCallback(async () => {
		const cacheKey = 'unique_cities';
		const cachedCities = getCachedData(cacheKey);

		if (cachedCities) {
			setCities(cachedCities);
			setFilteredCities(cachedCities);
			return;
		}

		try {
			setLoading(true);

			// Use the dedicated API endpoint for better performance
			const response = await fetch('/api/search?type=cities');
			if (!response.ok) {
				throw new Error('Failed to fetch cities');
			}

			const { cities: uniqueCities } = await response.json();

			console.log('Fetched unique cities via API:', uniqueCities.length);
			setCachedData(cacheKey, uniqueCities);
			setCities(uniqueCities);
			setFilteredCities(uniqueCities);
		} catch (error) {
			console.error('Error fetching cities:', error);
		} finally {
			setLoading(false);
		}
	}, []);

	// Fetch search suggestions efficiently via API
	const fetchSearchSuggestions = useCallback(async (query: string) => {
		if (!query.trim() || query.length < 2) {
			setSearchSuggestions([]);
			return;
		}

		const cacheKey = `search_${query.toLowerCase()}`;
		const cachedSuggestions = getCachedData(cacheKey);

		if (cachedSuggestions) {
			setSearchSuggestions(cachedSuggestions);
			return;
		}

		try {
			// Use the dedicated API endpoint for better performance
			const response = await fetch(
				`/api/search?type=suggestions&query=${encodeURIComponent(query)}`
			);
			if (!response.ok) {
				throw new Error('Failed to fetch suggestions');
			}

			const { suggestions } = await response.json();

			setCachedData(cacheKey, suggestions);
			setSearchSuggestions(suggestions);
		} catch (error) {
			console.error('Error fetching search suggestions:', error);
		}
	}, []);

	// Debounced search function
	const debouncedSearch = useCallback(
		debounce((query: string, city: string | null) => {
			onSearch(query, city);
		}, 300),
		[onSearch]
	);

	// Debounced suggestions fetch
	const debouncedFetchSuggestions = useCallback(
		debounce((query: string) => {
			fetchSearchSuggestions(query);
		}, 200),
		[fetchSearchSuggestions]
	);

	// Initialize cities on mount
	useEffect(() => {
		fetchUniqueCities();
	}, [fetchUniqueCities]);

	// Handle city filter changes
	useEffect(() => {
		if (!cityFilter) {
			setFilteredCities(cities);
			return;
		}

		const filtered = cities.filter((city) => {
			const cityLower = city.toLowerCase();
			const filterLower = cityFilter.toLowerCase();
			const translatedCity = getTranslatedCity(city)?.toLowerCase() || '';

			return (
				cityLower.includes(filterLower) || translatedCity.includes(filterLower)
			);
		});

		setFilteredCities(filtered);
	}, [cityFilter, cities]);

	// Handle search input changes
	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const newQuery = e.target.value;
		setSearchQuery(newQuery);
		setShowSuggestions(newQuery.length > 0);

		// Fetch suggestions and trigger search
		if (newQuery.trim()) {
			debouncedFetchSuggestions(newQuery);
		} else {
			setSearchSuggestions([]);
		}

		debouncedSearch(newQuery, selectedCity);
	};

	// Handle suggestion selection
	const handleSuggestionSelect = (suggestion: SearchSuggestion) => {
		setSearchQuery(suggestion.name);
		setShowSuggestions(false);
		debouncedSearch(suggestion.name, selectedCity);
	};

	// Handle city selection
	const handleCityChange = (city: string | null) => {
		setSelectedCity(city);
		setIsOpen(false);
		setCityFilter('');

		// Save to localStorage
		if (city) {
			localStorage.setItem('selectedCity', city);
		} else {
			localStorage.removeItem('selectedCity');
		}

		debouncedSearch(searchQuery, city);
	};

	// Get translated city name
	const getTranslatedCity = useCallback(
		(city: string | null) => {
			if (!city) return t('selectCity');
			try {
				return citiesT(city);
			} catch (error) {
				return city;
			}
		},
		[t, citiesT]
	);

	// Handle click outside
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (
				dropdownRef.current &&
				!dropdownRef.current.contains(event.target as Node)
			) {
				setIsOpen(false);
			}
			if (
				suggestionsRef.current &&
				!suggestionsRef.current.contains(event.target as Node)
			) {
				setShowSuggestions(false);
			}
		};

		document.addEventListener('mousedown', handleClickOutside);
		return () => document.removeEventListener('mousedown', handleClickOutside);
	}, []);

	// Add styles for dropdown
	useEffect(() => {
		const style = document.createElement('style');
		style.textContent = `
			.search-dropdown {
				background-color: hsl(var(--card));
				border: 1px solid hsl(var(--border));
				border-radius: 8px;
				box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
				max-width: 500px;
				width: 100%;
				position: absolute;
				z-index: 50;
				margin-top: 4px;
				overflow: hidden;
				max-height: 300px;
				overflow-y: auto;
			}
			
			.search-dropdown-item {
				padding: 12px 16px;
				color: hsl(var(--foreground));
				font-size: 14px;
				border-bottom: 1px solid hsl(var(--border));
				cursor: pointer;
				display: flex;
				justify-content: space-between;
				align-items: center;
			}
			
			.search-dropdown-item:last-child {
				border-bottom: none;
			}
			
			.search-dropdown-item:hover {
				background-color: hsl(var(--accent));
			}
			
			.city-select-dropdown {
				background-color: hsl(var(--card));
				border: 1px solid hsl(var(--border));
				border-radius: 8px;
				box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
				max-width: 500px;
				width: 100%;
				position: absolute;
				z-index: 50;
				margin-top: 4px;
				overflow: hidden;
			}
			
			.city-select-item {
				padding: 16px 20px;
				color: hsl(var(--foreground));
				font-size: 18px;
				border-bottom: 1px solid hsl(var(--border));
				line-height: 1.5;
				cursor: pointer;
			}
			
			.city-select-item:last-child {
				border-bottom: none;
			}
			
			.city-select-item:hover {
				background-color: hsl(var(--accent));
			}
		`;
		document.head.appendChild(style);

		// Return cleanup function
		return () => {
			document.head.removeChild(style);
		};
	}, []);

	return (
		<div className="w-full space-y-3 max-w-[500px] mx-auto mb-8">
			{/* Search Input */}
			<div className="relative">
				<div
					className={cn(
						'absolute inset-y-0 flex items-center',
						isRtl ? 'right-3' : 'left-3'
					)}>
					<Search className="h-5 w-5 text-muted-foreground" />
				</div>
				<Input
					type="text"
					placeholder={t('searchPlaceholder')}
					className={cn(
						'h-12 bg-card border-input shadow-sm',
						isRtl ? 'pr-10 pl-4 text-right' : 'pl-10 pr-4'
					)}
					value={searchQuery}
					onChange={handleInputChange}
					onFocus={() => setShowSuggestions(searchQuery.length > 0)}
				/>

				{/* Search Suggestions */}
				{showSuggestions && searchSuggestions.length > 0 && (
					<div ref={suggestionsRef} className="search-dropdown">
						{searchSuggestions.map((suggestion, index) => (
							<div
								key={`${suggestion.type}-${suggestion.id}-${index}`}
								className="search-dropdown-item"
								onClick={() => handleSuggestionSelect(suggestion)}>
								<span>{suggestion.name}</span>
								<span className="text-xs text-muted-foreground">
									{suggestion.subtitle}
								</span>
							</div>
						))}
					</div>
				)}
			</div>

			{/* City Selector */}
			<div className="relative" ref={dropdownRef}>
				<button
					type="button"
					onClick={() => setIsOpen(!isOpen)}
					className={cn(
						'flex h-12 w-full items-center justify-between rounded-md border border-input bg-card px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
						isRtl ? 'flex-row text-right' : 'text-left'
					)}>
					<div
						className={cn('flex items-center w-full', isRtl ? 'flex-row' : '')}>
						<MapPin
							className={cn(
								'h-5 w-5 text-muted-foreground',
								isRtl ? 'ml-3' : 'mr-2'
							)}
						/>
						<span>{getTranslatedCity(selectedCity)}</span>
					</div>
					<svg
						className="h-4 w-4 opacity-50"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						strokeWidth="2">
						<polyline points="6 9 12 15 18 9" />
					</svg>
				</button>

				{/* City Dropdown */}
				{isOpen && (
					<div className="city-select-dropdown">
						{/* Filter Input */}
						<div className="sticky top-0 p-2 border-b border-border bg-card">
							<div className="relative">
								<Search className="h-4 w-4 absolute left-2.5 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
								<input
									ref={citySearchInputRef}
									className={cn(
										'w-full h-9 px-9 py-2 bg-background rounded-md border border-input focus:outline-none focus:ring-1 focus:ring-ring',
										isRtl ? 'text-right' : 'text-left'
									)}
									placeholder={t('filterCities')}
									value={cityFilter}
									onChange={(e) => setCityFilter(e.target.value)}
								/>
								{cityFilter && (
									<button
										type="button"
										className="absolute right-2.5 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
										onClick={() => setCityFilter('')}>
										<X size={14} />
									</button>
								)}
							</div>
						</div>

						{/* Cities List */}
						<div className="max-h-[300px] overflow-auto">
							<div
								className="city-select-item"
								onClick={() => handleCityChange(null)}>
								{t('allCities')}
							</div>
							{loading ? (
								<div className="p-4 text-center text-muted-foreground">
									{t('loading') || 'Loading...'}
								</div>
							) : (
								filteredCities.map((city) => (
									<div
										key={city}
										className="city-select-item"
										onClick={() => handleCityChange(city)}>
										{getTranslatedCity(city)}
									</div>
								))
							)}
							{!loading && filteredCities.length === 0 && (
								<div className="p-4 text-center text-muted-foreground">
									{t('noCitiesFound')}
								</div>
							)}
						</div>
					</div>
				)}
			</div>
		</div>
	);
}
