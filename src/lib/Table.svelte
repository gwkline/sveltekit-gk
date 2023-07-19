<script lang="ts">
	import TableHead from './TableHead.svelte';
	import type { SortState, VerboseTask } from '../types';

	export let tableData: any[];
	export let headers: string[] = [];
	export let tableIds: number[] = [];
	export let sortState: SortState;
	export let checkedAll: boolean;
	export let verboseData: VerboseTask[] = [];

	const findTask = (itemId: number): VerboseTask | undefined => {
		return verboseData.find((item) => item.id === itemId);
	};
</script>

<table>
	<TableHead {headers} {sortState} {checkedAll} on:sort on:checkedAll />

	<tbody>
		{#each tableData as row, index}
			<slot {row} index={index + 1} itemId={tableIds[index]} thisTask={findTask(tableIds[index])} />
		{/each}
	</tbody>
</table>

<style>
	table {
		border: none;
		background-color: var(--background);
		width: 100%;
		text-align: left;
		border-collapse: collapse;
		max-height: 100vh;
		margin-bottom: 100px;
		table-layout: fixed;
	}
</style>
