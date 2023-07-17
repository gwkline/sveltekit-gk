<script lang="ts">
	import type { IconDefinition } from '@fortawesome/free-solid-svg-icons';
	import Fa from 'svelte-fa';
	export let icon: IconDefinition | null;
	export let text = '';
	export let style = '';
	export let collapsed = false;
	export let onclick = () => {};
	export let disabled = true;
	export let image_src = '';
</script>

<button
	class="default fill {image_src == '' ? 'active' : ''} noOutline {style} {collapsed
		? 'iconOnly'
		: ''} {disabled == true ? 'disabled' : ''}"
	on:click={onclick}
>
	{#if image_src == ''}
		<div class="tooltip">
			<row>
				<Fa {icon} style={collapsed ? '' : 'margin-right: 1.5rem'} />
				{collapsed ? '' : text}
			</row>
			{#if collapsed == true}
				<span class="tooltip-text">{text}</span>
			{/if}
		</div>
	{:else}
		<img src={image_src} style="width: 30px;" alt="secret" />
	{/if}
</button>

<style>
	button {
		width: 100%;
		height: 50px;
		font-family: inherit;
		display: inline-flex;
		border: 1px solid transparent;
		flex-direction: row;
		justify-content: left;
		align-items: center;
		gap: 8px;
		border-radius: 7px;
		padding-left: 30px;
		cursor: pointer;
	}

	button.disabled {
		opacity: 0.3;
		cursor: not-allowed;
	}

	.settings {
		border-top: 1px solid var(--light-gray-1);
		border-bottom: 1px solid var(--light-gray-1);
		border-radius: 0;
	}

	.tooltip {
		position: relative;
		display: inline-block;
	}

	/* Tooltip text */
	.tooltip .tooltip-text {
		visibility: hidden;
		width: 120px;
		background-color: black;
		color: #fff;
		text-align: center;
		padding: 5px 0;
		border-radius: 6px;
		position: absolute;
		z-index: 1;
	}

	button:hover .tooltip-text {
		visibility: visible;
	}

	button.default {
		background: var(--sidebar-background);
		color: var(--off-black);
	}

	button.default.active:hover {
		background: var(--light-gray-1);
	}

	button.default.active:active {
		-webkit-box-shadow: inset 0px 0px 5px #b6b6b6;
		-moz-box-shadow: inset 0px 0px 5px #b6b6b6;
		box-shadow: inset 0px 0px 5px #b6b6b6;
		outline: none;
	}

	button.iconOnly {
		padding: 15px 15px;
		justify-content: center;
		align-items: center;
		text-align: center;
	}
</style>
