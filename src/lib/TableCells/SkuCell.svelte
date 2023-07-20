<script lang="ts">
	export let value: string = '';
	export let size: string = '';
</script>

<div>
	<span>{value}</span>
	{#if size}
		<span class="bottom-text">Size {size}</span>
	{/if}
</div>

<style>
	.bottom-text {
		display: block;
		font-size: 11px;
		color: #888;
	}
</style>
