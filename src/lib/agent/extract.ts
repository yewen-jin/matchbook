import Anthropic from '@anthropic-ai/sdk';
import { zodOutputFormat } from '@anthropic-ai/sdk/helpers/zod';
import { ExtractionSchema, type Extraction } from '$lib/types';

const SYSTEM = `You are a billing assistant for Caslean — a musician, model, and creative. \
Your job is to extract invoice details from the booking conversations she pastes.

Rules:
- Extract only what is explicitly stated. Never invent amounts, dates, or names.
- client: the company or person to be billed, not Caslean. Use the name as given in the conversation — a recognisable trading name is sufficient. Never ask for a registered legal entity name, billing address, or VAT number; the invoicing system only needs this name.
- event_date: ISO 8601 preferred (YYYY-MM-DD). Use the natural language date if the year is unclear.
- unit_amount: MUST be null if not explicitly stated — never infer or guess a figure.
- provenance: a short verbatim quote (under 15 words) that justifies each line item.
- due_terms: exact payment term as stated ("14 days", "30 days", "end of month"). Null if absent.
- questions: add a specific, actionable question for every invoice-critical field that is missing or ambiguous.
- duplicate_suspects: flag phrases like "as agreed", "just confirming", "as usual", "running order" that hint this booking may already have been invoiced.
- Default currency: GBP. Write in British English.`;

export async function extractFromConversation(
	conversation: string,
	apiKey: string,
	today: string
): Promise<Extraction> {
	const client = new Anthropic({ apiKey });

	const response = await client.messages.parse({
		model: 'claude-opus-4-8',
		max_tokens: 2048,
		system: SYSTEM,
		messages: [
			{
				role: 'user',
				content: `Today's date is ${today}. Extract invoice details from this conversation:\n\n${conversation}`,
			},
		],
		output_config: {
			format: zodOutputFormat(ExtractionSchema),
		},
	});

	if (!response.parsed_output) {
		throw new Error('Extraction returned no structured output — the model may have refused or hit max_tokens');
	}

	return response.parsed_output;
}
