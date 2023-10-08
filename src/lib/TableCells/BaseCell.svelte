<script lang="ts">
	import { privacy } from '../../datastore';

	export let value: string;
</script>

<div class={$privacy ? 'blur' : ''}>
	<span class="cell">{value}</span>
</div>

<style>
	.cell {
		display: block;
	}
	.blur {
		filter: blur(4px);
	}
</style>
