<script lang="ts">
	import Dropdown from '$lib/Dropdown.svelte';
	import MultiDropdown from '$lib/MultiDropdown.svelte';
	let variants: Variant[] = ['default', 'primary', 'secondary', 'danger'];
	let outlines: Outline[] = ['noOutline', 'outline'];
	let sizes: Size[] = ['sm', 'md', 'lg'];
	let disabled = [true, false];
	let options = ['Option 1', 'Option 2', 'Option 3'];

	type Size = 'sm' | 'md' | 'lg';
	type Variant = 'default' | 'primary' | 'secondary' | 'danger';
	type Outline = 'outline' | 'noOutline';
</script>

<main>
	<!--   Dropdown Showcase -->
	{#each variants as variant}
		<column>
			<div style="margin-bottom: 20px">
				{#each disabled as disable}
					<row>
						{#each sizes as size}
							{#each outlines as outline}
								<div style="margin-right: 20px; margin-top: 10px">
									<Dropdown {variant} disabled={disable} {size} {options} {outline} />
								</div>
							{/each}
						{/each}
					</row>
				{/each}
			</div>
		</column>
	{/each}
	<MultiDropdown options={['1', '2', '3', '4', '5', '6', '7', '8', '9', '10']} />
</main>

<style>
	row {
		display: flex;
		flex-direction: row;
		align-items: center;
		justify-content: center;
	}

	column {
		margin-right: 10px;
	}
</style>
