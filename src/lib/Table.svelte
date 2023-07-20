<script lang="ts">
	import TableHead from './TableHead.svelte';
	import type { SortState } from '../types';

	export let tableData: any[];
	export let headers: string[] = [];
	export let sortState: SortState;
	export let checkedAll: boolean;
</script>

<table>
	<TableHead {headers} {sortState} {checkedAll} on:sort on:checkedAll />

	<tbody>
		{#each tableData as row}
			<slot {row} />
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
