<script lang="ts">
	import CheckboxCell from '../TableCells/CheckboxCell.svelte';
	import DateAddedCell from '../TableCells/DateAddedCell.svelte';
	import { createEventDispatcher } from 'svelte';
	import type { Payment, TableRowType } from '../../types';
	import CardNumberCell from '$lib/TableCells/CardNumberCell.svelte';

	export let row: TableRowType<Payment>;
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
					{#if column === 'Date Added'}
						<DateAddedCell {value} />
					{:else if column === 'Card Number'}
						<CardNumberCell {value} />
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
