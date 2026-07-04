import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';
import { XERO_CLIENT_ID, XERO_CLIENT_SECRET, XERO_REDIRECT_URI } from '$env/static/private';

export const load: PageServerLoad = async ({ url }) => {
	const code = url.searchParams.get('code');
	if (!code) throw error(400, 'No authorisation code in callback URL');

	// Exchange code for token
	const tokenRes = await fetch('https://identity.xero.com/connect/token', {
		method: 'POST',
		headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
		body: new URLSearchParams({
			grant_type: 'authorization_code',
			code,
			redirect_uri: XERO_REDIRECT_URI,
			client_id: XERO_CLIENT_ID,
			client_secret: XERO_CLIENT_SECRET
		})
	});
	const token = await tokenRes.json();
	if (!token.access_token) throw error(500, `Token exchange failed: ${JSON.stringify(token)}`);

	// Get tenant ID
	const connectionsRes = await fetch('https://api.xero.com/connections', {
		headers: { Authorization: `Bearer ${token.access_token}` }
	});
	const connections = await connectionsRes.json();

	return { connections, access_token: token.access_token };
};
