<script lang="ts">
	import type { PageData } from './$types';
	let { data }: { data: PageData } = $props();
</script>

<svelte:head>
	<title>Matchbook — Xero connected</title>
</svelte:head>

<main>
	<p class="eyebrow">Setup</p>
	<h1>Xero connected</h1>

	{#if data.connections?.length}
		<div class="card">
			{#each data.connections as conn}
				<div class="field-row">
					<span class="label">Organisation</span>
					<span class="value">{conn.tenantName}</span>
				</div>
				<div class="field-row">
					<span class="label">Tenant ID</span>
					<span class="value"><code>{conn.tenantId}</code></span>
				</div>
			{/each}
		</div>
		<p class="note">
			Copy the Tenant ID above into <code>.mcp.json</code> as <code>XERO_TENANT_ID</code>.
		</p>
	{:else}
		<pre>{JSON.stringify(data.connections, null, 2)}</pre>
	{/if}
</main>

<style>
	:global(body) {
		font-family: var(--font-body);
		background: var(--stock);
		color: var(--ink);
		margin: 0;
	}

	main {
		max-width: 560px;
		margin: 0 auto;
		padding: 3rem 1.5rem 5rem;
	}

	.eyebrow {
		font-family: var(--font-mono);
		font-size: 0.72rem;
		text-transform: uppercase;
		letter-spacing: 0.12em;
		color: var(--foil);
		margin: 0 0 0.75rem;
	}

	h1 {
		font-family: var(--font-display);
		font-weight: 800;
		text-transform: uppercase;
		letter-spacing: -0.005em;
		font-size: 1.6rem;
		margin: 0 0 1.75rem;
	}

	.card {
		background: var(--paper);
		border: 1.5px solid var(--stock-line);
		border-radius: 8px;
		padding: 1.25rem 1.5rem;
	}

	.field-row {
		display: flex;
		gap: 1rem;
		padding: 0.5rem 0;
		border-bottom: 1px solid var(--stock-line);
		font-size: 0.9rem;
		align-items: baseline;
	}

	.field-row:last-child {
		border-bottom: none;
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

	.value code {
		font-family: var(--font-mono);
		font-size: 0.85rem;
	}

	.note {
		font-size: 0.88rem;
		opacity: 0.7;
		margin-top: 1.25rem;
	}

	.note code {
		font-family: var(--font-mono);
		font-size: 0.85rem;
	}

	pre {
		background: var(--paper);
		border: 1.5px solid var(--stock-line);
		border-radius: 8px;
		padding: 1rem;
		font-family: var(--font-mono);
		font-size: 0.82rem;
		overflow-x: auto;
	}
</style>
