import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// String utilities

/**
 * Converts a string to a URL-friendly slug
 * @param str The string to slugify
 * @returns A slugified string (lowercase, spaces replaced with hyphens, special chars removed)
 */
export function slugify(str: string): string {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/[\s_-]+/g, '-') // Replace spaces, underscores, and hyphens with a single hyphen
    .replace(/^-+|-+$/g, ''); // Remove leading and trailing hyphens
}

/**
 * Truncates a string to the specified length
 * @param str The string to truncate
 * @param length The maximum length
 * @param ending The ending to add (default: '...')
 * @returns The truncated string
 */
export function truncate(str: string, length: number, ending: string = '...'): string {
  if (str.length > length) {
    return str.substring(0, length - ending.length) + ending;
  }
  return str;
}

/**
 * Formats a date string in a localized format
 * @param dateString The date string to format
 * @param includeTime Whether to include the time (default: false)
 * @returns A formatted date string
 */
export function formatDate(dateString: string | null, includeTime: boolean = false): string {
  if (!dateString) return 'N/A';
  
  const date = new Date(dateString);
  
  if (includeTime) {
    return date.toLocaleString();
  } else {
    return date.toLocaleDateString();
  }
}

/**
 * Converts markdown to plain text
 * @param markdown The markdown string to convert
 * @returns Plain text without markdown syntax
 */
export function markdownToPlainText(markdown: string): string {
  return markdown
    .replace(/#{1,6}\s?([^\n]+)/g, '$1') // Remove headers
    .replace(/\*\*(.+?)\*\*/g, '$1') // Remove bold
    .replace(/\*(.+?)\*/g, '$1') // Remove italic
    .replace(/\[(.+?)\]\(.+?\)/g, '$1') // Remove links
    .replace(/\n/g, ' ') // Replace newlines with spaces
    .replace(/\s+/g, ' ') // Replace multiple spaces with a single space
    .trim();
}

/**
 * Calculates the estimated reading time for text
 * @param text The text to calculate reading time for
 * @param wordsPerMinute The average reading speed (default: 200 words per minute)
 * @returns The estimated reading time in minutes
 */
export function calculateReadingTime(text: string, wordsPerMinute: number = 200): number {
  const words = text.trim().split(/\s+/).length;
  const minutes = Math.ceil(words / wordsPerMinute);
  return Math.max(1, minutes); // At least 1 minute
}

/**
 * Generates a random string
 * @param length The length of the string to generate (default: 8)
 * @returns A random string
 */
export function generateRandomString(length: number = 8): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  return result;
}
