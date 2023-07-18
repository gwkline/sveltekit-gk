<script lang="ts">
	import Toggle from '$lib/Toggle.svelte';
	import Radio from '$lib/Radio.svelte';
	import Checkbox from '$lib/Checkbox.svelte';

	let radioObject = [
		{ label: 'Option 1', value: 'option1' },
		{ label: 'Option 2', value: 'option2' },
		{ label: 'Option 3', value: 'option3' }
	];

	let selectedRadio = '';
</script>

<main>
	<row>
		<column>
			<div style="margin-bottom: 10px;">
				<Toggle variant={'success'} />
			</div>
			<div style="margin-right: 10px;">
				<Toggle />
			</div>
		</column>

		<Radio bind:selectedValue={selectedRadio} bind:options={radioObject} />
		<Checkbox />
	</row>
</main>

<style>
	row {
		display: flex;
		flex-direction: row;
		align-items: center;
		justify-content: center;
	}
</style>
