<script lang="ts">
	type Size = 'sm' | 'md' | 'lg';
	type Variant = 'default' | 'primary' | 'secondary' | 'danger';
	type Outline = 'outline' | 'noOutline';

	export let variant: Variant = 'default';
	export let outline: Outline = 'noOutline';
	export let size: Size;
	export let disabled = false;
	export let options: string[];
	export let shadow = true;
	export let title: string = '';
	export let id: string = '';
	export let value: string = '';
	export let style: string = '';
	export let overlay = false;

	const generateClassString = () => {
		let classes: string[] = [variant, size];
		if (disabled) classes.push('disabled');
		if (shadow) classes.push('shadow');
		classes.push(outline);

		return classes.join(' ');
	};
</script>

<div class="container" style={title !== '' && !overlay ? 'height: 50%;' : ''}>
	<div class={`wrapper ${overlay ? 'row' : 'column'} ${overlay ? '' : 'left-align'}`}>
		{#if title !== ''}
			<label for={id} class={`label ${overlay ? 'overlay' : ''}`}>{title}</label>
		{/if}
		<select bind:value class={generateClassString()} {style} {id} {disabled} on:click on:change>
			{#each options as option (option)}
				<option value={option}>{option}</option>
			{/each}
		</select>
	</div>
</div>

<style>
	.wrapper.left-align {
		align-items: flex-start;
		justify-content: flex-start;
	}
	.wrapper.row {
		flex-direction: row;
	}

	.wrapper.column {
		flex-direction: column;
	}
	.wrapper {
		position: relative;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.container {
		display: flex;
		align-items: center;
		flex-direction: column;
		text-align: center;
		position: relative;
	}
	.overlay {
		position: absolute; /* Absolute positioning */
		top: 50%; /* Center vertically */
		left: 45%; /* Center horizontally */
		transform: translate(-50%, -50%); /* Necessary for true centering */
		pointer-events: none; /* To let click events pass through */
		z-index: 1; /* Adjust as needed */
		text-wrap: nowrap;
		font-size: 14px;
		margin: 0;
	}

	label {
		font-size: 0.8rem;
		font-weight: 500;
		margin-bottom: 0.5rem;
		display: relative;
		font-family: Roboto;
		font-weight: 500;
		font-size: 12px;
		line-height: 14px;
		text-align: start;
		top: 0;
		left: 0;
	}

	select {
		transition: 0.45s;
		width: auto;
		font-family: inherit;
		display: inline-flex;
		border: 1px solid transparent;
		flex-direction: row;
		justify-content: center;
		align-items: center;
		gap: 8px;
		box-shadow: 0px 1px 0px 0px rgba(27, 31, 35, 0.04);
		border-radius: 7px;
		padding: 5px 10px;
	}

	select option:checked,
	select option:hover {
		box-shadow: 0 0 10px 100px #000 inset;
	}

	select.outline {
		border-color: var(--light-gray-4);
		border-width: 1px;
		border-style: solid;
	}

	select.noOutline {
		border: none;
		outline: none;
	}

	select.sm {
		font-weight: 500;
		font-size: 13px;
		height: 28px;
	}

	select.md {
		font-weight: 500;
		font-size: 14px;
		height: 32px;
	}

	select.lg {
		font-size: 15px;
		font-weight: 600;
		height: 40px;
	}

	select:disabled {
		background-color: var(--light-gray-3) !important;
		outline: 1px solid var(--light-gray-4);
		color: var(--gray);
		opacity: 0.3;
		cursor: not-allowed;
	}

	select.default {
		background-color: var(--background);
		color: var(--off-black);
	}

	select.primary {
		background-color: var(--primary);
		color: var(--white);
	}

	select.secondary {
		background-color: var(--background);
		color: var(--primary);
	}

	select.danger {
		background-color: var(--background);
		color: var(--danger-red);
	}

	.shadow {
		box-shadow:
			var(--shadow-1) 0px 0px 0px 0px,
			var(--shadow-1) 0px 0px 0px 0px,
			var(--shadow-2) 0px 1px 1px 0px,
			var(--shadow-3) 0px 0px 0px 1px,
			var(--shadow-1) 0px 0px 0px 0px,
			var(--shadow-1) 0px 0px 0px 0px,
			var(--shadow-4) 0px 2px 5px 0px;
		transition: all 0.15s ease;
	}

	.shadow:hover {
		box-shadow:
			var(--shadow-1) 0px 0px 0px 0px,
			var(--shadow-1) 0px 0px 0px 0px,
			var(--shadow-2) 0px 1px 1px 0px,
			var(--shadow-4) 0px 2px 5px 0px,
			var(--shadow-4) 0px 2px 5px 0px;
	}
</style>
