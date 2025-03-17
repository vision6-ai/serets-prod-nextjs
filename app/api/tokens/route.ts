import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

// Initialize Supabase admin client with service role key (bypasses RLS)
const supabaseAdmin = createClient(
	process.env.NEXT_PUBLIC_SUPABASE_URL!,
	process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: Request) {
	try {
		const { searchParams } = new URL(request.url);
		const accessCode = searchParams.get('accessCode');

		if (!accessCode) {
			return NextResponse.json(
				{ error: 'Access code is required' },
				{ status: 400 }
			);
		}

		// Query token from database
		const { data, error } = await supabaseAdmin
			.from('tokens')
			.select('token, expired_date')
			.eq('acces_code', accessCode)
			.order('expired_date', { ascending: false })
			.limit(1);

		if (error) {
			console.error('Error fetching token:', error);
			return NextResponse.json(
				{ error: 'Failed to fetch token', details: error.message },
				{ status: 500 }
			);
		}

		// If token exists, check if it's expired
		if (data && data.length > 0) {
			const tokenData = data[0];
			const expiryDate = new Date(tokenData.expired_date);
			const now = new Date();

			if (expiryDate > now) {
				// Token is valid
				return NextResponse.json({
					token: tokenData.token,
					valid: true,
					expires: tokenData.expired_date,
				});
			} else {
				// Token is expired
				return NextResponse.json({
					valid: false,
					reason: 'expired',
					expires: tokenData.expired_date,
				});
			}
		}

		// No token found
		return NextResponse.json({
			valid: false,
			reason: 'not_found',
		});
	} catch (error) {
		console.error('Server error:', error);
		return NextResponse.json({ error: 'Server error' }, { status: 500 });
	}
}

export async function POST(request: Request) {
	try {
		const { accessCode, token, expiryDate } = await request.json();

		if (!accessCode || !token || !expiryDate) {
			return NextResponse.json(
				{ error: 'Missing required fields' },
				{ status: 400 }
			);
		}

		// Check if token already exists
		const { data: existingData } = await supabaseAdmin
			.from('tokens')
			.select('id')
			.eq('acces_code', accessCode);

		let result;

		if (existingData && existingData.length > 0) {
			console.log('Updating existing token for access code:', accessCode);
			result = await supabaseAdmin
				.from('tokens')
				.update({
					token: token,
					expired_date: expiryDate,
				})
				.eq('acces_code', accessCode)
				.select();
		} else {
			// Insert new token
			console.log('Inserting new token for access code:', accessCode);
			result = await supabaseAdmin
				.from('tokens')
				.insert({
					acces_code: accessCode,
					token: token,
					expired_date: expiryDate,
				})
				.select();
		}

		if (result.error) {
			console.error('Error storing token:', result.error);
			return NextResponse.json(
				{ error: 'Failed to store token', details: result.error.message },
				{ status: 500 }
			);
		}

		return NextResponse.json({ success: true, data: result.data });
	} catch (error) {
		console.error('Server error:', error);
		return NextResponse.json({ error: 'Server error' }, { status: 500 });
	}
}
