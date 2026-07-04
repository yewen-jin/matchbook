import { fail } from '@sveltejs/kit';
import type { Actions } from './$types';
import { ANTHROPIC_API_KEY } from '$env/static/private';
import { extractFromConversation } from '$lib/agent/extract';

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
} satisfies Actions;
