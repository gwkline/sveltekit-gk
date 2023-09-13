<script lang="ts">
	import Fa from 'svelte-fa';
	import { faCog, type IconDefinition } from '@fortawesome/free-solid-svg-icons';

	type ButtonVariants = 'default' | 'primary' | 'danger' | 'warning' | 'success';
	type ButtonSizes = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
	type Shape = 'rectangle' | 'square' | 'circle';
	type OutlineType = 'outline' | 'noOutline';

	export let variant: ButtonVariants = 'default';
	export let size: ButtonSizes = 'md';
	export let icon: IconDefinition | null = null;
	export let shape: Shape = 'rectangle';
	export let outline: OutlineType = 'noOutline';
	export let onclick: (event: MouseEvent) => void = () => {};
	export let alternate = false;
	export let isLoading = false;
	export let resizable = false;
	export let disabled = false;
	export let shadow = true;
	export let style = '';

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
	<button {style} {disabled} class={classString} on:click|preventDefault={handleClick}>
		{#if isLoading}
			<Fa icon={faCog} {size} spin />
		{:else}
			{#if icon && !(size === 'xs' && resizable)}
				<Fa {icon} {size} />
			{/if}
			{#if $$slots.default && !resizable && !(shape == 'circle' || shape == 'square')}
				<slot />
			{/if}
		{/if}
	</button>
</div>

<style>
	button {
		width: auto;
		font-family: inherit;
		border: 1px solid transparent;
		border-radius: 7px;
		cursor: pointer;
		justify-content: center;
		align-items: center;
		text-align: center;
		display: flex;
		text-wrap: nowrap;
		background: var(--background);
	}

	.outline {
		outline: 1px solid var(--light-gray-3);
	}

	.noOutline {
		outline: none;
	}

	.circle {
		border-radius: 50%;
	}

	button:disabled {
		opacity: 0.3;
		cursor: not-allowed;
	}

	/* Color Settings */

	button.default {
		color: var(--off-black);
	}

	button.primary {
		color: var(--primary);
	}

	button.danger {
		color: var(--danger-red);
	}

	button.success {
		color: var(--success-green);
	}

	button.warning {
		color: var(--warning-yellow);
	}

	button.primary.alternate,
	button.danger.alternate,
	button.success.alternate,
	button.warning.alternate {
		color: var(--white);
	}

	button.default.alternate {
		color: var(--background);
		background: var(--off-black);
	}

	button.primary.alternate {
		background: var(--primary);
	}

	button.danger.alternate {
		background: var(--danger-red);
	}

	button.success.alternate {
		background: var(--success-green);
	}

	button.warning.alternate {
		background: var(--warning-yellow);
	}

	button.default:hover,
	button.primary:hover,
	button.success:hover,
	button.warning:hover {
		background: var(--light-gray-1);
	}

	button.danger:hover {
		background: var(--danger-red-hover);
		color: var(--white);
	}

	button.default.alternate:hover {
		background: var(--gray);
	}

	button.primary.alternate:hover {
		background: var(--primary-hover);
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
	button.danger:active {
		background: #79071a;
	}
	/* Click Indication */
	button.default:active,
	button.success:active,
	button.warning:active {
		-webkit-box-shadow: inset 0px 0px 5px #b6b6b6;
		-moz-box-shadow: inset 0px 0px 5px #b6b6b6;
		box-shadow: inset 0px 0px 5px #b6b6b6;
		outline: none;
	}

	button.primary:active,
	button.danger:active {
		-webkit-box-shadow: inset 0px 0px 7px #000e30;
		-moz-box-shadow: inset 0px 0px 7px #000e30;
		box-shadow: inset 0px 0px 7px #000e30;
		outline: none;
	}

	@media (max-width: 1280px) {
		button.sm.resizable {
			padding: 7px 7px;
		}

		button.md.resizable {
			padding: 10px 10px;
		}

		button.lg.resizable {
			padding: 15px 15px;
		}
	}

	/* SIZING CLASSES */
	button.xs {
		font-weight: 400;
		font-size: 12px;
		padding: 3px 15px;
		gap: 7px;
	}

	button.sm {
		font-weight: 500;
		font-size: 13px;
		padding: 3px 15px;
		gap: 9px;
	}

	button.md {
		font-weight: 500;
		font-size: 14px;
		padding: 6px 20px;
		gap: 11px;
	}

	button.lg {
		font-weight: 700;
		font-size: 15px;
		padding: 10px 25px;
		gap: 13px;
	}

	.iconOnly.sm {
		padding: 7px;
	}

	.iconOnly.md {
		padding: 10px;
	}

	.iconOnly.lg {
		padding: 15px;
	}

	.circle.xs,
	.square.xs {
		padding: 5px;
	}

	.circle.sm,
	.square.sm {
		padding: 10px;
	}

	.circle.md,
	.square.md {
		padding: 15px;
	}

	.circle.lg,
	.square.lg {
		padding: 20px;
	}

	.shadow {
		box-shadow:
			var(--shadow-1) 0px 0px 0px 0px,
			var(--shadow-2) 0px 1px 1px 0px,
			var(--shadow-3) 0px 0px 0px 1px,
			var(--shadow-4) 0px 2px 5px 0px;
		transition: all 0.15s ease;
	}

	.shadow:hover {
		box-shadow:
			var(--shadow-1) 0px 0px 0px 0px,
			var(--shadow-2) 0px 1px 1px 0px,
			var(--shadow-3) 0px 2px 5px 0px,
			var(--shadow-4) 0px 2px 5px 0px;
	}
</style>
