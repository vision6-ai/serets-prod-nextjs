#!/usr/bin/env node

/**
 * Test CountIt API Key
 *
 * This script tests the CountIt API key to verify it's working correctly.
 */

require('dotenv').config();

const https = require('https');

// Configuration
const SHOWTIMES_API_URL =
	'https://admin.countit.online/api/v2/getview/showtimes_webSite/5000/ISRAEL';
const API_KEY = process.env.SHOWTIMES_API_KEY;

console.log('🔑 CountIt API Key Test');
console.log('='.repeat(50));

// Check if API key is set
if (!API_KEY) {
	console.error('❌ SHOWTIMES_API_KEY environment variable is not set');
	console.log('\n📝 To fix this:');
	console.log('1. Check your .env file');
	console.log('2. Make sure SHOWTIMES_API_KEY is defined');
	console.log('3. Restart your development server');
	process.exit(1);
}

// Display API key info (masked)
console.log(`✅ API Key Present: ${API_KEY.length} characters`);
console.log(
	`🔐 API Key (masked): ${API_KEY.substring(0, 8)}...${API_KEY.substring(
		API_KEY.length - 4
	)}`
);

// Test the API
const fullUrl = `${SHOWTIMES_API_URL}?key=${API_KEY}`;

console.log(`\n🌐 Testing URL: ${SHOWTIMES_API_URL}`);
console.log(`📡 Full URL: ${SHOWTIMES_API_URL}?key=***MASKED***`);

console.log('\n🚀 Making API request...');

https
	.get(fullUrl, (res) => {
		console.log(`\n📊 Response Status: ${res.statusCode} ${res.statusMessage}`);
		console.log('📋 Response Headers:');
		Object.entries(res.headers).forEach(([key, value]) => {
			console.log(`   ${key}: ${value}`);
		});

		let data = '';
		res.on('data', (chunk) => {
			data += chunk;
		});

		res.on('end', () => {
			console.log('\n📦 Response Body:');

			if (res.statusCode === 200) {
				try {
					const json = JSON.parse(data);
					console.log('✅ Valid JSON response received');
					console.log(`📈 Data type: ${typeof json.data}`);
					if (Array.isArray(json.data)) {
						console.log(`📊 Number of records: ${json.data.length}`);
						if (json.data.length > 0) {
							console.log('🎬 Sample record keys:', Object.keys(json.data[0]));
						}
					} else {
						console.log('⚠️  Data is not an array:', typeof json.data);
					}

					console.log('\n✅ API key is working correctly!');
				} catch (error) {
					console.error('❌ Failed to parse JSON response:', error.message);
					console.log('Raw response:', data.substring(0, 500));
				}
			} else {
				console.log('❌ API Error Response:');
				console.log(data);

				if (res.statusCode === 401) {
					console.log('\n🔑 Authentication Error - Possible causes:');
					console.log('1. API key is expired');
					console.log('2. API key is invalid');
					console.log('3. API key format has changed');
					console.log('4. API endpoint requires different authentication');
					console.log('\n💡 Contact CountIt support to verify your API key');
				}
			}
		});
	})
	.on('error', (error) => {
		console.error('❌ Network Error:', error.message);
	});
