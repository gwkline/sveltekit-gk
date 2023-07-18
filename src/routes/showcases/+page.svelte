<script lang="ts">
	import Button from '$lib/Button.svelte';

	import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';

	import ButtonShowcase from './ButtonShowcase.svelte';
	let visibleButton = false;
	export let toggleButtonShowcase = () => {
		visibleButton = !visibleButton;
	};

	import DropdownShowcase from './DropdownShowCase.svelte';
	let visibleDropdown = false;
	export let toggleDropdownShowcase = () => {
		visibleDropdown = !visibleDropdown;
	};

	import ControlShowcase from './ControlShowcase.svelte';
	let visibleControls = false;
	export let toggleControlShowcase = () => {
		visibleControls = !visibleControls;
	};

	import InputShowcase from './InputShowcase.svelte';
	import TextShowcase from './TextShowcase.svelte';
	let visibleInputs = false;
	let visibleText = false;
	export let toggleInputShowcase = () => {
		visibleInputs = !visibleInputs;
	};
	export let toggleTextShowcase = () => {
		visibleText = !visibleText;
	};
</script>

<div class="content">
	<row>
		{#if visibleButton}
			<Button
				variant="default"
				size="sm"
				outline="noOutline"
				icon={faEyeSlash}
				onclick={toggleButtonShowcase}>Hide Button Showcase</Button
			>
		{:else}
			<Button
				variant="default"
				size="sm"
				outline="noOutline"
				icon={faEye}
				onclick={toggleButtonShowcase}>Show Button Showcase</Button
			>
		{/if}

		{#if visibleDropdown}
			<Button
				variant="default"
				size="sm"
				outline="noOutline"
				icon={faEyeSlash}
				onclick={toggleDropdownShowcase}>Hide Dropdown Showcase</Button
			>
		{:else}
			<Button
				variant="default"
				size="sm"
				outline="noOutline"
				icon={faEye}
				onclick={toggleDropdownShowcase}>Show Dropdown Showcase</Button
			>
		{/if}
		{#if visibleControls}
			<Button
				variant="default"
				size="sm"
				outline="noOutline"
				icon={faEyeSlash}
				onclick={toggleControlShowcase}>Hide Control Showcase</Button
			>
		{:else}
			<Button
				variant="default"
				size="sm"
				outline="noOutline"
				icon={faEye}
				onclick={toggleControlShowcase}>Show Control Showcase</Button
			>
		{/if}

		{#if visibleInputs}
			<Button
				variant="default"
				size="sm"
				outline="noOutline"
				icon={faEyeSlash}
				onclick={toggleInputShowcase}>Hide Input Showcase</Button
			>
		{:else}
			<Button
				variant="default"
				size="sm"
				outline="noOutline"
				icon={faEye}
				onclick={toggleInputShowcase}>Show Input Showcase</Button
			>
		{/if}

		{#if visibleText}
			<Button
				variant="default"
				size="sm"
				outline="noOutline"
				icon={faEyeSlash}
				onclick={toggleTextShowcase}>Hide Text Showcase</Button
			>
		{:else}
			<Button
				variant="default"
				size="sm"
				outline="noOutline"
				icon={faEye}
				onclick={toggleTextShowcase}>Show Text Showcase</Button
			>
		{/if}
	</row>

	{#if visibleControls}
		<ControlShowcase />
	{/if}

	{#if visibleInputs}
		<InputShowcase />
	{/if}

	{#if visibleButton}
		<ButtonShowcase />
	{/if}

	{#if visibleDropdown}
		<DropdownShowcase />
	{/if}

	{#if visibleText}
		<TextShowcase />
	{/if}
</div>
<div style="margin-top: 20px;" />

<style>
	row {
		display: flex;
		flex-direction: row;
		align-items: center;
		justify-content: center;
	}

	::-webkit-scrollbar {
		width: 0px;
		background: transparent;
	}
</style>
