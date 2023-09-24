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

<style>
	button {
		width: auto;
		font-family: Roboto;
		font-style: normal;
		border: 1px solid var(--light-gray-1);
		border-radius: 6px;
		cursor: pointer;
		justify-content: center;
		align-items: center;
		text-align: center;
		display: flex;
		text-wrap: nowrap;
		background: var(--light-gray-1);
		will-change: background-color, border-color, box-shadow;
		transition: all 0.15s ease;
	}

	.outline {
		border: 1px solid var(--light-gray-4, #e0e0e0);
	}

	.noOutline {
		border: 1px solid var(--light-gray-1);
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

	.alternate {
		border: 1px solid rgba(0, 0, 0, 0.14);
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
	button.danger:hover,
	button.primary:hover,
	button.success:hover,
	button.warning:hover {
		border: 1px solid var(--gray, #f2f2f2);
	}

	button.danger:hover {
		background: var(--danger-red-hover);
		color: var(--white);
	}

	button.default.alternate:hover {
		background: var(--gray);
	}

	button.primary.alternate:hover {
		background: var(--primary-hover, #4842c4);
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
	button.primary:active,
	button.success:active,
	button.warning:active {
		-webkit-box-shadow: inset 0px 0px 5px #b6b6b6;
		-moz-box-shadow: inset 0px 0px 5px #b6b6b6;
		box-shadow: inset 0px 0px 5px #b6b6b6;
		border: solid 1px var(--light-gray-1);
	}

	button.danger:active {
		-webkit-box-shadow: inset 0px 0px 7px #000e30;
		-moz-box-shadow: inset 0px 0px 7px #000e30;
		box-shadow: inset 0px 0px 7px #000e30;
		border: solid 1px var(--light-gray-1);
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
	.xs {
		font-weight: 400;
		font-size: 12px;
		padding: 3px 15px;
		gap: 7px;
	}

	.sm {
		font-weight: 600;
		line-height: 15px;
		padding: 3px 15px;
		gap: 9px;
	}

	.md {
		font-weight: 500;
		font-size: 14px;
		padding: 6px 20px;
		gap: 11px;
	}

	.lg {
		font-weight: 700;
		font-size: 15px;
		padding: 10px 25px;
		gap: 13px;
	}

	.circle.xs,
	.square.xs {
		padding: 5px !important;
	}

	.circle.sm,
	.square.sm {
		padding: 10px !important;
	}

	.circle.md,
	.square.md {
		padding: 15px !important;
	}

	.circle.lg,
	.square.lg {
		padding: 20px !important;
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
