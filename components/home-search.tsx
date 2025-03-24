'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { Search, MapPin } from 'lucide-react';
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
	const [loading, setLoading] = useState(false);
	const isRtl = locale === 'he';

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
      .city-select-content {
        background-color: #000;
        border: 1px solid #333;
        border-radius: 8px;
        box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
        max-width: 500px;
        width: 100%;
      }
      
      .city-select-content [role="option"] {
        padding: 16px 20px;
        color: white;
        font-size: 18px;
        border-bottom: 1px solid rgba(255,255,255,0.1);
        line-height: 1.5;
      }
      
      .city-select-content [role="option"]:last-child {
        border-bottom: none;
      }
      
      .city-select-content [role="option"][data-highlighted] {
        background-color: rgba(255,255,255,0.05);
      }
    `;
		document.head.appendChild(style);

		// Clean up
		return () => {
			document.head.removeChild(style);
		};
	}, []);

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
			} catch (error) {
				console.error('Error in fetchCities:', error);
			} finally {
				setLoading(false);
			}
		};

		fetchCities();
	}, []);

	// Create debounced search function
	const debouncedSearch = useCallback(
		debounce((query: string, city: string | null) => {
			console.log('Debounced search:', { query, city });
			onSearch(query, city);
		}, 300), // 300ms debounce time
		[onSearch]
	);

	// Handle city selection change
	const handleCityChange = (value: string) => {
		const newCity = value === 'all' ? null : value;
		setSelectedCity(newCity);

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

	// Function to get the translated city name for display
	const getTranslatedCity = (city: string | null) => {
		if (!city) return t('selectCity');
		try {
			return citiesT(city);
		} catch (error) {
			// If translation not found, return the original name
			return city;
		}
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

			{/* City Selector */}
			<div className="relative">
				<Select
					value={selectedCity || 'all'}
					onValueChange={handleCityChange}
					dir={isRtl ? 'rtl' : 'ltr'}>
					<SelectTrigger
						className={cn(
							'h-12 bg-card border-input shadow-sm flex items-center',
							isRtl ? 'flex-row-reverse text-right' : 'text-left'
						)}>
						<div className="flex items-center">
							<MapPin
								className={cn(
									'h-5 w-5 text-muted-foreground',
									isRtl ? 'ml-3' : 'mr-2'
								)}
							/>
							<SelectValue placeholder={t('selectCity')}>
								{getTranslatedCity(selectedCity)}
							</SelectValue>
						</div>
					</SelectTrigger>
					<SelectContent className="city-select-content">
						<SelectItem value="all">{t('allCities')}</SelectItem>
						{cities.map((city) => (
							<SelectItem key={city} value={city}>
								{getTranslatedCity(city)}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</div>
		</div>
	);
}
