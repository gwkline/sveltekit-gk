<script lang="ts">
	import TableHead from './TableHead.svelte';
	import TableRow from './TableRow.svelte';
	import type { Task } from '../types';
	export let tableData: any[];
	export let style: string = '';

	export let headerConfig: TaskHeaderConfigType;
	export let headers = Object.keys(headerConfig);
	type TaskHeaderConfigType = {
		[header: string]: (task: Task) => string;
	};

	type TableRowType = Record<string, string>;

	let tableDataShortened: TableRowType[] = [];
	$: tableDataShortened = tableData.map((task) => {
		const row: TableRowType = {};
		for (const header of headers) {
			row[header] = headerConfig[header](task);
		}
		return row;
	});
</script>

<table class={style}>
	<TableHead {headers} />

	<tbody>
		{#each Object.values(tableDataShortened) as row, index}
			<TableRow {row} index={index + 1} />
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
