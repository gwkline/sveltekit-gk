<script lang="ts">
	import { privacy } from '../../datastore';

	export let value: string = '';
</script>

<div class={$privacy ? 'blur' : ''}>
	<span>{value.split(':')[0]}</span>
	<span class="bottom-text">{value.split(':')[2] + ':' + value.split(':')[3]}</span>
</div>

<style>
	.blur {
		filter: blur(4px);
	}
	.bottom-text {
		display: block;
		font-size: 11px;
		color: #888;
	}
</style>
