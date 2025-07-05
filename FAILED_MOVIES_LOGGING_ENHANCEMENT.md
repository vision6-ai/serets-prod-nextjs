# Failed Movies Logging Enhancement

## Overview

This document describes the enhancements made to the movieshows sync system to provide comprehensive logging for all failed movies when fetching from the CountIt API.

## Changes Made

### 1. Enhanced Sync Route (`app/api/movieshows/sync/route.ts`)

#### Added Comprehensive Logging for Different Failure Types

**Skipped Movies (Validation Failures)**
- Individual logging for each skipped movie with detailed reasons
- Summary breakdown of skipped movies by reason type
- Enhanced metadata with movie details and failure reasons

**Failed Insertions (Database Failures)**
- Detailed logging for each batch insertion failure
- Individual movie logging with complete movie details (cinema, city, day, time)
- Persistent database logging of failed movies for long-term tracking
- Enhanced error details including error codes and messages

**Total Failed Movies Summary**
- Combined tracking of all failure types
- Failure rate calculation as percentage
- Top 10 failing movies analysis
- Comprehensive failed movies breakdown by type

#### Enhanced Final Summary

- Added `totalFailedMovies` count
- Added `failureBreakdown` with detailed analysis
- Added `failureRate` percentage calculation
- Separated `failedMovies` (insertion failures) and `skippedMovies` (validation failures)
- Enhanced metadata structure for better analysis

### 2. Enhanced Status Endpoint (`app/api/movieshows/status/route.ts`)

#### New Features

**Query Parameters:**
- `includeFailedMovies=true` - Include failed movies in the response
- `limit=N` - Number of recent operations to analyze (default: 10)

**Response Data:**
- Recent sync operations summary
- Failed movies logs with detailed breakdown
- Total failed movies count across all operations
- Processing times and performance metrics

**Sample Usage:**
```bash
# Get status with failed movies
curl "http://localhost:3000/api/movieshows/status?includeFailedMovies=true&limit=5"

# Get basic status only
curl "http://localhost:3000/api/movieshows/status"
```

### 3. Monitoring Script (`scripts/monitor-failed-movies.js`)

#### New Executable Script

**Features:**
- Fetches and analyzes failed movies from recent sync operations
- Provides detailed failure analysis by type and reason
- Identifies top failing movies and patterns
- Exports data in multiple formats (JSON, CSV)
- Interactive command-line interface

**Usage:**
```bash
# Basic analysis
node scripts/monitor-failed-movies.js

# Analyze more operations
node scripts/monitor-failed-movies.js --limit=20

# Analysis without file export
node scripts/monitor-failed-movies.js --no-export

# Help
node scripts/monitor-failed-movies.js --help
```

**Output:**
- Console analysis with failure breakdown
- Raw data export (JSON)
- Analysis export (JSON)
- CSV export for spreadsheet analysis
- Files saved to `logs/failed-movies/` directory

## Logging Categories

### 1. Validation Failures (Skipped Records)
- **Missing MoviePID**: Movies without valid movie identifier
- **MoviePID not found in movies table**: Foreign key constraint violations
- **Duplicate showtime_pid**: Duplicate showtime identifiers in the same batch

### 2. Database Insertion Failures
- **Batch insertion errors**: Database constraint violations
- **Network errors**: Connection issues during insertion
- **Data type errors**: Invalid data format errors

### 3. Existing Records
- **Already exists**: Movies that already exist in the database
- Not counted as failures but logged for transparency

## Enhanced Logging Structure

### Individual Movie Failure Log
```json
{
  "moviepid": 12345,
  "movie_name": "Example Movie",
  "showtime_pid": 67890,
  "failureType": "VALIDATION_FAILURE|INSERTION_FAILURE",
  "failureReason": "Specific reason for failure",
  "cinema": "Example Cinema",
  "city": "Example City",
  "day": "2024-01-15",
  "time": "20:00:00",
  "traceId": "sync-12345-abc123",
  "timestamp": "2024-01-15T18:00:00Z"
}
```

### Failure Summary Log
```json
{
  "summary": {
    "totalFailed": 150,
    "insertionFailures": 50,
    "validationFailures": 100
  },
  "failureBreakdown": {
    "insertionFailures": 50,
    "validationFailures": 100,
    "totalFailures": 150,
    "failureRate": "15.5%"
  },
  "allFailedMovies": [...],
  "traceId": "sync-12345-abc123"
}
```

## Database Tables Used

### `logs` Table
- **level**: 'info', 'warn', 'error'
- **message**: Human-readable log message
- **metadata**: JSON object with detailed failure information
- **created_at**: Timestamp of the log entry

## Usage Examples

### 1. Trigger a Sync Operation
```bash
curl -X POST http://localhost:3000/api/movieshows/sync
```

### 2. Check Status and Failed Movies
```bash
curl "http://localhost:3000/api/movieshows/status?includeFailedMovies=true&limit=10"
```

### 3. Monitor Failed Movies
```bash
node scripts/monitor-failed-movies.js --limit=20
```

### 4. Query Database Directly
```sql
-- Get recent failed movies logs
SELECT * FROM logs 
WHERE level = 'error' 
AND (message ILIKE '%failed movies%' OR message ILIKE '%batch insertion failed%')
ORDER BY created_at DESC 
LIMIT 10;

-- Get sync operation summaries
SELECT * FROM logs 
WHERE level = 'info' 
AND message ILIKE '%Operation completed: movieshows_sync%'
ORDER BY created_at DESC 
LIMIT 10;
```

## Benefits

1. **Comprehensive Tracking**: All failure types are now logged with detailed information
2. **Pattern Analysis**: Identify recurring failures and problematic movies
3. **Performance Monitoring**: Track failure rates and processing times
4. **Data Export**: Export failure data for external analysis
5. **Real-time Monitoring**: Monitor failures as they happen
6. **Historical Analysis**: Persistent storage of failure data for long-term analysis

## Monitoring Recommendations

1. **Regular Monitoring**: Run the monitoring script after each sync operation
2. **Failure Rate Tracking**: Monitor failure rates over time to identify trends
3. **Movie-specific Issues**: Identify movies that consistently fail and investigate
4. **Database Maintenance**: Regular cleanup of old log entries
5. **Alert Setup**: Set up alerts for high failure rates or specific error patterns

## File Locations

- **Main sync logic**: `app/api/movieshows/sync/route.ts`
- **Status endpoint**: `app/api/movieshows/status/route.ts`
- **Monitoring script**: `scripts/monitor-failed-movies.js`
- **Logger utilities**: `app/utils/logger.ts`
- **Log exports**: `logs/failed-movies/`

## Next Steps

1. **Set up monitoring cron job** to run the monitoring script regularly
2. **Implement alerting** for high failure rates
3. **Add dashboard visualization** for failure trends
4. **Optimize sync process** based on failure patterns identified
5. **Add retry mechanisms** for transient failures 