import fs from 'fs';
import path from 'path';

const LOG_DIR = path.join(process.cwd(), 'logs');
const LOG_FILE = path.join(LOG_DIR, 'movieshows.log');

// Ensure log directory exists only in development
if (process.env.NODE_ENV === 'development' && !fs.existsSync(LOG_DIR)) {
	fs.mkdirSync(LOG_DIR, { recursive: true });
}

type LogLevel = 'INFO' | 'ERROR' | 'WARNING' | 'DEBUG';

interface LogEntry {
	timestamp: string;
	level: LogLevel;
	action: string;
	data?: any;
	error?: string;
}

export const logger = {
	log: (level: LogLevel, action: string, data?: any, error?: Error) => {
		const entry: LogEntry = {
			timestamp: new Date().toISOString(),
			level,
			action,
			data,
			error: error?.message,
		};

		const logLine = JSON.stringify(entry) + '\n';

		// Write to file only in development
		if (process.env.NODE_ENV === 'development') {
			fs.appendFileSync(LOG_FILE, logLine);
		}

		// Always console log in production and development
		if (level === 'ERROR') {
			console.error(
				`[${entry.level}] ${entry.action}:`,
				entry.data || '',
				error || ''
			);
		} else if (level === 'WARNING') {
			console.warn(
				`[${entry.level}] ${entry.action}:`,
				entry.data || '',
				error || ''
			);
		} else {
			console.log(
				`[${entry.level}] ${entry.action}:`,
				entry.data || '',
				error || ''
			);
		}
	},

	info: (action: string, data?: any) => {
		logger.log('INFO', action, data);
	},

	error: (action: string, error: Error, data?: any) => {
		logger.log('ERROR', action, data, error);
	},

	warning: (action: string, data?: any) => {
		logger.log('WARNING', action, data);
	},

	debug: (action: string, data?: any) => {
		// Debug logs only in development
		if (process.env.NODE_ENV === 'development') {
			logger.log('DEBUG', action, data);
		}
	},
};
