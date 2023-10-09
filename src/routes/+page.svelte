<script lang="ts">
	import Button from '$lib/Button.svelte';

	import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';

	import ButtonShowcase from '$lib/Showcases/ButtonShowcase.svelte';
	let visibleButton = false;
	export let toggleButtonShowcase = () => {
		visibleButton = !visibleButton;
	};

	import DropdownShowcase from '$lib/Showcases/DropdownShowCase.svelte';
	let visibleDropdown = false;
	export let toggleDropdownShowcase = () => {
		visibleDropdown = !visibleDropdown;
	};

	import ControlShowcase from '$lib/Showcases/ControlShowcase.svelte';
	let visibleControls = false;
	export let toggleControlShowcase = () => {
		visibleControls = !visibleControls;
	};

	import InputShowcase from '$lib/Showcases/InputShowcase.svelte';
	import TextShowcase from '$lib/Showcases/TextShowcase.svelte';
	let visibleInputs = false;
	let visibleText = false;
	export let toggleInputShowcase = () => {
		visibleInputs = !visibleInputs;
	};
	export let toggleTextShowcase = () => {
		visibleText = !visibleText;
	};
</script>

<div class="home">
	<h1>Welcome to Keyplank</h1>
	<p>
		This is an experimental UI design for automated retail software. While this is meant to be
		hooked up to the backend of a bot, I've added some seed data so you can get a feel for how the
		components are designed.
	</p>
	<p>
		The current implementation is built on Sveltekit with Typescript. If you're interested in seeing
		how this was built, you can check out the source code here:
		<a href="https://github.com/gwkline/sveltekit-gk" target="_blank" rel="noopener noreferrer"
			>https://github.com/gwkline/sveltekit-gk</a
		>. This was done without a designer, and with almost zero prior knowledge of Svelte/Sveltekit,
		so I'd love to hear if you have any feedback or input. Feel free to reach out on Discord: gkline
	</p>
	<p>To get started, head over to the main <a href="/checkout">Checkout Tasks</a> page</p>
</div>

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

<style>
	.home {
		padding: 1em;
		max-width: 900px;
		margin: 0 auto;
	}

	h1 {
		color: var(--off-black);
		font-size: 2em;
		text-align: center;
		margin-bottom: 1em;
	}

	p {
		color: var(--gray);
		font-size: 1.2em;
		line-height: 1.5;
		margin-bottom: 1em;
	}

	a {
		color: #0077cc;
	}

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
