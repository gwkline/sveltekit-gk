<script lang="ts">
	import AccountCell from '../TableCells/AccountCell.svelte';
	import ProxyCell from '../TableCells/ProxyCell.svelte';
	import ProfileCell from '../TableCells/ProfileCell.svelte';
	import BrowserCell from '../TableCells/BrowserCell.svelte';
	import { createEventDispatcher } from 'svelte';
	import CheckboxCell from '../TableCells/CheckboxCell.svelte';
	import type { TableRowType, Account } from '../../types';
	import DateAddedCell from '../TableCells/DateAddedCell.svelte';

	export let row: TableRowType<Account>;
	export let checked = false;
	let index = row.index;

	const dispatch = createEventDispatcher();
	const handleClick = () => {
		dispatch('checked', row.itemId);
	};
</script>

<tr on:click|stopPropagation={handleClick} class={checked ? 'active' : ''}>
	<td class="Count">
		<CheckboxCell {index} {checked} schedule={0} on:change={handleClick} />
	</td>

	{#if row.thisItem}
		{#each Object.entries(row) as [column, value]}
			{#if column !== 'index' && column !== 'itemId' && column !== 'thisItem' && column !== 'checked'}
				<td class={column}>
					{#if column === 'Browser'}
						<BrowserCell {value} />
					{:else if column === 'Account'}
						<AccountCell {value} loggedIn={row.thisItem.metadata?.logged_in || false} />
					{:else if column === 'Proxy'}
						<ProxyCell {value} />
					{:else if column === 'Profile'}
						<ProfileCell
							profileName={row.thisItem.profile.name || ''}
							profileTags={row.thisItem.profile.tags.map((item) => item.name).join(', ') || ''}
							sameName={row.thisItem.use_account_name || false}
						/>
					{:else if column === 'Date Added'}
						<DateAddedCell {value} />
					{:else}
						{value}
					{/if}
				</td>
			{/if}
		{/each}
	{/if}
</tr>

<style>
	tr {
		height: 46px;
		border-bottom: 1px solid var(--light-gray-3);
		align-items: center;
	}

	tr.active,
	tr:hover {
		background-color: var(--light-gray-2);
	}

	td {
		font-size: 13px;
		overflow: hidden;
		border: none;
	}

	.checkbox {
		padding-left: 23.5px;
	}

	.count-content {
		display: flex;
		align-items: center;
		justify-content: start;
	}
</style>
