import fs from 'fs';
import path from 'path';

const LOG_DIR = path.join(process.cwd(), 'logs');
const LOG_FILE = path.join(LOG_DIR, 'movieshows.log');

// Ensure log directory exists
if (!fs.existsSync(LOG_DIR)) {
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

		// Append to log file
		fs.appendFileSync(LOG_FILE, logLine);

		// Also console log in development
		if (process.env.NODE_ENV === 'development') {
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
		if (process.env.NODE_ENV === 'development') {
			logger.log('DEBUG', action, data);
		}
	},
};
