<script lang="ts">
	import type { TableRowType, Schedule } from '../../types';
	import DateAddedCell from '../TableCells/DateAddedCell.svelte';

	export let value: string;
	export let column: string;
</script>

{#if column === 'Date Added'}
	<DateAddedCell {value} />
{:else}
	{value}
{/if}
