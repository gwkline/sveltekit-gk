<script lang="ts">
	import Button from './Button.svelte';
	import Checkbox from './Checkbox.svelte';
	import { createEventDispatcher } from 'svelte';
	import Fa from 'svelte-fa';
	import {
		faChevronDown,
		faChevronUp,
		type IconDefinition
	} from '@fortawesome/free-solid-svg-icons';

	export let title = '';
	export let style = '';
	export let status = 'active';
	export let open = false;
	export let options: string[];

	let selectedOptions = options.reduce((acc: Record<string, boolean>, option: string) => {
		acc[option] = false;
		return acc;
	}, {});

	let buttonText: string;
	$: buttonText = `${title} ${Object.keys(selectedOptions)
		.filter((option) => selectedOptions[option])
		.join(', ')}`;

	$: if (status === 'disabled') {
		open = false;
	}

	const dispatch = createEventDispatcher();

	const toggleOption = (option: string) => {
		selectedOptions[option] = !selectedOptions[option];

		let selectedKeys = Object.keys(selectedOptions).filter((key) => selectedOptions[key]);
		dispatch('update', { selected: selectedKeys });
	};

	let dropdownEl: HTMLElement;

	function handleClickOutside(event: MouseEvent) {
		if (!dropdownEl.contains(event.target as Node)) {
			open = false;
		}
	}

	let chevronIcon: IconDefinition;
	$: chevronIcon = open ? faChevronUp : faChevronDown;

	let filterText = '';

	$: filteredOptions = Object.keys(selectedOptions).filter((option) =>
		option.toLowerCase().includes(filterText.toLowerCase())
	);
</script>

<svelte:window on:click={handleClickOutside} />

<!-- svelte-ignore a11y-click-events-have-key-events -->
<div class="dropdown" bind:this={dropdownEl} on:click|stopPropagation role="button" tabindex="-1">
	<Button style="width:200px; height: 40px;" onclick={() => (open = !open)} {status}
		>{buttonText}</Button
	>
	<div class="dropdown-caret">
		<Fa icon={chevronIcon} size="xs" />
	</div>
	{#if open}
		<div class="dropdown-menu">
			<input type="text" bind:value={filterText} placeholder="Filter options" />

			{#each filteredOptions as option}
				<!-- svelte-ignore a11y-no-noninteractive-tabindex -->
				<div
					role="button"
					class="dropdown-item {style}"
					tabindex="0"
					on:click={() => toggleOption(option)}
					on:keydown={(e) => {
						if (e.key === 'Enter') toggleOption(option);
					}}
				>
					<Checkbox checked={selectedOptions[option]} option="mini" />
					{option}
				</div>
			{/each}
		</div>
	{/if}
</div>

<style>
	.dropdown {
		display: inline-block;
		position: relative;
		background-color: var(--background);
	}
	.dropdown-caret {
		width: 0;
		height: 0;
		position: absolute;
		top: 10px;
		right: 30px;
	}

	.dropdown-menu {
		position: absolute;
		width: 200px;
		border: 1px solid var(--light-gray-4);
		box-shadow: 0px 1px 0px 0px rgba(27, 31, 35, 0.04);
		border-radius: 7px;
		background: var(--background);
		margin-top: 5px;
		max-height: 300px;
		overflow: scroll;
		scroll-behavior: smooth;
	}

	.dropdown-menu input {
		width: 100%;
		margin-bottom: 10px;
	}

	.dropdown-item {
		display: flex;
		align-items: center;
		gap: 8px;
		cursor: pointer;
		padding-left: 10px;
		transition: background 0.3s;
		width: 200px;
		height: 30px;
		font-size: 13px;
	}

	.dropdown-item:hover {
		background: var(--light-gray-4);
	}
</style>
