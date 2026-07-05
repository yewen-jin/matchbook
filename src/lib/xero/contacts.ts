import { xeroFetch } from './client';
import type { ContactMatch, ContactResolution } from '$lib/types';

interface XeroContact {
	ContactID: string;
	Name: string;
	EmailAddress?: string;
	ContactStatus: string;
}

const ORG_SUFFIXES = /\b(ltd|limited|llc|inc|plc|llp|co)\b\.?/g;

function normalise(name: string): string {
	return name
		.toLowerCase()
		.replace(ORG_SUFFIXES, '')
		.replace(/[^a-z0-9\s]/g, '')
		.replace(/\s+/g, ' ')
		.trim();
}

function tokenOverlap(a: string, b: string): number {
	const setA = new Set(a.split(' ').filter(Boolean));
	const setB = new Set(b.split(' ').filter(Boolean));
	if (setA.size === 0 || setB.size === 0) return 0;
	let shared = 0;
	for (const token of setA) if (setB.has(token)) shared++;
	return shared / Math.max(setA.size, setB.size);
}

export async function listActiveContacts(): Promise<XeroContact[]> {
	const body = (await xeroFetch('/Contacts')) as { Contacts: XeroContact[] };
	return body.Contacts.filter((c) => c.ContactStatus === 'ACTIVE');
}

export async function resolveContact(clientName: string | null): Promise<ContactResolution> {
	if (!clientName) {
		return { status: 'new', candidates: [] };
	}

	const contacts = await listActiveContacts();
	const normalisedClient = normalise(clientName);

	const candidates: ContactMatch[] = [];
	for (const contact of contacts) {
		const normalisedContact = normalise(contact.Name);
		let confidence: ContactMatch['confidence'] | null = null;

		if (normalisedContact === normalisedClient) {
			confidence = 'exact';
		} else if (
			normalisedContact.includes(normalisedClient) ||
			normalisedClient.includes(normalisedContact)
		) {
			confidence = 'high';
		} else if (tokenOverlap(normalisedContact, normalisedClient) >= 0.5) {
			confidence = 'medium';
		}

		if (confidence) {
			candidates.push({
				contactId: contact.ContactID,
				name: contact.Name,
				email: contact.EmailAddress ?? null,
				confidence,
			});
		}
	}

	const rank = { exact: 0, high: 1, medium: 2 };
	candidates.sort((a, b) => rank[a.confidence] - rank[b.confidence]);

	if (candidates.length === 0) {
		return { status: 'new', candidates: [] };
	}

	return { status: 'matched', match: candidates[0], candidates };
}
