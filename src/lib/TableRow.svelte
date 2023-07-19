<script lang="ts">
	import Checkbox from './Checkbox.svelte';
	import StatusCell from './TableCells/StatusCell.svelte';
	import AccountCell from './TableCells/AccountCell.svelte';
	import SkuCell from './TableCells/SkuCell.svelte';
	import ProxyCell from './TableCells/ProxyCell.svelte';
	import ProfileCell from './TableCells/ProfileCell.svelte';
	import ButtonGroup from './TableCells/ButtonGroup.svelte';
	import BrowserCell from './TableCells/BrowserCell.svelte';
	import { createEventDispatcher } from 'svelte';
	import type { TableRowType, VerboseTask } from '../types';

	export let index: number | null;
	export let row: TableRowType;
	export let itemId: number;
	export let checked = false;
	export let thisTask: VerboseTask | undefined;

	const dispatch = createEventDispatcher();
	const handleClick = () => {
		dispatch('checked', itemId);
	};
</script>

<tr on:click|stopPropagation={handleClick} class={checked ? 'active' : ''}>
	<td class="Count">
		<div class="count-content">
			<div style="width: 10px; text-align: right; font-size:12px;">{index}</div>
			<div class="checkbox">
				<Checkbox bind:checked on:change={handleClick} />
			</div>
		</div>
	</td>

	{#each Object.entries(row) as [column, value]}
		<td class={column}>
			{#if column === 'Browser'}
				<BrowserCell {value} />
			{:else if column === 'Status'}
				<StatusCell {value} state={thisTask?.state || 'Ready'} />
			{:else if column === 'SKU'}
				<SkuCell {value} size={thisTask?.product?.size || ''} />
			{:else if column === 'Account'}
				<AccountCell {value} />
			{:else if column === 'Proxy'}
				<ProxyCell {value} />
			{:else if column === 'Profile'}
				<ProfileCell
					profileName={thisTask?.account?.profile?.name || ''}
					profileTags={thisTask?.account?.profile?.tags?.map((item) => item.name).join(', ') || ''}
				/>
			{:else}
				{value}
			{/if}
		</td>
	{/each}

	<td>
		<ButtonGroup on:delete on:start on:stop on:edit {itemId} state={thisTask?.state || 'Ready'} />
	</td>
</tr>

<style>
	tr {
		height: 46px;
		border-bottom: 1px solid var(--light-gray-3);
		align-items: center;
		vertical-align: middle;
	}

	tr.active,
	tr:hover {
		background-color: var(--light-gray-2);
	}

	td {
		padding: 3px 2px 3px 7px;
		vertical-align: middle;
		font-size: 13px;
		white-space: nowrap;
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
