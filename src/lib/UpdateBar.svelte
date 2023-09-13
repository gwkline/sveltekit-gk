<script lang="ts">
	export let color = 'var(--primary)';
</script>

<button style={`background-color: ${color}`} on:click>
	<slot />
</button>

<style>
	button {
		width: 100%;
		background-color: var(--primary);
		height: 20px;
		display: flex;
		align-items: center;
		justify-content: center;
		color: var(--white);
		font-size: 12px;
		position: absolute;
		top: 0;
		left: 0;
		z-index: 20;
		outline: none;
		border: none;
	}

	button:hover {
		background-color: var(--primary-hover) !important;
	}
</style>
