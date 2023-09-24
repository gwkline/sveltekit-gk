<script lang="ts">
	import StatusCell from '../TableCells/StatusCell.svelte';
	import AccountCell from '../TableCells/AccountCell.svelte';
	import ProxyCell from '../TableCells/ProxyCell.svelte';
	import ButtonGroup from '../TableCells/ButtonGroup.svelte';
	import BrowserCell from '../TableCells/BrowserCell.svelte';
	import { createEventDispatcher } from 'svelte';
	import type { NacTask, TableRowType } from '../../types';
	import CheckboxCell from '../TableCells/CheckboxCell.svelte';

	export let row: TableRowType<NacTask>;
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
		<CheckboxCell {index} {checked} schedule={0} on:change={handleClick} />
	</td>

	{#if row.thisItem}
		{#each Object.entries(row) as [column, value]}
			{#if column !== 'index' && column !== 'itemId' && column !== 'thisItem' && column !== 'checked'}
				<td class={column}>
					{#if column === 'Browser'}
						<BrowserCell {value} />
					{:else if column === 'Status'}
						<StatusCell {value} state={row.thisItem.state || 'Ready'} {page} />
					{:else if column === 'Account'}
						<AccountCell {value} loggedIn={null} />
					{:else if column === 'Proxy'}
						<ProxyCell {value} />
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
