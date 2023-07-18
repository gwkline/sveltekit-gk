<script lang="ts">
	import Button from '$lib/Button.svelte';
	import { faStar, faPlay } from '@fortawesome/free-solid-svg-icons';
	import type { IconDefinition } from '@fortawesome/free-solid-svg-icons';

	let variants: Array<ButtonVariants> = [
		'default',
		'primary',
		'secondary',
		'danger',
		'warning',
		'success'
	];
	let sizes: Array<ButtonSizes> = ['xs', 'sm', 'md', 'lg'];
	let types: Array<ButtonTypes> = ['button', 'submit', 'reset'];
	let shapes: Array<Shape> = ['rectangle', 'square', 'circle'];
	let outlines: Array<OutlineType> = ['outline', 'noOutline'];
	let icons: Array<IconDefinition | null> = [null, faPlay, faStar];

	type ButtonVariants = 'default' | 'primary' | 'secondary' | 'danger' | 'warning' | 'success';
	type ButtonTypes = 'button' | 'submit' | 'reset';
	type ButtonSizes = 'xs' | 'sm' | 'md' | 'lg';
	type Shape = 'rectangle' | 'square' | 'circle';
	type OutlineType = 'outline' | 'noOutline';
</script>

<div class="container">
	{#each variants as variant}
		{#each types as type}
			{#each shapes as shape}
				{#each outlines as outline}
					{#each sizes as size}
						{#each icons as icon}
							<div style="margin: 20px">
								<Button
									{variant}
									{type}
									{shape}
									{outline}
									{icon}
									{size}
									onclick={() =>
										console.log(`Button clicked: ${variant} ${type} ${shape} ${outline}`)}
								>
									{variant[0].toUpperCase() + variant.substring(1)} Button
								</Button>
							</div>
						{/each}
					{/each}
				{/each}
			{/each}
		{/each}
	{/each}
</div>

<style>
	.container {
		position: relative;
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
		gap: 20px;
		overflow: auto;
		padding: 20px;
		overflow-y: scroll;
		height: 100vh;
	}
</style>
