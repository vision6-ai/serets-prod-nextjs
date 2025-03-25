import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseLogger = createClient(
	process.env.NEXT_PUBLIC_SUPABASE_URL!,
	process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Define log levels
type LogLevel = 'info' | 'warn' | 'error';

// Interface for metadata
interface LogMetadata {
	[key: string]: any;
}

/**
 * Logs a message to both console and Supabase logs table
 * @param level - Log level: 'info', 'warn', or 'error'
 * @param message - The log message
 * @param metadata - Optional metadata object
 * @returns Promise resolving to the log operation result
 */
export async function logger(
	level: LogLevel,
	message: string,
	metadata: LogMetadata = {}
) {
	// First, log to console
	const consoleMessage = `[${level.toUpperCase()}] ${message}`;

	switch (level) {
		case 'error':
			console.error(consoleMessage, metadata);
			break;
		case 'warn':
			console.warn(consoleMessage, metadata);
			break;
		default:
			console.log(consoleMessage, metadata);
	}

	try {
		// Then save to Supabase
		const { data, error } = await supabaseLogger
			.from('logs')
			.insert([{ level, message, metadata }]);

		if (error) {
			// If logging to Supabase fails, log to console but don't throw
			console.error('Failed to save log to Supabase:', error);
		}

		return { data, error };
	} catch (err) {
		// Catch any unexpected errors to prevent disrupting the application
		console.error('Unexpected error while logging to Supabase:', err);
		return { data: null, error: err };
	}
}

/**
 * Logs a message to console only (no database storage)
 * @param level - Log level: 'info', 'warn', or 'error'
 * @param message - The log message
 * @param metadata - Optional metadata object
 */
export function consoleLog(
	level: LogLevel,
	message: string,
	metadata: LogMetadata = {}
) {
	const consoleMessage = `[${level.toUpperCase()}] ${message}`;

	switch (level) {
		case 'error':
			console.error(consoleMessage, metadata);
			break;
		case 'warn':
			console.warn(consoleMessage, metadata);
			break;
		default:
			console.log(consoleMessage, metadata);
	}
}

/**
 * Saves the final sync result to the database
 * @param operationName - Name of the operation (e.g., 'movieshows_sync')
 * @param result - The complete result object to save
 * @returns Promise resolving to the log operation result
 */
export async function saveOperationLog(operationName: string, result: any) {
	try {
		const { data, error } = await supabaseLogger.from('logs').insert([
			{
				level: 'info',
				message: `Operation completed: ${operationName}`,
				metadata: result,
			},
		]);

		if (error) {
			console.error('Failed to save operation log to Supabase:', error);
		}

		return { data, error };
	} catch (err) {
		console.error('Unexpected error while saving operation log:', err);
		return { data: null, error: err };
	}
}

// Convenience methods for different log levels
export const logInfo = (message: string, metadata: LogMetadata = {}) =>
	logger('info', message, metadata);

export const logWarn = (message: string, metadata: LogMetadata = {}) =>
	logger('warn', message, metadata);

export const logError = (message: string, metadata: LogMetadata = {}) =>
	logger('error', message, metadata);

// Console-only logging methods
export const consoleInfo = (message: string, metadata: LogMetadata = {}) =>
	consoleLog('info', message, metadata);

export const consoleWarn = (message: string, metadata: LogMetadata = {}) =>
	consoleLog('warn', message, metadata);

export const consoleError = (message: string, metadata: LogMetadata = {}) =>
	consoleLog('error', message, metadata);
