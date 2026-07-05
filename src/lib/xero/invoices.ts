import { xeroFetch } from './client';
import type { DuplicateCandidate, LineItem, WrittenInvoice } from '$lib/types';

const SALES_ACCOUNT_CODE = '200';
const SALES_TAX_TYPE = 'OUTPUT2';

interface XeroInvoice {
	InvoiceID: string;
	InvoiceNumber: string;
	Reference?: string;
	Contact: { ContactID: string; Name: string };
	DateString: string;
	DueDateString?: string;
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

function toWrittenInvoice(inv: XeroInvoice): WrittenInvoice {
	return {
		invoiceId: inv.InvoiceID,
		invoiceNumber: inv.InvoiceNumber,
		status: inv.Status,
		total: inv.Total,
		dueDate: inv.DueDateString?.slice(0, 10) ?? null,
	};
}

/** Parses free-text payment terms ("14 days", "30 days", "end of month") into an ISO due date. */
export function computeDueDate(eventDate: string | null, dueTerms: string | null): string | null {
	if (!eventDate || !dueTerms) return null;
	const start = new Date(eventDate);
	if (isNaN(start.getTime())) return null;

	// UTC-only arithmetic throughout — local-time Date methods shift the
	// calendar date whenever the server's timezone offset is non-zero.
	const daysMatch = dueTerms.match(/(\d+)\s*day/i);
	if (daysMatch) {
		const due = new Date(
			Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), start.getUTCDate() + parseInt(daysMatch[1], 10)),
		);
		return due.toISOString().slice(0, 10);
	}

	if (/end of month/i.test(dueTerms)) {
		const due = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth() + 1, 0));
		return due.toISOString().slice(0, 10);
	}

	return null;
}

export async function createInvoice(
	contactId: string,
	eventDate: string | null,
	dueDate: string | null,
	lineItems: LineItem[],
	reference: string,
): Promise<WrittenInvoice> {
	const body = (await xeroFetch('/Invoices', {
		method: 'PUT',
		body: JSON.stringify({
			Invoices: [
				{
					Type: 'ACCREC',
					Contact: { ContactID: contactId },
					Date: eventDate ?? undefined,
					DueDate: dueDate ?? undefined,
					Reference: reference,
					Status: 'DRAFT',
					LineItems: lineItems.map((item) => ({
						Description: item.description,
						Quantity: item.qty,
						UnitAmount: item.unit_amount,
						AccountCode: SALES_ACCOUNT_CODE,
						TaxType: SALES_TAX_TYPE,
					})),
				},
			],
		}),
	})) as { Invoices: XeroInvoice[] };
	return toWrittenInvoice(body.Invoices[0]);
}

export async function getInvoice(invoiceId: string): Promise<WrittenInvoice> {
	const body = (await xeroFetch(`/Invoices/${invoiceId}`)) as { Invoices: XeroInvoice[] };
	return toWrittenInvoice(body.Invoices[0]);
}

export async function addInvoiceHistoryNote(invoiceId: string, note: string): Promise<void> {
	await xeroFetch(`/Invoices/${invoiceId}/History`, {
		method: 'PUT',
		body: JSON.stringify({ HistoryRecords: [{ Details: note }] }),
	});
}
