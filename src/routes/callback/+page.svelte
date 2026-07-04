<script lang="ts">
	import type { PageData } from './$types';
	let { data }: { data: PageData } = $props();
</script>

<h1>Xero Connected</h1>

{#if data.connections?.length}
	{#each data.connections as conn}
		<p><strong>Organisation:</strong> {conn.tenantName}</p>
		<p><strong>Tenant ID:</strong> <code>{conn.tenantId}</code></p>
		<p>Copy that Tenant ID into <code>.mcp.json</code> as <code>XERO_TENANT_ID</code>.</p>
	{/each}
{:else}
	<pre>{JSON.stringify(data.connections, null, 2)}</pre>
{/if}
