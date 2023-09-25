<script lang="ts">
	import DateAddedCell from '../TableCells/DateAddedCell.svelte';
	import CardNumberCell from '$lib/TableCells/CardNumberCell.svelte';

	export let value: string;
	export let column: string;
</script>

{#if column === 'Date Added'}
	<DateAddedCell {value} />
{:else if column === 'Card Number'}
	<CardNumberCell {value} />
{:else}
	{value}
{/if}
