<script lang="ts">
	import AccountCell from '../TableCells/AccountCell.svelte';
	import ProxyCell from '../TableCells/ProxyCell.svelte';
	import ProfileCell from '../TableCells/ProfileCell.svelte';
	import BrowserCell from '../TableCells/BrowserCell.svelte';
	import type { TableRowType, Account } from '../../types';
	import DateAddedCell from '../TableCells/DateAddedCell.svelte';

	export let value: string;
	export let column: string;
	export let row: TableRowType<Account>;
</script>

{#if column === 'Browser'}
	<BrowserCell {value} />
{:else if column === 'Account'}
	<AccountCell {value} loggedIn={row.thisItem.metadata?.logged_in || false} />
{:else if column === 'Proxy'}
	<ProxyCell {value} />
{:else if column === 'Profile'}
	<ProfileCell
		profileName={row.thisItem.profile.name || ''}
		profileTags={row.thisItem.profile.tags?.map((item) => item.name).join(', ') || ''}
		sameName={row.thisItem.use_account_name || false}
	/>
{:else if column === 'Date Added'}
	<DateAddedCell {value} />
{:else}
	{value}
{/if}
