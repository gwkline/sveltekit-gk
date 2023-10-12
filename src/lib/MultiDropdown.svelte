<script lang="ts">
	import Fa from 'svelte-fa';
	import Button from '$lib/Button.svelte';
	import Checkbox from '$lib/Checkbox.svelte';
	import Input from '$lib/Input.svelte';
	import { createEventDispatcher } from 'svelte';
	import {
		faChevronDown,
		faChevronUp,
		type IconDefinition
	} from '@fortawesome/free-solid-svg-icons';

	export let title = '';
	export let style = '';
	export let disabled = false;
	export let open = false;
	export let options: string[];
	export let outline = false;
	export let shadow = true;
	export let titlePosition: 'top' | 'center' = 'center';

	const dispatch = createEventDispatcher();
	let buttonText: string;
	let filterText = '';
	let dropdownEl: HTMLElement;
	let chevronIcon: IconDefinition;
	let selectedOptions = options.reduce((acc: Record<string, boolean>, option: string) => {
		acc[option] = false;
		return acc;
	}, {});

	const toggleOption = (option: string) => {
		selectedOptions[option] = !selectedOptions[option];

		let selectedKeys = Object.keys(selectedOptions).filter((key) => selectedOptions[key]);
		dispatch('update', { selected: selectedKeys });
	};

	const handleClickOutside = (event: MouseEvent) => {
		if (!dropdownEl.contains(event.target as Node)) {
			open = false;
		}
	};

	$: chevronIcon = open ? faChevronUp : faChevronDown;
	$: filteredOptions = Object.keys(selectedOptions).filter((option) =>
		option.toLowerCase().includes(filterText.toLowerCase())
	);
	$: buttonText = `${title} ${Object.keys(selectedOptions)
		.filter((option) => selectedOptions[option])
		.join(', ')}`;
	$: if (disabled) {
		open = false;
	}
	let id = '';
</script>

<svelte:window on:click={handleClickOutside} />
<div class="container">
	{#if title !== '' && titlePosition === 'top'}
		<label for={id} class={`label`}>{title}</label>
	{/if}
	<button class="dropdown" bind:this={dropdownEl} on:click|stopPropagation {id}>
		<Button
			style="width:200px; height: 40px; margin-right: 0px;"
			onclick={() => (open = !open)}
			{disabled}
		>
			{#if title !== '' && titlePosition === 'center'}
				<div class="disabled-overlay">{buttonText}</div>
			{/if}
		</Button>
		<div class="dropdown-caret">
			<Fa icon={chevronIcon} size="xs" />
		</div>
		{#if open}
			<div class={`dropdown-menu ${outline ? 'outline' : ''} ${shadow ? 'shadow' : ''}`}>
				<div class="input-container">
					<Input
						bind:value={filterText}
						placeholder="Filter options"
						style="width: 100%; border-radius: 0;"
						outline="noOutline"
						shadow={false}
					/>
				</div>

				{#each filteredOptions as option}
					<button
						class="dropdown-item {style}"
						tabindex="0"
						on:click={() => toggleOption(option)}
						on:keydown={(e) => {
							if (e.key === 'Enter') toggleOption(option);
						}}
					>
						<Checkbox checked={selectedOptions[option]} mini={true} />
						{option}
					</button>
				{/each}
			</div>
		{/if}
	</button>
</div>

<style>
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
	.dropdown {
		display: inline-block;
		position: relative;
		background: var(--light-gray-1);
		color: inherit;
		border: none;
		padding: 0;
	}
	.dropdown-caret {
		width: 0;
		height: 0;
		position: absolute;
		top: 12px;
		right: 13px;
	}

	.dropdown-menu {
		position: absolute;
		width: 200px;
		box-shadow: 0px 1px 0px 0px rgba(27, 31, 35, 0.04);
		border-radius: 7px;
		background: var(--background);
		margin-top: 5px;
		max-height: 300px;
		overflow: scroll;
		scroll-behavior: smooth;
	}

	.ouline {
		border: 1px solid var(--light-gray-4);
	}

	.dropdown-item {
		display: flex;
		align-items: center;
		gap: 8px;
		cursor: pointer;
		padding-left: 10px;
		transition: background 0.3s;
		width: 100%;
		height: 30px;
		font-size: 13px;
		background-color: inherit;
		color: inherit;
		border: none;
	}

	.dropdown-item:hover {
		background: var(--light-gray-2);
	}

	.input-container {
		margin-bottom: 5px;
	}
	.container {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: left;
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
