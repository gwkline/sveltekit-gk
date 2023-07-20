<script lang="ts">
	export let value: string = '';
</script>

<div>
	<span>{value.split(':')[0]}</span>
	<span class="bottom-text">{value.split(':')[2] + ':' + value.split(':')[3]}</span>
</div>

<style>
	.bottom-text {
		display: block;
		font-size: 11px;
		color: #888;
	}
</style>
