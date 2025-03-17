import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client (only used for reading)
const supabase = createClient(
	process.env.NEXT_PUBLIC_SUPABASE_URL!,
	process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface TokenResponse {
	token: string;
	message: string;
	status: number;
	user: {
		sessionId: number;
		uniqueId: number;
		userId: number;
		saleChannelCode: string;
	};
}

export class TokenService {
	private static instance: TokenService;

	private constructor() {
		console.log('TokenService: Initializing service');
	}

	public static getInstance(): TokenService {
		if (!TokenService.instance) {
			TokenService.instance = new TokenService();
			console.log('TokenService: Created new instance');
		}
		return TokenService.instance;
	}

	/**
	 * Get token using access code
	 */
	private async fetchToken(accessCode: string): Promise<TokenResponse> {
		console.log('TokenService: Fetching token for access code:', accessCode);

		try {
			const response = await fetch(
				'https://pub-api.biggerpicture.ai/mapiAPI/login',
				{
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
					},
					body: JSON.stringify({
						username: 'MAPI1',
						password: 'MAPI132',
						accessCode,
					}),
				}
			);

			console.log('TokenService: API response status:', response.status);

			if (!response.ok) {
				const errorText = await response.text();
				console.error('TokenService: API error response:', errorText);
				throw new Error(
					`Failed to fetch token: ${response.status} ${errorText}`
				);
			}

			const data = await response.json();
			return data;
		} catch (error) {
			console.error('TokenService: Error in fetchToken:', error);
			throw error;
		}
	}

	/**
	 * Store token in database via API
	 */
	private async storeToken(
		accessCode: string,
		token: string,
		expiryDate: string
	): Promise<void> {
		console.log('TokenService: Storing token via API');

		try {
			const response = await fetch('/api/tokens', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					accessCode,
					token,
					expiryDate,
				}),
			});

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(
					`Failed to store token: ${response.status} ${JSON.stringify(
						errorData
					)}`
				);
			}

			console.log('TokenService: Successfully stored token via API');
		} catch (error) {
			console.error('TokenService: Error storing token:', error);
			throw error;
		}
	}

	/**
	 * Get and store token using access code
	 */
	public async getAndStoreToken(accessCode: string): Promise<string> {
		console.log(
			'TokenService: Getting and storing new token for access code:',
			accessCode
		);

		try {
			// Fetch new token
			const response = await this.fetchToken(accessCode);
			console.log('TokenService: Received new token');

			// Calculate expiry date (1 month from now)
			const expiryDate = new Date();
			expiryDate.setMonth(expiryDate.getMonth() + 1);
			const expiryDateString = expiryDate.toISOString();

			console.log('TokenService: Calculated expiry date:', expiryDateString);

			// Store token in database via API
			await this.storeToken(accessCode, response.token, expiryDateString);
			console.log('TokenService: Successfully stored new token');

			return response.token;
		} catch (error) {
			console.error('TokenService: Error in getAndStoreToken:', error);
			throw error;
		}
	}

	/**
	 * Get stored token from API
	 */
	private async getStoredToken(accessCode: string): Promise<string | null> {
		console.log('TokenService: Checking for stored token via API');

		try {
			const response = await fetch(
				`/api/tokens?accessCode=${encodeURIComponent(accessCode)}`
			);

			if (!response.ok) {
				console.error(
					'TokenService: Error fetching stored token:',
					response.status
				);
				return null;
			}

			const data = await response.json();

			if (data.valid && data.token) {
				console.log(
					'TokenService: Found valid stored token, expires:',
					new Date(data.expires)
				);
				return data.token;
			}

			if (data.valid === false) {
				console.log(
					`TokenService: Token not valid, reason: ${data.reason || 'unknown'}`
				);
			}

			return null;
		} catch (error) {
			console.error('TokenService: Error checking stored token:', error);
			return null;
		}
	}

	/**
	 * Get valid token (either stored or new)
	 */
	public async getValidToken(accessCode: string): Promise<string> {
		console.log(
			'TokenService: Getting valid token for access code:',
			accessCode
		);

		try {
			// First try to get a stored token
			const storedToken = await this.getStoredToken(accessCode);

			if (storedToken) {
				console.log('TokenService: Using stored token');
				return storedToken;
			}

			console.log(
				'TokenService: No valid stored token found, fetching new one'
			);
			// If no valid stored token, get a new one
			return this.getAndStoreToken(accessCode);
		} catch (error) {
			console.error('TokenService: Error getting valid token:', error);
			throw error;
		}
	}
}

// Export singleton instance
export const tokenService = TokenService.getInstance();
