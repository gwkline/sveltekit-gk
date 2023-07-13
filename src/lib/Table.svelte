<script lang="ts">
	import TableHead from './TableHead.svelte';
	import TableRow from './TableRow.svelte';
	import type { HeaderConfigType, TableRowType, Task } from '../types';

	export let tableData: any[];
	export let style: string = '';
	export let headerConfig: HeaderConfigType<Task>;
	export let headers: string[] = [];

	let tableDataShortened: TableRowType[] = [];
	let tableIds: number[] = [];
	$: {
		headers = Object.keys(headerConfig);
		tableIds = [];
		tableDataShortened = tableData.map((row) => {
			const rowObject: TableRowType = {};
			for (const header of headers) {
				rowObject[header] = headerConfig[header](row);
			}
			tableIds.push(row.id);
			return rowObject;
		});
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
