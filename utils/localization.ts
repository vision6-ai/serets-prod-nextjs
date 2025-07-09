/**
 * Helper function to get localized field based on locale
 * @param enField - English field value
 * @param heField - Hebrew field value
 * @param locale - Current locale ('en' or 'he')
 * @returns The appropriate localized field value
 */
export function getLocalizedField(
	enField: string | null | undefined,
	heField: string | null | undefined,
	locale: string
): string | null {
	if (locale === 'he' && heField) return heField;
	return enField || heField || null;
}

/**
 * Helper function to format TMDB image URL
 * @param path - Relative TMDB image path
 * @returns Full TMDB image URL or null if path is invalid
 */
export function formatTmdbImageUrl(path: string | null | undefined): string | null {
	if (!path) return null;
	if (path.startsWith('http')) return path; // Already a full URL
	return `https://media.themoviedb.org/t/p/w600_and_h900_bestv2${path}`;
}