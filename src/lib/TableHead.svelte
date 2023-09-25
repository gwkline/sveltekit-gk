<script lang="ts">
	import Fa from 'svelte-fa';
	import Checkbox from './Checkbox.svelte';
	import { createEventDispatcher } from 'svelte';
	import { faSort, faSortDown, faSortUp } from '@fortawesome/free-solid-svg-icons';
	import type { SortState } from '../types';

	export let headers: string[];
	export let checkedAll: boolean;
	export let sortState: SortState;
	export let tableCount: number;

	const dispatch = createEventDispatcher();

	const updateCheckedAll = (event: CustomEvent) => {
		dispatch('checkedAll', event.detail);
	};

	const updateSortState = (column: string) => {
		dispatch('sort', column);
	};
</script>

<thead>
	<tr>
		<th class="checkbox">
			<Checkbox checked={checkedAll} on:change={updateCheckedAll} />
		</th>
		{#each headers as columnHeading}
			<th class="column-heading" on:click={() => updateSortState(columnHeading)}>
				{columnHeading}
				<span class="icon-container">
					{#if sortState.column === columnHeading && sortState.direction === 1}
						<Fa icon={faSortDown} />
					{:else if sortState.column === columnHeading && sortState.direction === -1}
						<Fa icon={faSortUp} />
					{:else}
						<Fa icon={faSort} color="var(--light-gray-2)" />
					{/if}
				</span>
			</th>
		{/each}
		{#if tableCount > 0}
			<th class="task-count">
				<p style="margin: 0">{tableCount} Tasks</p>
			</th>
		{/if}
	</tr>
</thead>

<style>
	.task-count {
		text-align: end;
		padding-right: 20px;
	}
	thead {
		position: sticky;
		top: 0px;
		z-index: 2;
		background: var(--background);
	}

	thead::after {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background: var(--background);
		z-index: -1;
	}

	tr {
		height: 30px;
		border-bottom: 1px solid var(--success-green);
	}

	th {
		border-collapse: separate;
		font-size: 15px;
		border: none;
		z-index: 2;
		white-space: nowrap;
	}
	.checkbox {
		padding-left: 50px;
	}

	.column-heading {
		text-align: start;
	}

	.icon-container {
		margin-left: 5px;
	}
</style>
