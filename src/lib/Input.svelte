<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	const dispatch = createEventDispatcher();

	type Size = 'xs' | 'sm' | 'md' | 'lg';
	type Type = 'paragraph' | '';
	type Variant = 'invalid' | 'valid' | 'disabled' | 'transparent' | '';
	type Outline = 'outline' | 'noOutline';

	export let type: Type = '';
	export let size: Size = 'md';
	export let variant: Variant = '';
	export let outline: Outline = 'noOutline';
	export let shadow = true;
	export let placeholder: string = '';
	export let style: string = '';
	export let title: string = '';
	export let value: string = '';
	export let disabled: boolean = false;

	function handleChange(event: Event) {
		dispatch('input', (event.target as HTMLInputElement).value);
	}
	function handleBlur(event: Event) {
		dispatch('blur', (event.target as HTMLInputElement).value);
	}

	function handleKeyDown(event: KeyboardEvent) {
		if (event.key === 'Enter') {
			(event.target as HTMLInputElement).blur();
		}
	}
</script>

<link
	rel="stylesheet"
	href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.2.0/css/all.min.css"
/>

<div class="container">
	{#if title !== ''}
		<label for={type} class="label">{title}</label>
	{/if}
	{#if type === 'paragraph'}
		<textarea
			class="{size} {outline} {variant} {shadow ? 'shadow' : ''}"
			{placeholder}
			bind:value
			on:input={handleChange}
			on:blur={handleBlur}
			on:keydown={handleKeyDown}
			{disabled}
			{style}
		/>
	{:else}
		<input
			class="{size} {outline} {variant} {shadow ? 'shadow' : ''}"
			{placeholder}
			bind:value
			on:input={handleChange}
			on:blur={handleBlur}
			on:keydown={handleKeyDown}
			{disabled}
			{style}
			type="text"
		/>
	{/if}
</div>

<style>
	.container {
		display: flex;
		flex-direction: column;
		width: 100%;
		justify-content: start;
	}
	label {
		font-size: 0.8rem;
		font-weight: 500;
		margin-bottom: 0.5rem;
		display: block;
		font-family: Roboto;
		font-weight: 500;
		font-size: 12px;
		line-height: 14px;
	}
	input,
	textarea {
		box-sizing: border-box;
		background-color: var(--light-gray-1);
		color: var(--off-black);
		font-family: inherit;
		font-style: normal;
		font-weight: 400;
		font-size: 14px;
		padding: 0px 12px;
		resize: none;
		outline: 1px solid var(--light-gray-4);
		border: none;
		border-radius: 6px;
	}

	input.noOutline,
	textarea.noOutline {
		outline: none;
	}

	input.invalid,
	textarea.invalid {
		outline: 1px solid var(--danger-red);
		box-shadow: 0px 0px 0px 2px rgba(207, 34, 46, 0.32);
	}

	input.transparent,
	textarea.transparent {
		background: none;
	}

	input.valid,
	textarea.valid {
		outline: 1px solid var(--primary);
		box-shadow: 0px 0px 0px 2px rgba(25, 78, 238, 0.32);
	}

	input:focus,
	textarea:focus {
		outline: 1px solid var(--primary);
		box-shadow: 0px 0px 0px 2px rgba(25, 78, 238, 0.32);
		background-color: var(--light-gray-1);
	}

	input:hover,
	textarea:hover {
		background-color: var(--light-gray-1);
		outline: 1px solid var(--gray);
	}

	input:disabled,
	textarea:disabled {
		background-color: var(--light-gray-3);
		outline: 1px solid var(--light-gray-4);
		color: var(--gray);
		opacity: 0.3;
		cursor: not-allowed;
	}
	input.xs {
		width: 150px;
		height: 28px;
	}

	input.sm {
		width: 180px;
		height: 28px;
	}

	input.md {
		width: 180px;
		height: 32px;
	}

	input.lg {
		width: 180px;
		height: 40px;
	}

	textarea {
		padding-top: 12px;
		width: 220px;
		height: 176px;
		vertical-align: top;
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
		transition:
			background-color 0.24s ease 0s,
			box-shadow 0.24s ease 0s;
	}

	.shadow:hover {
		transition:
			background-color 0.24s ease 0s,
			box-shadow 0.24s ease 0s;
		box-shadow:
			var(--shadow-1) 0px 0px 0px 0px,
			var(--shadow-1) 0px 0px 0px 0px,
			var(--shadow-2) 0px 1px 1px 0px,
			var(--shadow-4) 0px 2px 5px 0px,
			var(--shadow-4) 0px 2px 5px 0px;
	}
</style>
