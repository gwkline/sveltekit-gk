<script lang="ts">
	import StatusCell from '../TableCells/StatusCell.svelte';
	import AccountCell from '../TableCells/AccountCell.svelte';
	import SkuCell from '../TableCells/SkuCell.svelte';
	import ProxyCell from '../TableCells/ProxyCell.svelte';
	import ProfileCell from '../TableCells/ProfileCell.svelte';
	import BrowserCell from '../TableCells/BrowserCell.svelte';
	import type { TableRowType, Task } from '../../types';
	import BaseCell from '$lib/TableCells/BaseCell.svelte';

	export let value: string;
	export let column: string;
	export let row: TableRowType<Task>;
	export let page = '';
</script>

{#if column === 'Browser'}
	<BrowserCell {value} />
{:else if column === 'Status'}
	<StatusCell {value} state={row.thisItem.state || 'Ready'} {page} />
{:else if column === 'SKU' && typeof row.thisItem.product !== 'undefined'}
	<SkuCell {value} size={row.thisItem.product.size || ''} />
{:else if column === 'Account'}
	<AccountCell {value} loggedIn={row.thisItem.account?.metadata?.logged_in || false} />
{:else if column === 'Proxy'}
	<ProxyCell {value} />
{:else if column === 'Profile'}
	<ProfileCell
		profileName={row.thisItem.account?.profile.name || ''}
		profileTags={row.thisItem.account?.profile.tags?.map((item) => item.name).join(', ') || ''}
		sameName={row.thisItem.account?.use_account_name || false}
	/>
{:else}
	<BaseCell {value} />
{/if}
