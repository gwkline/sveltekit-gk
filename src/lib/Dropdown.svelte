<script lang="ts">
	type Size = 'sm' | 'md' | 'lg';
	type Variant = 'default' | 'primary' | 'secondary' | 'danger';

	export let variant: Variant = 'default';
	export let status: 'disabled' | '' = '';
	export let disabled = false;
	export let size: Size;
	export let options: string[];
	export let title: string = '';
	export let id: string = '';
	export let value: string = '';
	export let style: string = '';
</script>

<div class="container">
	{#if title !== ''}
		<label for={id} class="label">{title}</label>
	{/if}
	<select
		bind:value
		class="{variant} {size} status={status === 'disabled' || disabled ? 'disabled' : ''} outline"
		{style}
		{id}
		{disabled}
	>
		{#each options as option (option)}
			<option value={option}>{option}</option>
		{/each}
	</select>
</div>

<style>
	.container {
		display: block;
		text-align: center;
		height: 50%;
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
		text-align: start;
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
</style>
