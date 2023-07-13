<script lang="ts">
	import Checkbox from './Checkbox.svelte';
	import { checkedAllCheckoutTasks, checkedCheckoutTasks, verboseTasks } from '../datastore';
	export let headers: string[];

	export let store = verboseTasks;

	const updateCheckedAll = (event: CustomEvent) => {
		checkedAllCheckoutTasks.set(event.detail.checked);

		if (event.detail.checked) {
			let allIds = $store.map((task) => task.id);
			checkedCheckoutTasks.set(allIds);
		} else {
			checkedCheckoutTasks.set([]);
		}
	};

	let checked = $checkedAllCheckoutTasks;
</script>

<thead>
	<tr>
		<th class="checkbox">
			<Checkbox id={-1} {checked} on:change={updateCheckedAll} />
		</th>
		{#each headers as columnHeading}
			<th class="column-heading">{columnHeading}</th>
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
</style>
