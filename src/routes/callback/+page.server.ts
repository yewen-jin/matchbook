import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';
import { XERO_CLIENT_ID, XERO_CLIENT_SECRET, XERO_REDIRECT_URI } from '$env/static/private';

export const load: PageServerLoad = async ({ url }) => {
	const code = url.searchParams.get('code');
	if (!code) throw error(400, 'No authorisation code in callback URL');

	// Basic auth header as required by Xero docs
	const basicAuth = Buffer.from(`${XERO_CLIENT_ID}:${XERO_CLIENT_SECRET}`).toString('base64');

	// Step 3: Exchange code for token
	const tokenRes = await fetch('https://identity.xero.com/connect/token', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded',
			Authorization: `Basic ${basicAuth}`
		},
		body: new URLSearchParams({
			grant_type: 'authorization_code',
			code,
			redirect_uri: XERO_REDIRECT_URI
		})
	});
	const token = await tokenRes.json();
	if (!token.access_token) throw error(500, `Token exchange failed: ${JSON.stringify(token)}`);

	// Step 5: Get connected tenants
	const connectionsRes = await fetch('https://api.xero.com/connections', {
		headers: { Authorization: `Bearer ${token.access_token}` }
	});
	const connections = await connectionsRes.json();

	return { connections };
};
