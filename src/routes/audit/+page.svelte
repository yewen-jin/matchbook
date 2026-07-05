<script lang="ts">
	import type { PageData } from './$types';
	import type { AuditEntry } from '$lib/types';

	let { data }: { data: PageData } = $props();
	const entries = $derived(data.entries as AuditEntry[]);

	function formatTime(iso: string) {
		return new Date(iso).toLocaleString('en-GB', {
			day: '2-digit',
			month: 'short',
			hour: '2-digit',
			minute: '2-digit',
			second: '2-digit',
		});
	}
</script>

<svelte:head>
	<title>Matchbook — Audit log</title>
</svelte:head>

<main>
	<header>
		<div class="logo"><a href="/">◆ Matchbook</a></div>
		<p class="tagline">Audit log — what the agent did, and why</p>
	</header>

	{#if entries.length === 0}
		<p class="empty">No activity yet. Paste a conversation on the <a href="/">home page</a> to get started.</p>
	{:else}
		<ul class="log">
			{#each entries as entry (entry.id)}
				<li class="entry {entry.action}">
					<div class="entry-head">
						<span class="badge {entry.action}">{entry.action}</span>
						<time>{formatTime(entry.timestamp)}</time>
					</div>
					<p class="summary">{entry.summary}</p>
					{#if entry.detail}
						<details>
							<summary>Details</summary>
							<pre>{JSON.stringify(entry.detail, null, 2)}</pre>
						</details>
					{/if}
				</li>
			{/each}
		</ul>
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
		margin-bottom: 2rem;
	}

	.logo a {
		font-size: 1.5rem;
		font-weight: 700;
		letter-spacing: -0.02em;
		color: inherit;
		text-decoration: none;
	}

	.tagline {
		color: #666;
		margin: 0.3rem 0 0;
		font-size: 0.95rem;
	}

	.empty {
		color: #999;
		font-size: 0.9rem;
	}

	.empty a {
		color: #5b5bea;
	}

	.log {
		list-style: none;
		margin: 0;
		padding: 0;
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.entry {
		background: white;
		border: 1.5px solid #e5e5e5;
		border-radius: 10px;
		padding: 1rem 1.25rem;
	}

	.entry-head {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		margin-bottom: 0.4rem;
	}

	time {
		color: #999;
		font-size: 0.78rem;
		font-variant-numeric: tabular-nums;
	}

	.badge {
		display: inline-block;
		padding: 0.15rem 0.55rem;
		border-radius: 4px;
		font-size: 0.68rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.06em;
	}

	.badge.extracted {
		background: #e0e7ff;
		color: #3730a3;
	}
	.badge.asked {
		background: #fef3c7;
		color: #92400e;
	}
	.badge.approved {
		background: #d1fae5;
		color: #065f46;
	}
	.badge.written {
		background: #5b5bea;
		color: white;
	}
	.badge.verified {
		background: #d1fae5;
		color: #065f46;
	}
	.badge.rejected {
		background: #fee2e2;
		color: #991b1b;
	}

	.summary {
		margin: 0;
		font-size: 0.9rem;
	}

	details {
		margin-top: 0.6rem;
	}

	summary {
		cursor: pointer;
		font-size: 0.78rem;
		color: #999;
	}

	pre {
		background: #f8f7f5;
		border-radius: 6px;
		padding: 0.75rem;
		font-size: 0.75rem;
		overflow-x: auto;
		margin: 0.5rem 0 0;
	}
</style>
