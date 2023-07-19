<script lang="ts">
	import Checkbox from '../Checkbox.svelte';

	export let index: number | null;
	export let checked = false;
</script>

<div class="count-content">
	<div style="width: 10px; text-align: right; font-size:12px;">{index}</div>
	<div class="checkbox">
		<Checkbox bind:checked on:change />
	</div>
</div>

<style>
	.checkbox {
		padding-left: 23.5px;
	}

	.count-content {
		display: flex;
		align-items: center;
		justify-content: start;
	}
</style>
