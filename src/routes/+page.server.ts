import { fail } from '@sveltejs/kit';
import type { Actions } from './$types';
import { ANTHROPIC_API_KEY } from '$env/static/private';
import { extractFromConversation } from '$lib/agent/extract';
import { ExtractionSchema, type Proposal } from '$lib/types';
import { resolveContact } from '$lib/xero/contacts';
import { findDuplicateCandidates } from '$lib/xero/invoices';

export const actions = {
	extract: async ({ request }) => {
		const data = await request.formData();
		const conversation = data.get('conversation')?.toString().trim() ?? '';

		if (!conversation) {
			return fail(400, { error: 'Please paste a conversation first.' });
		}

		if (!ANTHROPIC_API_KEY) {
			return fail(500, { error: 'ANTHROPIC_API_KEY is not set — add it to .env and restart the dev server.' });
		}

		const today = new Date().toISOString().slice(0, 10);

		try {
			const extraction = await extractFromConversation(conversation, ANTHROPIC_API_KEY, today);
			return { extraction, conversation };
		} catch (err) {
			const message = err instanceof Error ? err.message : String(err);
			return fail(500, { error: `Extraction failed: ${message}` });
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
} satisfies Actions;
