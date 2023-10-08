<script lang="ts">
	import StatusCell from '../TableCells/StatusCell.svelte';
	import AccountCell from '../TableCells/AccountCell.svelte';
	import ProxyCell from '../TableCells/ProxyCell.svelte';
	import BrowserCell from '../TableCells/BrowserCell.svelte';
	import type { NacTask, TableRowType } from '../../types';
	import BaseCell from '$lib/TableCells/BaseCell.svelte';

	export let value: string;
	export let column: string;
	export let row: TableRowType<NacTask>;
	export let page = '';
</script>

{#if column === 'Browser'}
	<BrowserCell {value} />
{:else if column === 'Status'}
	<StatusCell {value} state={row.thisItem.state || 'Ready'} {page} />
{:else if column === 'Account'}
	<AccountCell {value} loggedIn={null} />
{:else if column === 'Proxy'}
	<ProxyCell {value} />
{:else}
	<BaseCell {value} />
{/if}
