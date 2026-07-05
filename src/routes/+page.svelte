<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ActionData } from './$types';
	import type { Extraction, Proposal, WriteResult } from '$lib/types';

	let { form }: { form: ActionData } = $props();
	let submitting = $state(false);
	let resolving = $state(false);
	let approving = $state(false);

	const extraction = $derived(
		form && 'extraction' in form ? (form.extraction as Extraction) : null
	);
	const conversation = $derived(
		form && 'conversation' in form ? (form.conversation as string) : ''
	);
	const proposal = $derived(form && 'proposal' in form ? (form.proposal as Proposal) : null);
	const result = $derived(form && 'result' in form ? (form.result as WriteResult) : null);
	const formError = $derived(form && 'error' in form ? (form.error as string) : null);

	function currencySymbol(code: string) {
		return code === 'GBP' ? '£' : code;
	}

	function lineTotal(e: Extraction) {
		return e.line_items.reduce((sum, item) => sum + (item.unit_amount ?? 0) * item.qty, 0);
	}

	function hasKnownAmounts(e: Extraction) {
		return e.line_items.some((i) => i.unit_amount !== null);
	}
</script>

<svelte:head>
	<title>Matchbook</title>
</svelte:head>

<main>
	<header>
		<div class="logo">◆ Matchbook</div>
		<p class="tagline">You got the gig. We'll do the paperwork.</p>
	</header>

	<form
		method="POST"
		action="?/extract"
		use:enhance={() => {
			submitting = true;
			return async ({ update }) => {
				submitting = false;
				await update();
			};
		}}
	>
		<label for="conversation">Paste a booking conversation</label>
		<textarea
			id="conversation"
			name="conversation"
			placeholder="Paste an email, DM, or call transcript…"
			rows="10"
			required
		></textarea>
		<button type="submit" disabled={submitting}>
			{submitting ? 'Extracting…' : 'Extract invoice details →'}
		</button>
	</form>

	{#if formError}
		<div class="alert error" role="alert">
			{formError}
		</div>
	{/if}

	{#if extraction}
		<section class="result">
			<h2>Extraction result</h2>

			<div class="field-row">
				<span class="label">Client</span>
				<span class="value">
					{extraction.client ?? '—'}
					<span class="badge {extraction.client_confidence}">{extraction.client_confidence}</span>
				</span>
			</div>

			<div class="field-row">
				<span class="label">Date</span>
				<span class="value">{extraction.event_date ?? '—'}</span>
			</div>

			<div class="field-row">
				<span class="label">Currency</span>
				<span class="value">{extraction.currency}</span>
			</div>

			<div class="field-row">
				<span class="label">Payment terms</span>
				<span class="value">{extraction.due_terms ?? '—'}</span>
			</div>

			<table class="line-items">
				<thead>
					<tr>
						<th>Description</th>
						<th>Qty</th>
						<th>Amount</th>
						<th>Source quote</th>
					</tr>
				</thead>
				<tbody>
					{#each extraction.line_items as item}
						<tr>
							<td>{item.description}</td>
							<td class="center">{item.qty}</td>
							<td class="amount">
								{#if item.unit_amount !== null}
									{currencySymbol(extraction.currency)}{item.unit_amount.toFixed(2)}
								{:else}
									<span class="unknown">unknown</span>
								{/if}
							</td>
							<td class="provenance">"{item.provenance}"</td>
						</tr>
					{/each}
				</tbody>
				{#if hasKnownAmounts(extraction)}
					<tfoot>
						<tr>
							<td colspan="2"><strong>Total</strong></td>
							<td class="amount"><strong>{currencySymbol(extraction.currency)}{lineTotal(extraction).toFixed(2)}</strong></td>
							<td></td>
						</tr>
					</tfoot>
				{/if}
			</table>

			{#if extraction.questions.length > 0}
				<div class="alert questions">
					<strong>Before drafting — questions</strong>
					<ul>
						{#each extraction.questions as q}
							<li>{q}</li>
						{/each}
					</ul>
				</div>
			{/if}

			{#if extraction.duplicate_suspects.length > 0}
				<div class="alert warning">
					<strong>Possible duplicate</strong>
					<ul>
						{#each extraction.duplicate_suspects as d}
							<li>{d}</li>
						{/each}
					</ul>
				</div>
			{/if}

			{#if !proposal}
				<form
					method="POST"
					action="?/resolve"
					use:enhance={() => {
						resolving = true;
						return async ({ update }) => {
							resolving = false;
							await update();
						};
					}}
				>
					<input type="hidden" name="conversation" value={conversation} />
					<input type="hidden" name="extraction" value={JSON.stringify(extraction)} />
					<div class="actions">
						<button type="submit" class="primary" disabled={resolving}>
							{resolving ? 'Resolving…' : 'Resolve against Xero →'}
						</button>
					</div>
				</form>
			{/if}
		</section>
	{/if}

	{#if proposal}
		<section class="result">
			<h2>Proposal</h2>

			<div class="field-row">
				<span class="label">Contact</span>
				<span class="value">
					{#if proposal.contact.status === 'matched' && proposal.contact.match}
						{proposal.contact.match.name}
						<span class="badge {proposal.contact.match.confidence}">{proposal.contact.match.confidence} match</span>
					{:else}
						<span class="unknown">new contact</span> — will propose creating "{proposal.extraction.client}"
					{/if}
				</span>
			</div>

			{#if proposal.contact.candidates.length > 1}
				<div class="alert warning">
					<strong>Multiple possible matches</strong>
					<ul>
						{#each proposal.contact.candidates as c}
							<li>{c.name} ({c.confidence}) — {c.email ?? 'no email'}</li>
						{/each}
					</ul>
				</div>
			{/if}

			{#if proposal.duplicates.length > 0}
				<div class="alert warning">
					<strong>Possible duplicate invoice in Xero</strong>
					<ul>
						{#each proposal.duplicates as d}
							<li>
								{d.invoiceNumber}{d.reference ? ` (${d.reference})` : ''} — {d.date.slice(0, 10)},
								{currencySymbol(proposal.extraction.currency)}{d.total.toFixed(2)}, {d.status}
							</li>
						{/each}
					</ul>
				</div>
			{/if}

			{#if !result}
				{#if proposal.extraction.questions.length > 0}
					<div class="alert questions">
						<strong>Answer the open questions above before approving</strong>
					</div>
				{/if}
				<form
					method="POST"
					action="?/approve"
					use:enhance={() => {
						approving = true;
						return async ({ update }) => {
							approving = false;
							await update();
						};
					}}
				>
					<input type="hidden" name="proposal" value={JSON.stringify(proposal)} />
					<div class="actions">
						<button
							type="submit"
							class="primary"
							disabled={approving || proposal.extraction.questions.length > 0}
						>
							{approving ? 'Writing to Xero…' : 'Approve & write to Xero →'}
						</button>
					</div>
				</form>
			{/if}
		</section>
	{/if}

	{#if result}
		<section class="result">
			<h2>Written to Xero</h2>

			<div class="field-row">
				<span class="label">Contact</span>
				<span class="value">
					{result.contact.name}
					{#if result.contactWasCreated}
						<span class="badge exact">newly created</span>
					{:else}
						<span class="badge high">existing</span>
					{/if}
				</span>
			</div>

			<div class="field-row">
				<span class="label">Invoice</span>
				<span class="value">{result.invoice.invoiceNumber} — {result.invoice.status}</span>
			</div>

			<div class="field-row">
				<span class="label">Total</span>
				<span class="value">{currencySymbol(proposal!.extraction.currency)}{result.invoice.total.toFixed(2)}</span>
			</div>

			<div class="field-row">
				<span class="label">Due date</span>
				<span class="value">{result.invoice.dueDate ?? '—'}</span>
			</div>

			<div class="alert questions" style="background:#ecfdf5;border-color:#6ee7b7;color:#065f46;">
				<strong>Verified by re-reading from Xero</strong>
				Invoice {result.verified.invoiceNumber} confirmed as {result.verified.status}, total {currencySymbol(proposal!.extraction.currency)}{result.verified.total.toFixed(2)}.
				A history note with the extraction reasoning was written to the invoice.
			</div>
		</section>
	{/if}
</main>

<style>
	:global(body) {
		font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
		background: #f8f7f5;
		color: #1a1a1a;
		margin: 0;
	}

	main {
		max-width: 740px;
		margin: 0 auto;
		padding: 2.5rem 1.5rem 5rem;
	}

	header {
		margin-bottom: 2.5rem;
	}

	.logo {
		font-size: 1.5rem;
		font-weight: 700;
		letter-spacing: -0.02em;
	}

	.tagline {
		color: #666;
		margin: 0.3rem 0 0;
		font-size: 0.95rem;
	}

	form {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	label {
		font-weight: 600;
		font-size: 0.9rem;
	}

	textarea {
		width: 100%;
		padding: 0.75rem;
		border: 1.5px solid #ddd;
		border-radius: 8px;
		font-family: inherit;
		font-size: 0.9rem;
		line-height: 1.5;
		resize: vertical;
		background: white;
		box-sizing: border-box;
	}

	textarea:focus {
		outline: none;
		border-color: #5b5bea;
		box-shadow: 0 0 0 3px rgba(91, 91, 234, 0.1);
	}

	button {
		align-self: flex-start;
		padding: 0.6rem 1.25rem;
		background: #1a1a1a;
		color: white;
		border: none;
		border-radius: 6px;
		font-size: 0.9rem;
		font-weight: 600;
		cursor: pointer;
		transition: opacity 0.15s;
	}

	button:disabled {
		opacity: 0.45;
		cursor: not-allowed;
	}

	.alert {
		margin-top: 1.5rem;
		padding: 1rem 1.25rem;
		border-radius: 8px;
		font-size: 0.9rem;
	}

	.alert.error {
		background: #fef2f2;
		border: 1.5px solid #fca5a5;
		color: #991b1b;
	}

	.alert.questions {
		background: #fffbeb;
		border: 1.5px solid #fcd34d;
		color: #92400e;
	}

	.alert.warning {
		background: #fff7ed;
		border: 1.5px solid #fdba74;
		color: #9a3412;
	}

	.alert strong {
		display: block;
		margin-bottom: 0.4rem;
	}

	.alert ul {
		margin: 0;
		padding-left: 1.25rem;
	}

	.alert li + li {
		margin-top: 0.25rem;
	}

	.result {
		margin-top: 2.5rem;
		background: white;
		border: 1.5px solid #e5e5e5;
		border-radius: 10px;
		padding: 1.5rem;
	}

	.result h2 {
		margin: 0 0 1.25rem;
		font-size: 0.75rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.08em;
		color: #999;
	}

	.field-row {
		display: flex;
		gap: 1rem;
		padding: 0.5rem 0;
		border-bottom: 1px solid #f2f2f2;
		font-size: 0.9rem;
		align-items: baseline;
	}

	.field-row .label {
		color: #999;
		width: 8rem;
		flex-shrink: 0;
		font-size: 0.85rem;
	}

	.badge {
		display: inline-block;
		padding: 0.1rem 0.45rem;
		border-radius: 4px;
		font-size: 0.65rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.06em;
		margin-left: 0.5rem;
		vertical-align: middle;
	}

	.badge.exact,
	.badge.high {
		background: #d1fae5;
		color: #065f46;
	}
	.badge.medium {
		background: #fef3c7;
		color: #92400e;
	}
	.badge.low {
		background: #fee2e2;
		color: #991b1b;
	}

	.line-items {
		width: 100%;
		border-collapse: collapse;
		margin-top: 1.25rem;
		font-size: 0.9rem;
	}

	.line-items th {
		text-align: left;
		padding: 0.5rem 0.75rem;
		background: #f8f7f5;
		font-weight: 600;
		font-size: 0.75rem;
		text-transform: uppercase;
		letter-spacing: 0.06em;
		color: #999;
	}

	.line-items td {
		padding: 0.75rem;
		border-bottom: 1px solid #f2f2f2;
		vertical-align: top;
	}

	.line-items .center {
		text-align: center;
	}

	.line-items .amount {
		text-align: right;
		font-variant-numeric: tabular-nums;
	}

	.line-items tfoot td {
		border-top: 2px solid #e5e5e5;
		border-bottom: none;
		padding-top: 0.75rem;
	}

	.provenance {
		color: #aaa;
		font-style: italic;
		font-size: 0.82rem;
	}

	.unknown {
		color: #ef4444;
		font-style: italic;
	}

	.actions {
		margin-top: 1.5rem;
		display: flex;
		align-items: center;
		gap: 1rem;
	}

	button.primary {
		background: #5b5bea;
	}

	.phase-label {
		color: #bbb;
		font-size: 0.78rem;
	}
</style>
