<script lang="ts">
	import type { TableRowType, Win } from '../../types';
	import { cleanDate } from '../../helpers';
	import ProfileCell from '$lib/TableCells/ProfileCell.svelte';
	import BaseCell from '$lib/TableCells/BaseCell.svelte';

	export let value: string;
	export let column: string;
	export let row: TableRowType<Win>;
</script>

{#if column === 'Date'}
	{cleanDate(value)}
{:else if column === 'Product'}
	<img src={value} alt={row.thisItem.product_name} width="70px" />
{:else if column === 'Account'}
	<ProfileCell profileName={value} profileTags={row.thisItem.profile_name} />
{:else}
	<BaseCell {value} />
{/if}
