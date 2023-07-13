<script lang="ts">
	import { onMount } from 'svelte';
	import Fa from 'svelte-fa';
	import type { IconDefinition } from '@fortawesome/free-solid-svg-icons';
	import { faCog } from '@fortawesome/free-solid-svg-icons';
	import { browser } from '$app/environment';

	export let variant = 'default';
	export let status = 'active';
	export let size = 'md';
	export let icon: IconDefinition | null = null;
	export let outline = 'outline';
	export let shape = '';
	export let onclick: (event: MouseEvent) => void = () => {};
	export let alternate = '';
	export let style = '';
	export let isLoading = false;
	export let resizable = false;
	export let type: ButtonTypes = 'button';

	type ButtonTypes = 'button' | 'submit' | 'reset';

	let open = false;
	let innerWidth = 0;
	let x: MediaQueryList;

	function handleClick(event: MouseEvent) {
		if (isLoading || status === 'disabled') {
			open = false;
			return;
		}
		if (typeof onclick === 'function') {
			onclick(event);
		}
	}

	if (browser) {
		onMount(() => {
			innerWidth = window.innerWidth;
			x = window.matchMedia('(max-width: 980px)');
		});
	}
</script>

<svelte:window bind:innerWidth />

<div class="container">
	<button
		{type}
		class="{variant} {size} {status} {isLoading || (icon && !$$slots.default) ? 'iconOnly' : ''} 
            {outline} {shape} {alternate} {resizable ? 'resizable' : ''}"
		{style}
		on:click|preventDefault={handleClick}
		disabled={isLoading}
	>
		{#if isLoading}
			<Fa icon={faCog} spin />
		{:else}
			<div class="button-content">
				{#if icon && !(size === 'xs' && x && x.matches && resizable)}
					<Fa {icon} class={$$slots.default ? 'icon-with-text' : 'icon-only'} />
				{/if}
				{#if $$slots.default && !(resizable && x && x.matches)}
					<slot />
				{/if}
			</div>
		{/if}
	</button>
</div>

<style>
	.icon-only {
		margin: 0 auto;
	}

	.icon-with-text {
		margin-right: 0.5rem;
	}
	.force-horizontal {
		overflow: auto;
		white-space: nowrap;
	}

	button {
		/* Auto layout */
		width: auto;
		font-family: inherit;
		border: 1px solid transparent;
		border-radius: 7px;
		margin-right: 10px;
	}

	.square-button {
		width: 30px;
		height: 30px;
		padding: 0 !important;
	}

	button.fill {
		/* Force the button to fill the container of the div */
		width: 100%;
		height: 100%;
	}

	button.danger.active:active {
		background: #79071a;
	}

	/* Icon-only sizing */

	button.iconOnly.sm {
		padding: 7px 7px;
		justify-content: center;
		align-items: center;
		text-align: center;
	}

	button.iconOnly.md {
		padding: 10px 10px;
		justify-content: center;
		align-items: center;
		text-align: center;
	}

	button.iconOnly.lg {
		padding: 15px 15px;
		justify-content: center;
		align-items: center;
		text-align: center;
	}

	button.outline {
		border-color: var(--light-gray-4);
		border-width: 1px;
		border-style: solid;
		box-shadow: 0px 1px 0px 0px rgba(27, 31, 35, 0.04);
	}

	button.sm {
		font-weight: 500;
		font-size: 13px;
		padding: 3px 15px;
	}

	button.md {
		font-weight: 500;
		font-size: 14px;
		padding: 6px 20px;
	}

	button.lg {
		font-size: 15px;
		font-weight: 700;
		padding: 10px 25px;
	}

	button.circle {
		border-radius: 50%;
	}

	button.disabled {
		opacity: 0.3;
		cursor: not-allowed;
	}

	/* Color Settings */

	button.default {
		background: var(--background);
		color: var(--off-black);
	}

	button.primary {
		background: var(--primary);
		color: var(--white);
	}

	button.secondary {
		background: var(--background);
		color: var(--primary);
	}

	button.danger {
		background: var(--background);
		color: var(--danger-red);
	}

	button.success {
		background: var(--background);
		color: var(--success-green);
	}

	button.warning {
		background: var(--background);
		color: var(--warning-yellow);
	}

	button.default.alternate {
		color: var(--background);
		background: var(--off-black);
	}

	button.danger.alternate {
		color: var(--background);
		background: var(--danger-red);
	}

	button.success.alternate {
		color: var(--background);
		background: var(--success-green);
	}

	button.warning.alternate {
		color: var(--background);
		background: var(--warning-yellow);
	}

	button.default.active:hover,
	button.secondary.active:hover,
	button.success.active:hover,
	button.warning.active:hover {
		background: var(--light-gray-2);
	}

	button.primary.active:hover {
		background: var(--primary-hover);
	}

	button.danger.active:hover {
		background: var(--danger-red-hover);
		color: var(--white);
	}

	button.default.alternate.active:hover {
		background: var(--gray);
	}

	button.danger.alternate.active:hover {
		background: var(--danger-red-hover);
	}

	button.success.alternate.active:hover {
		background: var(--success-green-hover);
	}

	button.warning.alternate.active:hover {
		background: var(--warning-yellow-hover);
	}

	/* Click Indication */
	button.default.active:active,
	button.secondary.active:active,
	button.success.active:active,
	button.warning.active:active {
		transition: 0s;
		-webkit-box-shadow: inset 0px 0px 5px #b6b6b6;
		-moz-box-shadow: inset 0px 0px 5px #b6b6b6;
		box-shadow: inset 0px 0px 5px #b6b6b6;
		outline: none;
	}

	button.primary.active:active,
	button.danger.active:active {
		transition: 0s;
		-webkit-box-shadow: inset 0px 0px 7px #000e30;
		-moz-box-shadow: inset 0px 0px 7px #000e30;
		box-shadow: inset 0px 0px 7px #000e30;
		outline: none;
	}

	@media (max-width: 1280px) {
		button.sm.resizable {
			padding: 7px 7px;
			justify-content: center;
			align-items: center;
			text-align: center;
		}

		button.md.resizable {
			padding: 10px 10px;
			justify-content: center;
			align-items: center;
			text-align: center;
		}

		button.lg.resizable {
			padding: 15px 15px;
			justify-content: center;
			align-items: center;
			text-align: center;
		}
	}
</style>
