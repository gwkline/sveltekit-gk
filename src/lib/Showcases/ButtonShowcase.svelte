<script lang="ts">
	import Button from '$lib/Button.svelte';
	import { faStar, faPlay, type IconDefinition } from '@fortawesome/free-solid-svg-icons';

	let variants: Array<ButtonVariants> = ['default', 'primary', 'danger', 'warning', 'success'];
	let sizes: Array<ButtonSizes> = ['xs', 'sm', 'md', 'lg'];
	let shapes: Array<Shape> = ['rectangle', 'square', 'circle'];
	let outlines: Array<OutlineType> = ['noOutline', 'outline'];
	let icons: Array<IconDefinition | null> = [null, faPlay];
	let alternate = [false, true];
	let disabled = [false, true];

	type ButtonVariants = 'default' | 'primary' | 'danger' | 'warning' | 'success';
	type ButtonSizes = 'xs' | 'sm' | 'md' | 'lg';
	type Shape = 'rectangle' | 'square' | 'circle';
	type OutlineType = 'outline' | 'noOutline';
</script>

<div class="container">
	{#each disabled as disabled}
		{#each alternate as alternate}
			{#each shapes as shape}
				{#each icons as icon}
					{#if icon || (!icon && shape != 'circle' && shape != 'square')}
						{#each outlines as outline}
							{#each sizes as size}
								{#each variants as variant}
									<div style="margin: 10px">
										<Button
											{variant}
											{alternate}
											{disabled}
											{shape}
											{outline}
											{icon}
											{size}
											onclick={() =>
												console.log(
													`Button clicked: ${variant} ${shape} ${outline} ${icon} ${size}`
												)}
										>
											{variant[0].toUpperCase() + variant.substring(1)} Button
										</Button>
									</div>
								{/each}
							{/each}
						{/each}
					{/if}
				{/each}
			{/each}
		{/each}
	{/each}
</div>

<style>
	.container {
		position: relative;
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
		gap: 10px;
		overflow: auto;
		padding: 20px;
		overflow-y: scroll;
		height: 100vh;
	}
</style>
