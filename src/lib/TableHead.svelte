<script lang="ts">
	import Checkbox from './Checkbox.svelte';
	import {
		checkedAllCheckoutTasks,
		checkedCheckoutTasks,
		verboseTasks,
		sortState
	} from '../datastore';
	import { faSort, faSortDown, faSortUp, faUnsorted } from '@fortawesome/free-solid-svg-icons';
	import Fa from 'svelte-fa';
	export let headers: string[];
	export let store = verboseTasks;

	let checked = $checkedAllCheckoutTasks;

	const updateCheckedAll = (event: CustomEvent) => {
		checkedAllCheckoutTasks.set(event.detail.checked);

		if (event.detail.checked) {
			let allIds = $store.map((task) => task.id);
			checkedCheckoutTasks.set(allIds);
		} else {
			checkedCheckoutTasks.set([]);
		}
	};

	const updateSortState = (column: string) => {
		sortState.update((currentState) => {
			let newDirection: 0 | 1 | -1 = 1;
			let newColumn: string | null = column;
			if (currentState.column === column) {
				// Click on same column
				if (currentState.direction === 1) {
					// Change direction if currently ascending
					newDirection = -1;
				} else if (currentState.direction === -1) {
					// Remove sorting if currently descending
					newDirection = 0;
					newColumn = null;
				}
			}
			return { column: newColumn, direction: newDirection };
		});
	};
</script>

<thead>
	<tr>
		<th class="checkbox">
			<Checkbox {checked} on:change={updateCheckedAll} />
		</th>
		{#each headers as columnHeading}
			<th class="column-heading" on:click={() => updateSortState(columnHeading)}>
				{columnHeading}
				<span class="icon-container">
					{#if $sortState.column === columnHeading && $sortState.direction === 1}
						<Fa icon={faSortDown} />
					{:else if $sortState.column === columnHeading && $sortState.direction === -1}
						<Fa icon={faSortUp} />
					{:else}
						<Fa icon={faUnsorted} />
					{/if}
				</span>
			</th>
		{/each}
	</tr>
</thead>

<style>
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
		height: 46px;
	}

	th {
		border-collapse: collapse;
		font-size: 15px;
		border: none;
		z-index: 2;
	}
	.checkbox {
		padding-left: 40px;
	}

	.column-heading {
		text-align: start;
		padding-left: 10px;
	}

	.icon-container {
		margin-left: 5px;
	}
</style>
