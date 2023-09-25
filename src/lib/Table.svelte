<script lang="ts">
	import TableHead from './TableHead.svelte';
	import type { SortState } from '../types';

	export let tableData: any[];
	export let headers: string[] = [];
	export let sortState: SortState;
	export let checkedAll: boolean;
	export let checkedCount: number = 0;

	let tableCount = 0;
	$: tableCount = tableData.length;
</script>

<table>
	<TableHead {headers} {sortState} {checkedAll} on:sort on:checkedAll {tableCount} {checkedCount} />

	<tbody>
		{#each tableData as row}
			<slot {row} />
		{/each}
	</tbody>
</table>
{#if tableData.length == 0}
	<div class="loading-state">
		<p>There's nothing to show right now...</p>
	</div>
{/if}

<style>
	table {
		border: none;
		background-color: var(--background);
		width: 100%;
		text-align: left;
		border-collapse: collapse;
		max-height: 100vh;
		table-layout: auto;
	}

	.loading-state {
		display: flex;
		justify-content: center;
		align-items: center;
		height: 200px; /* adjust as needed */
		border: 2px solid var(--light-gray-4);
		border-radius: 10px; /* rounded rectangle */
		margin: 10px;
		font-size: 1.2em; /* adjust as needed */
		color: var(--light-gray-4);
	}
</style>
