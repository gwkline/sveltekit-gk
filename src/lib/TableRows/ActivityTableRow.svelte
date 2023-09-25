<script lang="ts">
	import StatusCell from '../TableCells/StatusCell.svelte';
	import AccountCell from '../TableCells/AccountCell.svelte';
	import ProxyCell from '../TableCells/ProxyCell.svelte';
	import ProfileCell from '../TableCells/ProfileCell.svelte';
	import BrowserCell from '../TableCells/BrowserCell.svelte';
	import type { ActivityTask, TableRowType } from '../../types';
	import ActivityModeCell from '../TableCells/ActivityModeCell.svelte';
	import { createEventDispatcher } from 'svelte';

	export let value: string;
	export let column: string;
	export let row: TableRowType<ActivityTask>;
	export let page = '';

	const dispatch = createEventDispatcher();
	const editActivity = (e: CustomEvent) => {
		dispatch('editActivity', { id: row.itemId, mode: e.detail.mode });
	};
</script>

{#if column === 'Browser'}
	<BrowserCell {value} />
{:else if column === 'Status'}
	<StatusCell {value} state={row.thisItem.state || 'Ready'} {page} />
{:else if column === 'Account'}
	<AccountCell {value} loggedIn={row.thisItem.account?.metadata?.logged_in || false} />
{:else if column === 'Proxy'}
	<ProxyCell {value} />
{:else if column === 'Mode'}
	<ActivityModeCell mode={row.thisItem.mode} on:editActivity={editActivity} />
{:else if column === 'Profile'}
	<ProfileCell
		profileName={row.thisItem.account?.profile.name || ''}
		profileTags={row.thisItem.account?.profile.tags?.map((item) => item.name).join(', ') || ''}
		sameName={row.thisItem.account?.use_account_name || false}
	/>
{:else}
	{value}
{/if}
