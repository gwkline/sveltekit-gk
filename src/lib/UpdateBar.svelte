<script lang="ts">
</script>

<div class="bar">
	<slot />
</div>

<style>
	.bar {
		width: 100%;
		background-color: var(--primary);
		height: 30px;
		display: flex;
		align-items: center;
		justify-content: center;
		color: var(--off-black);
		font-size: 12px;
	}
</style>
