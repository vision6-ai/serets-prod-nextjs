'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { Search, MapPin, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Locale } from '@/config/i18n';
import { cn } from '@/lib/utils';

interface HomeSearchProps {
	locale: Locale;
	onSearch: (query: string, city: string | null) => void;
}

// Debounce helper function to limit how often a function can be called
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

export function HomeSearch({ locale, onSearch }: HomeSearchProps) {
	const t = useTranslations('home.search');
	const citiesT = useTranslations('cities');
	const [searchQuery, setSearchQuery] = useState('');
	const [selectedCity, setSelectedCity] = useState<string | null>(null);
	const [cities, setCities] = useState<string[]>([]);
	const [filteredCities, setFilteredCities] = useState<string[]>([]);
	const [cityFilter, setCityFilter] = useState('');
	const [loading, setLoading] = useState(false);
	const [isOpen, setIsOpen] = useState(false);
	const isRtl = locale === 'he';
	const citySearchInputRef = useRef<HTMLInputElement>(null);
	const dropdownRef = useRef<HTMLDivElement>(null);

	// Load saved city from localStorage on initial render
	useEffect(() => {
		if (typeof window !== 'undefined') {
			const savedCity = localStorage.getItem('selectedCity');
			if (savedCity) {
				setSelectedCity(savedCity);
				// Trigger search with saved city
				onSearch('', savedCity);
			}
		}
	}, [onSearch]);

	// Add styles for the dropdown
	useEffect(() => {
		// Add custom styles for dropdown
		const style = document.createElement('style');
		style.textContent = `
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

		// Clean up
		return () => {
			document.head.removeChild(style);
		};
	}, []);

	// Handle click outside to close dropdown
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (
				dropdownRef.current &&
				!dropdownRef.current.contains(event.target as Node)
			) {
				setIsOpen(false);
			}
		};

		if (isOpen) {
			document.addEventListener('mousedown', handleClickOutside);
		}

		return () => {
			document.removeEventListener('mousedown', handleClickOutside);
		};
	}, [isOpen]);

	// Focus search input when dropdown opens
	useEffect(() => {
		if (isOpen && citySearchInputRef.current) {
			citySearchInputRef.current.focus();
		}
	}, [isOpen]);

	// Fetch cities from the database
	useEffect(() => {
		const fetchCities = async () => {
			try {
				setLoading(true);
				const supabase = createClientComponentClient();
				const { data, error } = await supabase
					.from('movieshows')
					.select('city')
					.order('city');

				if (error) {
					console.error('Error fetching cities:', error);
					return;
				}

				// Extract unique cities
				const uniqueCities = [...new Set(data.map((item) => item.city))]
					.filter(Boolean)
					.sort();

				setCities(uniqueCities);
				setFilteredCities(uniqueCities);
			} catch (error) {
				console.error('Error in fetchCities:', error);
			} finally {
				setLoading(false);
			}
		};

		fetchCities();
	}, []);

	// Function to get the translated city name for display
	const getTranslatedCity = useCallback(
		(city: string | null) => {
			if (!city) return t('selectCity');
			try {
				return citiesT(city);
			} catch (error) {
				// If translation not found, return the original name
				return city;
			}
		},
		[t, citiesT]
	);

	// Filter cities based on search input
	useEffect(() => {
		if (!cityFilter) {
			setFilteredCities(cities);
			return;
		}

		const filtered = cities.filter(
			(city) =>
				city.toLowerCase().includes(cityFilter.toLowerCase()) ||
				getTranslatedCity(city)
					?.toLowerCase()
					.includes(cityFilter.toLowerCase())
		);
		setFilteredCities(filtered);
	}, [cityFilter, cities, getTranslatedCity]);

	// Create a simple filter handler
	const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setCityFilter(e.target.value);
	};

	// Clear filter handler
	const handleClearFilter = () => {
		setCityFilter('');
		if (citySearchInputRef.current) {
			citySearchInputRef.current.focus();
		}
	};

	// Create debounced search function
	const debouncedSearch = useCallback(
		debounce((query: string, city: string | null) => {
			console.log('Debounced search:', { query, city });
			onSearch(query, city);
		}, 300), // 300ms debounce time
		[onSearch]
	);

	// Handle city selection change
	const handleCityChange = (city: string | null) => {
		const newCity = city;
		setSelectedCity(newCity);
		setIsOpen(false);
		setCityFilter('');

		// Save city selection to localStorage for persistence
		if (newCity) {
			localStorage.setItem('selectedCity', newCity);
		} else {
			localStorage.removeItem('selectedCity');
		}

		// Trigger search when city changes
		debouncedSearch(searchQuery, newCity);
	};

	// Handle input change - triggers search automatically
	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const newQuery = e.target.value;
		setSearchQuery(newQuery);
		// Trigger search as user types
		debouncedSearch(newQuery, selectedCity);
	};

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
				/>
			</div>

			{/* Custom City Selector */}
			<div className="relative" ref={dropdownRef}>
				{/* Custom Trigger */}
				<button
					type="button"
					onClick={() => setIsOpen(!isOpen)}
					className={cn(
						'flex h-12 w-full items-center justify-between rounded-md border border-input bg-card px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
						isRtl ? 'flex-row text - right' : 'text - left'
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
						xmlns="http://www.w3.org/2000/svg"
						width="24"
						height="24"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						strokeWidth="2"
						strokeLinecap="round"
						strokeLinejoin="round"
						className="h-4 w-4 opacity-50">
						<polyline points="6 9 12 15 18 9"></polyline>
					</svg>
				</button>

				{/* Custom Dropdown */}
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
									onChange={handleFilterChange}
								/>
								{cityFilter && (
									<button
										type="button"
										className="absolute right-2.5 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground rounded-full p-0.5 focus:outline-none"
										onClick={handleClearFilter}>
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
							{filteredCities.map((city) => (
								<div
									key={city}
									className="city-select-item"
									onClick={() => handleCityChange(city)}>
									{getTranslatedCity(city)}
								</div>
							))}
							{filteredCities.length === 0 && (
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
