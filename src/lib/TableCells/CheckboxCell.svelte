<script lang="ts">
	import { faClock } from '@fortawesome/free-solid-svg-icons';
	import Checkbox from '../Checkbox.svelte';
	import Fa from 'svelte-fa';
	import Tooltip from '$lib/Tooltip.svelte';

	export let index: number | null;
	export let checked = false;
	export let schedule: number;
</script>

<div class="count-content">
	<div class="checkbox">
		<Checkbox bind:checked on:change />
	</div>
	<div style="width: 10px; text-align: right; font-size:12px; ">#{index}</div>
	<div class="icons">
		{#if schedule && schedule !== 0}
			<Tooltip text="testing">
				<Fa icon={faClock} />
			</Tooltip>
		{/if}
	</div>
</div>

<style>
	.icons {
		display: flex;
		flex-direction: column;
		margin-left: 10px;
		gap: 10px;
	}
	.checkbox {
		padding-right: 23.5px;
	}

	.count-content {
		display: flex;
		align-items: center;
		justify-content: start;
		padding-left: 10px;
	}
</style>
