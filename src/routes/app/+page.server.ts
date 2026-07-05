import { fail } from '@sveltejs/kit';
import type { Actions } from './$types';
import { env } from '$env/dynamic/private';
import { extractFromConversation } from '$lib/agent/extract';
import { ExtractionSchema, type ContactMatch, type Proposal, type WriteResult } from '$lib/types';
import { resolveContact, createContact } from '$lib/xero/contacts';
import { findDuplicateCandidates, createInvoice, getInvoice, addInvoiceHistoryNote, computeDueDate } from '$lib/xero/invoices';
import { recordAudit } from '$lib/audit';

export const actions = {
	extract: async ({ request }) => {
		const data = await request.formData();
		const conversation = data.get('conversation')?.toString().trim() ?? '';

		if (!conversation) {
			return fail(400, { error: 'Please paste a conversation first.' });
		}

		if (!env.ANTHROPIC_API_KEY) {
			return fail(500, { error: 'ANTHROPIC_API_KEY is not set — add it to .env and restart the dev server.' });
		}

		const today = new Date().toISOString().slice(0, 10);

		try {
			const extraction = await extractFromConversation(conversation, env.ANTHROPIC_API_KEY, today);

			recordAudit(
				'extracted',
				`Extracted from pasted conversation — client: ${extraction.client ?? 'unknown'} (${extraction.client_confidence} confidence)`,
				{ conversation, extraction },
			);
			if (extraction.questions.length > 0) {
				recordAudit(
					'asked',
					`Asked ${extraction.questions.length} question(s) instead of guessing`,
					{ questions: extraction.questions },
				);
			}

			return { extraction, conversation };
		} catch (err) {
			const message = err instanceof Error ? err.message : String(err);
			return fail(500, { error: `Extraction failed: ${message}` });
		}
	},

	answer: async ({ request }) => {
		const data = await request.formData();
		const conversation = data.get('conversation')?.toString() ?? '';
		const questionsRaw = data.get('questions')?.toString();

		if (!conversation || !questionsRaw) {
			return fail(400, { error: 'Missing conversation or questions — try extracting again.' });
		}

		const questions: string[] = JSON.parse(questionsRaw);
		const answers = questions.map((_, i) => data.get(`answer_${i}`)?.toString().trim() ?? '');

		if (answers.some((a) => !a)) {
			return fail(400, { error: 'Please answer every question before continuing.' });
		}

		if (!env.ANTHROPIC_API_KEY) {
			return fail(500, { error: 'ANTHROPIC_API_KEY is not set — add it to .env and restart the dev server.' });
		}

		const clarification = questions.map((q, i) => `Q: ${q}\nA: ${answers[i]}`).join('\n');
		const augmentedConversation = `${conversation}\n\n[Clarification from Caslean]\n${clarification}`;
		const today = new Date().toISOString().slice(0, 10);

		try {
			const extraction = await extractFromConversation(augmentedConversation, env.ANTHROPIC_API_KEY, today);

			recordAudit(
				'extracted',
				`Re-extracted after answering ${questions.length} question(s) — client: ${extraction.client ?? 'unknown'}`,
				{ conversation: augmentedConversation, extraction, previousQuestions: questions, answers },
			);
			if (extraction.questions.length > 0) {
				recordAudit(
					'asked',
					`Still asked ${extraction.questions.length} question(s) after clarification`,
					{ questions: extraction.questions },
				);
			}

			return { extraction, conversation: augmentedConversation };
		} catch (err) {
			const message = err instanceof Error ? err.message : String(err);
			return fail(500, { error: `Re-extraction failed: ${message}` });
		}
	},

	resolve: async ({ request }) => {
		const data = await request.formData();
		const conversation = data.get('conversation')?.toString() ?? '';
		const raw = data.get('extraction')?.toString();

		if (!raw) {
			return fail(400, { error: 'Missing extraction data — try extracting again.' });
		}

		const parsed = ExtractionSchema.safeParse(JSON.parse(raw));
		if (!parsed.success) {
			return fail(400, { error: `Extraction data failed validation: ${parsed.error.message}` });
		}
		const extraction = parsed.data;

		try {
			const contact = await resolveContact(extraction.client);
			const total = extraction.line_items.every((i) => i.unit_amount !== null)
				? extraction.line_items.reduce((sum, i) => sum + (i.unit_amount ?? 0) * i.qty, 0)
				: null;
			const duplicates = contact.match
				? await findDuplicateCandidates(contact.match.contactId, extraction.event_date, total)
				: [];

			const proposal: Proposal = { extraction, contact, duplicates };
			return { extraction, conversation, proposal };
		} catch (err) {
			const message = err instanceof Error ? err.message : String(err);
			return fail(500, { error: `Xero resolution failed: ${message}` });
		}
	},

	approve: async ({ request }) => {
		const data = await request.formData();
		const raw = data.get('proposal')?.toString();

		if (!raw) {
			return fail(400, { error: 'Missing proposal data — try resolving again.' });
		}

		const proposal = JSON.parse(raw) as Proposal;
		const parsed = ExtractionSchema.safeParse(proposal.extraction);
		if (!parsed.success) {
			return fail(400, { error: `Proposal data failed validation: ${parsed.error.message}` });
		}
		const extraction = parsed.data;

		if (extraction.questions.length > 0) {
			return fail(400, {
				error: 'Cannot approve — unanswered questions remain. Resolve them before writing to Xero.',
			});
		}

		try {
			let contact: ContactMatch;
			let contactWasCreated = false;

			if (proposal.contact.status === 'matched' && proposal.contact.match) {
				contact = proposal.contact.match;
			} else {
				if (!extraction.client) {
					return fail(400, { error: 'Cannot create a contact without a client name.' });
				}
				contact = await createContact(extraction.client);
				contactWasCreated = true;
			}

			const dueDate = computeDueDate(extraction.event_date, extraction.due_terms);
			const reference = `${extraction.client ?? 'Unknown client'} — ${extraction.event_date ?? 'date TBC'}`;

			const invoice = await createInvoice(
				contact.contactId,
				extraction.event_date,
				dueDate,
				extraction.line_items,
				reference,
			);

			const reasoning = [
				'Extracted by Matchbook from a pasted conversation.',
				`Client confidence: ${extraction.client_confidence}.`,
				...extraction.line_items.map((i) => `"${i.description}" from: "${i.provenance}"`),
				extraction.duplicate_suspects.length > 0
					? `Duplicate suspects flagged: ${extraction.duplicate_suspects.join('; ')}`
					: null,
			]
				.filter(Boolean)
				.join(' ');

			await addInvoiceHistoryNote(invoice.invoiceId, reasoning);
			const verified = await getInvoice(invoice.invoiceId);

			recordAudit(
				'approved',
				`Approved: ${extraction.client ?? 'unknown client'} — ${currencyTotal(extraction)} on ${extraction.event_date ?? 'unknown date'}`,
				{ extraction },
			);
			recordAudit(
				'written',
				`Created invoice ${invoice.invoiceNumber} (${contactWasCreated ? 'new' : 'existing'} contact: ${contact.name})`,
				{ contactId: contact.contactId, invoiceId: invoice.invoiceId, invoiceNumber: invoice.invoiceNumber },
			);
			recordAudit(
				'verified',
				`Verified invoice ${verified.invoiceNumber} — status ${verified.status}, total ${currencyTotal(extraction)}`,
				{ invoiceId: verified.invoiceId, status: verified.status, total: verified.total },
			);

			const result: WriteResult = { contact, contactWasCreated, invoice, verified };
			return { extraction, proposal, result };
		} catch (err) {
			const message = err instanceof Error ? err.message : String(err);
			return fail(500, { error: `Write to Xero failed: ${message}` });
		}
	},

	reject: async ({ request }) => {
		const data = await request.formData();
		const raw = data.get('proposal')?.toString();
		const reason = data.get('reason')?.toString().trim() || 'No reason given';

		if (!raw) {
			return fail(400, { error: 'Missing proposal data.' });
		}

		const proposal = JSON.parse(raw) as Proposal;
		const parsed = ExtractionSchema.safeParse(proposal.extraction);
		const extraction = parsed.success ? parsed.data : proposal.extraction;

		recordAudit(
			'rejected',
			`Rejected: ${extraction.client ?? 'unknown client'} — ${reason}`,
			{ extraction, reason },
		);

		return { rejected: true };
	},
} satisfies Actions;

function currencyTotal(extraction: { currency: string; line_items: { unit_amount: number | null; qty: number }[] }) {
	const total = extraction.line_items.reduce((sum, i) => sum + (i.unit_amount ?? 0) * i.qty, 0);
	return `${extraction.currency} ${total.toFixed(2)}`;
}
