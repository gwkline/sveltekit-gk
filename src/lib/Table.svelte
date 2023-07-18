<script lang="ts">
	import TableHead from './TableHead.svelte';
	import TableRow from './TableRow.svelte';
	import type { HeaderConfigType, TableRowType, Task } from '../types';
	import { sortState } from '../datastore';

	export let tableData: any[];
	export let style: string = '';
	export let headerConfig: HeaderConfigType<Task>;
	export let headers: string[] = [];

	let tableDataShortened: TableRowType[] = [];
	let tableIds: number[] = [];
	$: {
		headers = Object.keys(headerConfig);
		tableIds = [];

		let tableDataShortenedTemp = tableData.map((row) => {
			const rowObject: TableRowType = {};
			for (const header of headers) {
				rowObject[header] = headerConfig[header](row);
			}
			tableIds.push(row.id);
			return rowObject;
		});

		if ($sortState.column !== null) {
			// Get the getter function for the sort column
			const getSortValue = headerConfig[$sortState.column];
			const indices = tableDataShortenedTemp.map((_, index) => index); // Initialize indices array

			indices.sort((aIndex, bIndex) => {
				// Use the getter function to extract the sort value
				const aValue = getSortValue(tableData[aIndex]).toLowerCase();
				const bValue = getSortValue(tableData[bIndex]).toLowerCase();

				if (aValue < bValue) {
					return $sortState.direction === 1 ? -1 : 1;
				}
				if (aValue > bValue) {
					return $sortState.direction === 1 ? 1 : -1;
				}
				return 0;
			});

			// Sort the tableDataShortenedTemp array and the tableIds array according to the sorted indices
			tableDataShortenedTemp = indices.map((index) => tableDataShortenedTemp[index]);
			tableIds = indices.map((index) => tableIds[index]);
		}

		tableDataShortened = tableDataShortenedTemp;
		console.log(tableDataShortened);
	}
</script>

<table class={style}>
	<TableHead {headers} />

	<tbody>
		{#each Object.values(tableDataShortened) as row, index}
			<TableRow {row} index={index + 1} id={tableIds[index]} />
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
