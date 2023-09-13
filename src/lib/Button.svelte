<script lang="ts">
	import Fa from 'svelte-fa';
	import { faCog, type IconDefinition } from '@fortawesome/free-solid-svg-icons';

	type ButtonVariants = 'default' | 'primary' | 'secondary' | 'danger' | 'warning' | 'success';
	type ButtonTypes = 'button' | 'submit' | 'reset';
	type ButtonSizes = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
	type Shape = 'rectangle' | 'square' | 'circle';
	type OutlineType = 'outline' | 'noOutline';

	export let variant: ButtonVariants = 'default';
	export let size: ButtonSizes = 'md';
	export let icon: IconDefinition | null = null;
	export let type: ButtonTypes = 'button';
	export let shape: Shape = 'rectangle';
	export let outline: OutlineType = 'noOutline';
	export let onclick: (event: MouseEvent) => void = () => {};
	export let alternate = false;
	export let style = '';
	export let isLoading = false;
	export let resizable = false;
	export let disabled = false;
	export let shadow = true;

	function handleClick(event: MouseEvent) {
		if (isLoading || disabled) {
			return;
		}
		onclick(event);
	}

	let classString: string = '';
	$: {
		let classes: string[] = [variant, size];
		if (isLoading || (icon && !$$slots.default)) classes.push('iconOnly');
		if (outline === 'outline') classes.push('outline');
		if (shadow) classes.push('shadow');
		classes.push(shape);
		if (alternate) classes.push('alternate');
		if (resizable) classes.push('resizable');
		if (shape === 'circle' || shape === 'square') {
			classes.push('center-icon');
		}

		classString = classes.join(' ');
	}
</script>

<div class="container">
	<button {type} {style} {disabled} class={classString} on:click|preventDefault={handleClick}>
		{#if isLoading}
			<Fa icon={faCog} {size} spin />
		{:else}
			{#if icon && !(size === 'xs' && resizable)}
				<Fa {icon} {size} class={$$slots.default ? 'icon-with-text' : 'icon-only'} />
			{/if}
			{#if $$slots.default && !resizable && !(shape == 'circle' || shape == 'square')}
				<slot />
			{/if}
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
	.center-icon {
		display: flex;
		justify-content: center;
		align-items: center;
	}

	button {
		width: auto;
		font-family: inherit;
		border: 1px solid transparent;
		border-radius: 7px;
		margin-right: 10px;
	}

	.square {
		width: 30px;
		height: 30px;
		padding: 0 !important;
	}

	button.fill {
		/* Force the button to fill the container of the div */
		width: 100%;
		height: 100%;
	}

	button.danger:active {
		background: #79071a;
	}

	/* Icon-only sizing */

	button.iconOnly {
		justify-content: center;
		align-items: center;
		text-align: center;
	}

	button.outline {
		border-color: var(--white);
		border-width: 1px;
		border-style: solid;
		box-shadow: 0px 1px 0px 0px rgba(27, 31, 35, 0.04);
	}

	button.noOutline {
		border: none;
		outline: none;
	}

	button.circle {
		border-radius: 50%;
	}

	button:disabled {
		background: var(--light-gray-3) !important;
		outline: 1px solid var(--light-gray-4) !important;
		color: var(--gray) !important;
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
		color: var(--white);
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

	button.default:hover,
	button.secondary:hover,
	button.success:hover,
	button.warning:hover {
		background: var(--light-gray-1);
	}

	button.primary:hover {
		background: var(--primary-hover);
	}

	button.danger:hover {
		background: var(--danger-red-hover);
		color: var(--white);
	}

	button.default.alternate:hover {
		background: var(--gray);
	}

	button.danger.alternate:hover {
		background: var(--danger-red-hover);
	}

	button.success.alternate:hover {
		background: var(--success-green-hover);
	}

	button.warning.alternate:hover {
		background: var(--warning-yellow-hover);
	}

	/* Click Indication */
	button.default:active,
	button.secondary:active,
	button.success:active,
	button.warning:active {
		transition: 0s;
		-webkit-box-shadow: inset 0px 0px 5px #b6b6b6;
		-moz-box-shadow: inset 0px 0px 5px #b6b6b6;
		box-shadow: inset 0px 0px 5px #b6b6b6;
		outline: none;
	}

	button.primary:active,
	button.danger:active {
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

	/* Add your styles for smaller screen sizes here */
	@media (max-width: 980px) {
		button.iconOnly.xs.resizable {
			padding: 7px 7px;
			justify-content: center;
			align-items: center;
			text-align: center;
		}

		button.iconOnly.md.resizable {
			padding: 10px 10px;
			justify-content: center;
			align-items: center;
			text-align: center;
		}

		button.iconOnly.lg.resizable {
			padding: 15px 15px;
			justify-content: center;
			align-items: center;
			text-align: center;
		}
	}

	/* SIZING CLASSES */

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

	button.circle.xs {
		width: 20px;
		height: 20px;
	}

	button.circle.sm {
		width: 30px;
		height: 30px;
	}

	button.circle.md {
		width: 40px;
		height: 40px;
	}

	button.circle.lg {
		width: 50px;
		height: 50px;
	}

	button.circle.xl {
		width: 60px;
		height: 60px;
	}

	button.iconOnly.sm {
		padding: 7px 7px;
	}

	button.iconOnly.md {
		padding: 10px 10px;
	}

	button.iconOnly.lg {
		padding: 15px 15px;
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
