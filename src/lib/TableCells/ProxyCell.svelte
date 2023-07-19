<script lang="ts">
	export let value: string = '';
</script>

<div>
	<span>{value.split(':')[0]}</span>
	<span class="sizeValue">{value.split(':')[2] + ':' + value.split(':')[3]}</span>
</div>

<style>
	.sizeValue {
		display: block;
		font-size: 11px;
		color: #888;
	}
</style>
