<script lang="ts">
	import StatusCell from './TableCells/StatusCell.svelte';
	import AccountCell from './TableCells/AccountCell.svelte';
	import SkuCell from './TableCells/SkuCell.svelte';
	import ProxyCell from './TableCells/ProxyCell.svelte';
	import ProfileCell from './TableCells/ProfileCell.svelte';
	import ButtonGroup from './TableCells/ButtonGroup.svelte';
	import BrowserCell from './TableCells/BrowserCell.svelte';
	import { createEventDispatcher } from 'svelte';
	import type { TableRowType, VerboseTask } from '../types';
	import CheckboxCell from './TableCells/CheckboxCell.svelte';
	import ActivityModeCell from './TableCells/ActivityModeCell.svelte';

	export let row: TableRowType;
	export let checked = false;
	let index = row.index;

	const dispatch = createEventDispatcher();
	const handleClick = () => {
		dispatch('checked', row.itemId);
	};

	const changeActivityMode = (e: CustomEvent) => {
		dispatch('edit', { id: row.itemId, mode: e.detail });
	};
</script>

<tr on:click|stopPropagation={handleClick} class={checked ? 'active' : ''}>
	<td class="Count">
		<CheckboxCell {index} {checked} on:change={handleClick} />
	</td>

	{#if row.thisTask}
		{#each Object.entries(row) as [column, value]}
			{#if column !== 'index' && column !== 'itemId' && column !== 'thisTask' && column !== 'checked'}
				<td class={column}>
					{#if column === 'Browser'}
						<BrowserCell {value} />
					{:else if column === 'Status'}
						<StatusCell {value} state={row.thisTask.state || 'Ready'} />
					{:else if column === 'SKU'}
						<SkuCell {value} size={row.thisTask.product.size || ''} />
					{:else if column === 'Account'}
						<AccountCell {value} />
					{:else if column === 'Proxy'}
						<ProxyCell {value} />
					{:else if column === 'Mode'}
						<ActivityModeCell mode={row.thisTask.mode} on:changeActivityMode={changeActivityMode} />
					{:else if column === 'Profile'}
						<ProfileCell
							profileName={row.thisTask.account?.profile.name || ''}
							profileTags={row.thisTask.account?.profile.tags.map((item) => item.name).join(', ') ||
								''}
						/>
					{:else}
						{value}
					{/if}
				</td>
			{/if}
		{/each}

		<td>
			<ButtonGroup
				on:deleteIndiv
				on:startIndiv
				on:stopIndiv
				on:edit
				itemId={row.itemId}
				state={row.thisTask?.state || 'Ready'}
			/>
		</td>
	{/if}
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
