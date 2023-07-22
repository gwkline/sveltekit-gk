<script lang="ts">
	import StatusCell from './TableCells/StatusCell.svelte';
	import AccountCell from './TableCells/AccountCell.svelte';
	import SkuCell from './TableCells/SkuCell.svelte';
	import ProxyCell from './TableCells/ProxyCell.svelte';
	import ProfileCell from './TableCells/ProfileCell.svelte';
	import ButtonGroup from './TableCells/ButtonGroup.svelte';
	import BrowserCell from './TableCells/BrowserCell.svelte';
	import { createEventDispatcher } from 'svelte';
	import type { TaskTableRowType } from '../types';
	import CheckboxCell from './TableCells/CheckboxCell.svelte';
	import ActivityModeCell from './TableCells/ActivityModeCell.svelte';

	export let row: TaskTableRowType;
	export let checked = false;
	export let page: string;
	let index = row.index;

	const dispatch = createEventDispatcher();
	const handleClick = () => {
		dispatch('checked', row.itemId);
	};

	const editActivity = (e: CustomEvent) => {
		dispatch('editActivity', { id: row.itemId, mode: e.detail.mode });
	};
</script>

<tr on:click|stopPropagation={handleClick} class={checked ? 'active' : ''}>
	<td class="Count">
		<CheckboxCell {index} {checked} schedule={row.thisItem.schedule_id} on:change={handleClick} />
	</td>

	{#if row.thisItem}
		{#each Object.entries(row) as [column, value]}
			{#if column !== 'index' && column !== 'itemId' && column !== 'thisItem' && column !== 'checked'}
				<td class={column}>
					{#if column === 'Browser'}
						<BrowserCell {value} />
					{:else if column === 'Status'}
						<StatusCell {value} state={row.thisItem.state || 'Ready'} />
					{:else if column === 'SKU'}
						<SkuCell {value} size={row.thisItem.product.size || ''} />
					{:else if column === 'Account'}
						<AccountCell {value} loggedIn={row.thisItem.account?.metadata?.logged_in || false} />
					{:else if column === 'Proxy'}
						<ProxyCell {value} />
					{:else if column === 'Mode'}
						<ActivityModeCell mode={row.thisItem.mode} on:editActivity={editActivity} />
					{:else if column === 'Profile'}
						<ProfileCell
							profileName={row.thisItem.account?.profile.name || ''}
							profileTags={row.thisItem.account?.profile.tags.map((item) => item.name).join(', ') ||
								''}
							sameName={row.thisItem.account?.use_account_name || false}
						/>
					{:else}
						{value}
					{/if}
				</td>
			{/if}
		{/each}

		<td>
			<ButtonGroup
				{page}
				itemId={row.itemId}
				state={row.thisItem?.state || 'Ready'}
				on:delete
				on:start
				on:stop
				on:edit
			/>
		</td>
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
		padding: 3px 7px 3px 2px;
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
