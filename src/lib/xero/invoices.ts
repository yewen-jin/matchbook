import { xeroFetch } from './client';
import type { DuplicateCandidate } from '$lib/types';

interface XeroInvoice {
	InvoiceID: string;
	InvoiceNumber: string;
	Reference?: string;
	Contact: { ContactID: string; Name: string };
	DateString: string;
	Total: number;
	Status: string;
}

const DATE_TOLERANCE_DAYS = 3;
const AMOUNT_TOLERANCE = 0.01;

function daysBetween(a: Date, b: Date): number {
	return Math.abs(a.getTime() - b.getTime()) / (1000 * 60 * 60 * 24);
}

export async function findDuplicateCandidates(
	contactId: string,
	eventDate: string | null,
	total: number | null,
): Promise<DuplicateCandidate[]> {
	if (!eventDate) return [];

	const body = (await xeroFetch('/Invoices')) as { Invoices: XeroInvoice[] };
	const target = new Date(eventDate);
	if (isNaN(target.getTime())) return [];

	return body.Invoices.filter((inv) => {
		if (inv.Contact.ContactID !== contactId) return false;
		if (inv.Status === 'VOIDED' || inv.Status === 'DELETED') return false;

		const invDate = new Date(inv.DateString);
		if (isNaN(invDate.getTime()) || daysBetween(invDate, target) > DATE_TOLERANCE_DAYS) {
			return false;
		}

		if (total !== null && Math.abs(inv.Total - total) > AMOUNT_TOLERANCE) {
			return false;
		}

		return true;
	}).map((inv) => ({
		invoiceId: inv.InvoiceID,
		invoiceNumber: inv.InvoiceNumber,
		reference: inv.Reference ?? null,
		date: inv.DateString,
		total: inv.Total,
		status: inv.Status,
	}));
}
