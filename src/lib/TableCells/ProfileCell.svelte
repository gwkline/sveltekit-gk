<script lang="ts">
	import Tooltip from '$lib/Tooltip.svelte';
	import { faCreditCard } from '@fortawesome/free-solid-svg-icons';
	import Fa from 'svelte-fa';

	export let profileName: string;
	export let profileTags = '';
	export let sameName: boolean;
</script>

<div class="container">
	{#if sameName}
		<Tooltip text="Checkout will use account first/last name">
			<Fa icon={faCreditCard} />
		</Tooltip>
	{/if}
	<div class="username">
		<span>{profileName}</span>
		<span class="bottom-text">{profileTags}</span>
	</div>
</div>

<style>
	.container {
		display: flex;
		flex-direction: row;
		align-items: center;
	}
	.username {
		display: flex;
		flex-direction: column;
		margin-left: 10px;
	}
	.bottom-text {
		display: block;
		font-size: 11px;
		color: #888;
	}
</style>
