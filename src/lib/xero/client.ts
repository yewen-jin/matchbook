import { env } from '$env/dynamic/private';

const XERO_CLIENT_ID = env.XERO_CLIENT_ID;
const XERO_CLIENT_SECRET = env.XERO_CLIENT_SECRET;
const XERO_SCOPES = env.XERO_SCOPES;

const TOKEN_URL = 'https://identity.xero.com/connect/token';
const CONNECTIONS_URL = 'https://api.xero.com/connections';
const API_BASE = 'https://api.xero.com/api.xro/2.0';

interface CachedAuth {
	accessToken: string;
	tenantId: string;
	expiresAt: number;
}

let cached: CachedAuth | null = null;

async function fetchToken(): Promise<{ accessToken: string; expiresIn: number }> {
	const basicAuth = Buffer.from(`${XERO_CLIENT_ID}:${XERO_CLIENT_SECRET}`).toString('base64');
	const res = await fetch(TOKEN_URL, {
		method: 'POST',
		headers: {
			Authorization: `Basic ${basicAuth}`,
			'Content-Type': 'application/x-www-form-urlencoded',
		},
		body: new URLSearchParams({ grant_type: 'client_credentials', scope: XERO_SCOPES }),
	});
	const body = await res.json();
	if (!res.ok || !body.access_token) {
		throw new Error(`Xero token request failed: ${JSON.stringify(body)}`);
	}
	return { accessToken: body.access_token, expiresIn: body.expires_in };
}

async function fetchTenantId(accessToken: string): Promise<string> {
	const res = await fetch(CONNECTIONS_URL, {
		headers: { Authorization: `Bearer ${accessToken}` },
	});
	const connections = await res.json();
	if (!res.ok || !Array.isArray(connections) || connections.length === 0) {
		throw new Error(`Xero tenant discovery failed: ${JSON.stringify(connections)}`);
	}
	return connections[0].tenantId;
}

async function getAuth(): Promise<CachedAuth> {
	if (cached && cached.expiresAt > Date.now() + 60_000) {
		return cached;
	}
	const { accessToken, expiresIn } = await fetchToken();
	const tenantId = await fetchTenantId(accessToken);
	cached = { accessToken, tenantId, expiresAt: Date.now() + expiresIn * 1000 };
	return cached;
}

export async function xeroFetch(path: string, options: RequestInit = {}): Promise<unknown> {
	const auth = await getAuth();
	const res = await fetch(`${API_BASE}${path}`, {
		...options,
		headers: {
			...options.headers,
			Authorization: `Bearer ${auth.accessToken}`,
			'Xero-Tenant-Id': auth.tenantId,
			Accept: 'application/json',
			...(options.body ? { 'Content-Type': 'application/json' } : {}),
		},
	});
	const body = await res.json();
	if (!res.ok) {
		throw new Error(`Xero API error (${res.status}) on ${path}: ${JSON.stringify(body)}`);
	}
	return body;
}
