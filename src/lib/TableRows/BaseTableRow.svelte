<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import CheckboxCell from '../TableCells/CheckboxCell.svelte';
	import type { TableRowType } from '../../types';
	import ButtonGroup from '$lib/TableCells/ButtonGroup.svelte';

	export let row: TableRowType<any>;
	export let checked = false;
	export let page = 'accounts';

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
					<slot {column} {value} {row} {page} />
				</td>
			{/if}
		{/each}

		{#if row.thisItem?.state}
			<td class="action">
				<ButtonGroup
					{page}
					itemId={row.itemId}
					state={row.thisItem.state}
					on:delete
					on:start
					on:stop
					on:edit
					on:focus
				/>
			</td>
		{/if}
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

	.action {
		display: flex;
		align-items: center;
		justify-content: flex-end;
	}
</style>
