<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ActionData } from './$types';
	import type { Extraction, Proposal, WriteResult } from '$lib/types';
	import { demoInputs } from '$lib/demoInputs';

	let { form }: { form: ActionData } = $props();
	let submitting = $state(false);
	let resolving = $state(false);
	let approving = $state(false);
	let rejecting = $state(false);
	let rejectReason = $state('');
	let answering = $state(false);
	let answers = $state<string[]>([]);
	let pastedText = $state('');

	function useDemo(text: string) {
		pastedText = text;
	}

	const extraction = $derived(
		form && 'extraction' in form ? (form.extraction as Extraction) : null
	);

	$effect(() => {
		answers = extraction ? extraction.questions.map(() => '') : [];
	});
	const conversation = $derived(
		form && 'conversation' in form ? (form.conversation as string) : ''
	);
	const proposal = $derived(form && 'proposal' in form ? (form.proposal as Proposal) : null);
	const result = $derived(form && 'result' in form ? (form.result as WriteResult) : null);
	const rejected = $derived(form && 'rejected' in form ? (form.rejected as boolean) : false);
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

<div class="layout">
	<aside class="sidebar">
		<h2>Demo inputs</h2>
		<p class="sidebar-note">Copy-paste ready examples — or use the button to drop one straight into the paste box.</p>
		{#each demoInputs as demo (demo.id)}
			<div class="demo-item">
				<div class="demo-item__head">
					<span class="demo-item__id">{demo.id}</span>
					<span class="demo-item__label">{demo.label}</span>
				</div>
				<p class="demo-item__summary">{demo.summary}</p>
				<pre class="demo-item__text">{demo.text}</pre>
				<button type="button" class="demo-item__use" onclick={() => useDemo(demo.text)}>
					Use this →
				</button>
			</div>
		{/each}
	</aside>

	<main>
		<nav>
			<a href="/">The pitch →</a>
		</nav>

		<header>
			<div class="logo-row">
				<h1 class="wordmark"><span class="ink-foil">Match</span><span class="ink-ink">book</span></h1>
				<a href="/audit" class="audit-link">Audit log →</a>
			</div>
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
				bind:value={pastedText}
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
					<form
						method="POST"
						action="?/answer"
						use:enhance={() => {
							answering = true;
							return async ({ update }) => {
								answering = false;
								await update();
							};
						}}
					>
						<input type="hidden" name="conversation" value={conversation} />
						<input type="hidden" name="questions" value={JSON.stringify(extraction.questions)} />
						<ul class="question-list">
							{#each extraction.questions as q, i}
								<li>
									<label for="answer_{i}">{q}</label>
									<input
										type="text"
										id="answer_{i}"
										name="answer_{i}"
										bind:value={answers[i]}
										placeholder="Your answer…"
										required
									/>
								</li>
							{/each}
						</ul>
						<button type="submit" class="primary" disabled={answering}>
							{answering ? 'Re-extracting…' : 'Answer & re-extract →'}
						</button>
					</form>
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

			{#if !proposal && extraction.questions.length === 0}
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

			{#if !result && !rejected}
				{#if proposal.extraction.questions.length > 0}
					<div class="alert questions">
						<strong>Answer the open questions above before approving</strong>
					</div>
				{/if}
				<div class="approval-row">
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
								disabled={approving || rejecting || proposal.extraction.questions.length > 0}
							>
								{approving ? 'Writing to Xero…' : 'Approve & write to Xero →'}
							</button>
						</div>
					</form>

					<form
						method="POST"
						action="?/reject"
						use:enhance={() => {
							rejecting = true;
							return async ({ update }) => {
								rejecting = false;
								await update();
							};
						}}
					>
						<input type="hidden" name="proposal" value={JSON.stringify(proposal)} />
						<input
							type="text"
							name="reason"
							bind:value={rejectReason}
							placeholder="Reason (optional)"
							class="reject-reason"
						/>
						<button type="submit" class="reject" disabled={approving || rejecting}>
							{rejecting ? 'Rejecting…' : 'Reject'}
						</button>
					</form>
				</div>
			{/if}

			{#if rejected}
				<div class="alert error">Proposal rejected. Nothing was written to Xero.</div>
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

			<div class="alert verified">
				<strong>Verified by re-reading from Xero</strong>
				Invoice {result.verified.invoiceNumber} confirmed as {result.verified.status}, total {currencySymbol(proposal!.extraction.currency)}{result.verified.total.toFixed(2)}.
				A history note with the extraction reasoning was written to the invoice.
			</div>
		</section>
	{/if}
	</main>
</div>

<style>
	:global(body) {
		font-family: var(--font-body);
		background: var(--stock);
		color: var(--ink);
		margin: 0;
	}

	.layout {
		max-width: 1200px;
		margin: 0 auto;
		padding: 0 1.5rem;
		display: grid;
		grid-template-columns: 320px minmax(0, 1fr);
		gap: 2rem;
		align-items: start;
	}

	main {
		max-width: 740px;
		margin: 0 auto;
		padding: 2rem 0 5rem;
	}

	.sidebar {
		position: sticky;
		top: 1.5rem;
		max-height: calc(100vh - 3rem);
		overflow-y: auto;
		background: var(--paper);
		border: 1.5px solid var(--stock-line);
		border-radius: 8px;
		padding: 1.25rem;
		margin-top: 2rem;
	}

	.sidebar h2 {
		margin: 0 0 0.4rem;
		font-family: var(--font-mono);
		font-size: 0.72rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.1em;
		color: var(--foil);
	}

	.sidebar-note {
		margin: 0 0 1.25rem;
		font-size: 0.78rem;
		opacity: 0.6;
		line-height: 1.45;
	}

	.demo-item {
		border-top: 1px solid var(--stock-line);
		padding: 1rem 0;
	}

	.demo-item:first-of-type {
		border-top: none;
		padding-top: 0;
	}

	.demo-item__head {
		display: flex;
		align-items: baseline;
		gap: 0.5rem;
		margin-bottom: 0.2rem;
	}

	.demo-item__id {
		font-family: var(--font-mono);
		font-size: 0.7rem;
		opacity: 0.5;
	}

	.demo-item__label {
		font-weight: 700;
		font-size: 0.85rem;
	}

	.demo-item__summary {
		margin: 0 0 0.5rem;
		font-size: 0.78rem;
		opacity: 0.65;
		font-style: italic;
	}

	.demo-item__text {
		background: var(--stock);
		border-radius: 6px;
		padding: 0.6rem 0.7rem;
		font-family: var(--font-mono);
		font-size: 0.72rem;
		line-height: 1.5;
		white-space: pre-wrap;
		word-break: break-word;
		max-height: 9rem;
		overflow-y: auto;
		margin: 0 0 0.6rem;
		user-select: all;
	}

	.demo-item__use {
		display: block;
		width: 100%;
		padding: 0.4rem 0.9rem;
		font-size: 0.75rem;
	}

	@media (max-width: 860px) {
		.layout {
			grid-template-columns: 1fr;
		}

		.sidebar {
			position: static;
			max-height: none;
		}
	}

	nav {
		display: flex;
		justify-content: flex-end;
		margin-bottom: 1.5rem;
	}

	nav a {
		font-family: var(--font-mono);
		font-size: 0.75rem;
		text-transform: uppercase;
		letter-spacing: 0.08em;
		color: var(--ink);
		opacity: 0.6;
		text-decoration: none;
	}

	nav a:hover,
	nav a:focus-visible {
		opacity: 1;
		color: var(--flame);
	}

	header {
		margin-bottom: 2.5rem;
	}

	.logo-row {
		display: flex;
		align-items: baseline;
		justify-content: space-between;
		gap: 1rem;
	}

	.wordmark {
		font-family: var(--font-display);
		font-weight: 800;
		text-transform: uppercase;
		letter-spacing: -0.01em;
		font-size: 1.9rem;
		margin: 0;
	}

	.ink-foil {
		color: var(--foil);
	}

	.ink-ink {
		color: var(--ink);
	}

	.audit-link {
		font-family: var(--font-mono);
		font-size: 0.75rem;
		text-transform: uppercase;
		letter-spacing: 0.08em;
		color: var(--ink);
		opacity: 0.6;
		text-decoration: none;
		white-space: nowrap;
	}

	.audit-link:hover,
	.audit-link:focus-visible {
		opacity: 1;
		color: var(--flame);
	}

	.tagline {
		font-family: var(--font-body);
		font-style: italic;
		color: var(--ink);
		opacity: 0.7;
		margin: 0.35rem 0 0;
		font-size: 0.95rem;
	}

	form {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	label {
		font-family: var(--font-mono);
		text-transform: uppercase;
		letter-spacing: 0.06em;
		font-weight: 700;
		font-size: 0.78rem;
	}

	textarea {
		width: 100%;
		padding: 0.75rem;
		border: 1.5px solid var(--stock-line);
		border-radius: 6px;
		font-family: var(--font-body);
		font-size: 0.9rem;
		line-height: 1.5;
		resize: vertical;
		background: var(--paper);
		box-sizing: border-box;
	}

	textarea:focus {
		outline: none;
		border-color: var(--foil);
		box-shadow: 0 0 0 3px rgba(201, 162, 39, 0.18);
	}

	button {
		align-self: flex-start;
		font-family: var(--font-mono);
		text-transform: uppercase;
		letter-spacing: 0.04em;
		padding: 0.6rem 1.25rem;
		background: var(--ink);
		color: var(--paper);
		border: none;
		border-radius: 999px;
		font-size: 0.85rem;
		font-weight: 700;
		cursor: pointer;
		transition:
			opacity 0.15s,
			background 0.15s;
	}

	button:disabled {
		opacity: 0.45;
		cursor: not-allowed;
	}

	button:focus-visible {
		outline: 2px solid var(--foil);
		outline-offset: 2px;
	}

	.alert {
		margin-top: 1.5rem;
		padding: 1rem 1.25rem;
		border-radius: 8px;
		font-size: 0.9rem;
	}

	.alert.error {
		background: var(--err-bg);
		border: 1.5px solid var(--err-border);
		color: var(--err-fg);
	}

	.alert.questions {
		background: var(--caution-bg);
		border: 1.5px solid var(--caution-border);
		color: var(--caution-fg);
	}

	.alert.warning {
		background: var(--warning-bg);
		border: 1.5px solid var(--warning-border);
		color: var(--warning-fg);
	}

	.alert.verified {
		background: var(--ok-bg);
		border: 1.5px solid var(--ok-border);
		color: var(--ok-fg);
	}

	.alert strong {
		display: block;
		font-family: var(--font-mono);
		text-transform: uppercase;
		letter-spacing: 0.04em;
		font-size: 0.78rem;
		margin-bottom: 0.5rem;
	}

	.alert ul {
		margin: 0;
		padding-left: 1.25rem;
	}

	.alert li + li {
		margin-top: 0.25rem;
	}

	.question-list {
		list-style: none;
		margin: 0 0 1rem;
		padding: 0;
		display: flex;
		flex-direction: column;
		gap: 0.6rem;
	}

	.question-list li {
		display: flex;
		flex-direction: column;
		gap: 0.3rem;
	}

	.question-list label {
		font-family: var(--font-body);
		font-style: italic;
		text-transform: none;
		letter-spacing: normal;
		font-weight: 400;
		font-size: 0.85rem;
		opacity: 0.85;
	}

	.question-list input {
		padding: 0.5rem 0.7rem;
		border: 1.5px solid var(--stock-line);
		border-radius: 6px;
		font-family: var(--font-body);
		font-size: 0.9rem;
		background: var(--paper);
	}

	.question-list input:focus {
		outline: none;
		border-color: var(--foil);
		box-shadow: 0 0 0 3px rgba(201, 162, 39, 0.18);
	}

	.result {
		margin-top: 2.5rem;
		background: var(--paper);
		border: 1.5px solid var(--stock-line);
		border-radius: 8px;
		padding: 1.5rem;
	}

	.result h2 {
		margin: 0 0 1.25rem;
		font-family: var(--font-mono);
		font-size: 0.72rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.1em;
		color: var(--foil);
	}

	.field-row {
		display: flex;
		gap: 1rem;
		padding: 0.5rem 0;
		border-bottom: 1px solid var(--stock-line);
		font-size: 0.9rem;
		align-items: baseline;
	}

	.field-row .label {
		font-family: var(--font-mono);
		text-transform: uppercase;
		letter-spacing: 0.04em;
		opacity: 0.55;
		width: 8rem;
		flex-shrink: 0;
		font-size: 0.75rem;
	}

	.badge {
		display: inline-block;
		font-family: var(--font-mono);
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
		background: var(--ok-bg);
		color: var(--ok-fg);
	}
	.badge.medium {
		background: var(--caution-bg);
		color: var(--caution-fg);
	}
	.badge.low {
		background: var(--err-bg);
		color: var(--err-fg);
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
		background: var(--stock);
		font-family: var(--font-mono);
		font-weight: 700;
		font-size: 0.72rem;
		text-transform: uppercase;
		letter-spacing: 0.06em;
		opacity: 0.6;
	}

	.line-items td {
		padding: 0.75rem;
		border-bottom: 1px solid var(--stock-line);
		vertical-align: top;
	}

	.line-items .center {
		text-align: center;
	}

	.line-items .amount {
		text-align: right;
		font-family: var(--font-mono);
		font-variant-numeric: tabular-nums;
	}

	.line-items tfoot td {
		border-top: 2px solid var(--stock-line);
		border-bottom: none;
		padding-top: 0.75rem;
		font-family: var(--font-mono);
	}

	.provenance {
		opacity: 0.5;
		font-style: italic;
		font-size: 0.82rem;
	}

	.unknown {
		color: var(--flame);
		font-style: italic;
	}

	.actions {
		margin-top: 1.5rem;
		display: flex;
		align-items: center;
		gap: 1rem;
	}

	button.primary {
		background: var(--flame);
		color: var(--paper);
	}

	.approval-row {
		margin-top: 1.5rem;
		display: flex;
		align-items: center;
		gap: 1rem;
		flex-wrap: wrap;
	}

	.approval-row form {
		flex-direction: row;
		align-items: center;
		gap: 0.5rem;
	}

	.approval-row .actions {
		margin-top: 0;
	}

	.reject-reason {
		padding: 0.5rem 0.75rem;
		border: 1.5px solid var(--stock-line);
		border-radius: 6px;
		font-family: var(--font-body);
		font-size: 0.85rem;
		width: 12rem;
		background: var(--paper);
	}

	button.reject {
		background: var(--paper);
		color: var(--err-fg);
		border: 1.5px solid var(--err-border);
	}
</style>
