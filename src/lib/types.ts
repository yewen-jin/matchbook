import { z } from 'zod';

export const LineItemSchema = z.object({
	description: z
		.string()
		.describe('What the line item covers, e.g. "DJ set", "day rate", "usage fee (12 months, UK digital)"'),
	qty: z
		.number()
		.int()
		.positive()
		.default(1)
		.describe('Quantity — almost always 1'),
	unit_amount: z
		.number()
		.nonnegative()
		.nullable()
		.describe(
			'Amount in the invoice currency. Must be null if not explicitly stated in the conversation — never infer.'
		),
	provenance: z
		.string()
		.describe('Short verbatim quote (under 15 words) from the conversation that justifies this line item'),
});

export const ExtractionSchema = z.object({
	client: z
		.string()
		.nullable()
		.describe(
			'Company or person to be invoiced — not Caslean. Use the full company name. Null if not determinable.'
		),
	client_confidence: z
		.enum(['high', 'medium', 'low'])
		.describe(
			'high = name clearly stated; medium = inferred from context; low = guessed or absent'
		),
	event_date: z
		.string()
		.nullable()
		.describe('Date of the work or event. ISO 8601 (YYYY-MM-DD) preferred. Null if unknown.'),
	line_items: z
		.array(LineItemSchema)
		.describe(
			'All billable items in the conversation. Include one entry per distinct fee, even if amount is unknown.'
		),
	currency: z.string().default('GBP').describe('Three-letter ISO currency code, defaults to GBP'),
	due_terms: z
		.string()
		.nullable()
		.describe(
			'Payment terms as stated, e.g. "14 days", "30 days", "end of month". Null if not mentioned.'
		),
	questions: z
		.array(z.string())
		.describe(
			'Specific, actionable questions that must be answered before a valid invoice can be drafted. Empty array if nothing is ambiguous.'
		),
	duplicate_suspects: z
		.array(z.string())
		.describe(
			'Evidence that this conversation may be re-confirming a booking already invoiced — quote the specific phrase (e.g. "as agreed", "just confirming").'
		),
});

export type LineItem = z.infer<typeof LineItemSchema>;
export type Extraction = z.infer<typeof ExtractionSchema>;

export interface AuditEntry {
	id: string;
	timestamp: string;
	action: 'extracted' | 'approved' | 'rejected' | 'written' | 'verified' | 'asked';
	summary: string;
	detail?: unknown;
}

export interface ContactMatch {
	contactId: string;
	name: string;
	email: string | null;
	confidence: 'exact' | 'high' | 'medium';
}

export interface ContactResolution {
	status: 'matched' | 'new';
	match?: ContactMatch;
	candidates: ContactMatch[];
}

export interface DuplicateCandidate {
	invoiceId: string;
	invoiceNumber: string;
	reference: string | null;
	date: string;
	total: number;
	status: string;
}

export interface Proposal {
	extraction: Extraction;
	contact: ContactResolution;
	duplicates: DuplicateCandidate[];
}

export interface WrittenInvoice {
	invoiceId: string;
	invoiceNumber: string;
	status: string;
	total: number;
	dueDate: string | null;
}

export interface WriteResult {
	contact: ContactMatch;
	contactWasCreated: boolean;
	invoice: WrittenInvoice;
	verified: WrittenInvoice;
}
