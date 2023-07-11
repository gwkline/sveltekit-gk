<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	const dispatch = createEventDispatcher();

	type Size = 'xs' | 'sm' | 'md' | 'lg';
	type Type = 'paragraph' | '';
	type Variant = 'invalid' | 'valid' | 'disabled' | '';

	export let type: Type = '';
	export let size: Size = 'md';
	export let placeholder: string = '';
	export let variant: Variant = '';
	export let outline: 'outline' | 'noOutline' = 'outline';
	export let style: string = '';
	export let title: string = '';
	export let value: string = '';

	let disabled = variant == 'disabled';

	function handleChange(event: Event) {
		value = (event.target as HTMLInputElement).value;
		dispatch('input', value);
	}
</script>

<link
	rel="stylesheet"
	href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.2.0/css/all.min.css"
/>

<div style="position: relative;">
	{#if title !== ''}
		<label for={type} class="label">{title}</label>
	{/if}
	{#if type === 'paragraph'}
		<textarea
			class="{type} {size} {outline} {variant}"
			{placeholder}
			bind:value
			on:input={handleChange}
			{disabled}
		/>
	{:else}
		<input
			type="text"
			bind:value
			on:input={handleChange}
			class="box {type} {size} {outline}  {variant}"
			{style}
			{placeholder}
			{disabled}
		/>
	{/if}
</div>

<style>
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
		background: var(--light-gray-1);
		color: var(--off-black);
		font-family: inherit;
		font-style: normal;
		font-weight: 400;
		font-size: 14px;
		padding-left: 12px;
		resize: none;
		outline: 1px solid var(--light-gray-4);
		border: none;
		border-radius: 6px;
		transition: 0.3s;
	}

	textarea {
		padding-top: 12px;
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

	textarea.paragraph {
		width: 220px;
		height: 176px;
		vertical-align: top;
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

	input.valid,
	textarea.valid {
		outline: 1px solid var(--primary);
		box-shadow: 0px 0px 0px 2px rgba(25, 78, 238, 0.32);
		/* outline: 1px solid var(--success-green);
    box-shadow: 0px 0px 0px 2px rgba(25, 238, 135, 0.32); */
	}

	input:focus,
	textarea:focus {
		outline: 1px solid var(--primary);
		box-shadow: 0px 0px 0px 2px rgba(25, 78, 238, 0.32);
		background: var(--light-gray-2);
	}

	input:hover,
	textarea:hover {
		background: var(--light-gray-2);
	}

	input:disabled,
	textarea:disabled {
		background: var(--light-gray-3);
		outline: 1px solid var(--light-gray-4);
		color: var(--gray);
		opacity: 0.3;
		cursor: not-allowed;
	}
</style>
