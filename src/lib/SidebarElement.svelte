<script lang="ts">
	import Fa from 'svelte-fa';
	import { goto } from '$app/navigation';
	import type { IconDefinition } from '@fortawesome/free-solid-svg-icons';
	export let icon: IconDefinition | null;
	export let text = '';
	export let style = '';
	export let collapsed = false;
	export let disabled = true;
	export let image_src = '';
	export let page: string | null;
	export let onclick = () => {};

	const redirect = () => {
		if (!disabled) {
			goto(`/${page}`);
		}
	};
</script>

<button
	class="{style} {disabled == true ? 'disabled' : ''} {collapsed ? 'collapsed' : ''}"
	on:click={page != null ? redirect : onclick}
>
	{#if image_src == ''}
		<div class="icon-wrapper">
			<Fa {icon} />
		</div>
		<span style="z-index: 2; text-wrap: nowrap; align-text: center;">
			{collapsed ? '' : text}
		</span>
		{#if collapsed == true}
			<span class="tooltip-text">{text}</span>
		{/if}
	{:else}
		<img src={image_src} style={collapsed ? '' : 'margin-right: 10px'} alt="secret" />
	{/if}
</button>

<style>
	button {
		background: transparent;
		color: var(--off-black);
		border-radius: 6px;
		width: 100%;
		height: 45px;
		font-family: inherit;
		display: flex;
		border: 1px solid transparent;
		flex-direction: row;
		justify-content: start;
		align-items: center;
		cursor: pointer;
		position: inherit;
		z-index: 5;
		transition: all 0.3s ease-in-out;
		padding-left: 20px;
	}

	button.collapsed {
		padding-left: 5px;
		justify-content: center;
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
	.tooltip-text {
		visibility: hidden;
		width: 120px;
		background-color: black;
		color: #fff;
		text-align: center;
		padding: 5px 0;
		border-radius: 6px;
		position: absolute;
		left: 50px;
		z-index: 5;
	}

	button:hover .tooltip-text {
		visibility: visible;
	}

	button:hover {
		background: var(--light-gray-2);
	}

	button:active {
		-webkit-box-shadow: inset 0px 0px 5px #b6b6b6;
		-moz-box-shadow: inset 0px 0px 5px #b6b6b6;
		box-shadow: inset 0px 0px 5px #b6b6b6;
		outline: none;
		background: var(--light-gray-2);
	}

	img {
		width: 30px;
	}

	.icon-wrapper {
		width: 30px;
		height: 30px;
		display: flex;
		justify-content: center;
		align-items: center;
		flex-grow: 0;
	}
</style>
