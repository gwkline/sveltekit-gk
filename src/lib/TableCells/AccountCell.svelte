<script lang="ts">
	import Tooltip from '$lib/Tooltip.svelte';
	import { faUser, faUserSlash } from '@fortawesome/free-solid-svg-icons';
	import Fa from 'svelte-fa';

	export let value: string = '';
	export let loggedIn: boolean | null;
</script>

<div class="container">
	{#if loggedIn}
		<Tooltip text="Account has a valid session">
			<Fa icon={faUser} color="var(--primary)" />
		</Tooltip>
	{:else if loggedIn === false}
		<Tooltip text="Account has a valid session">
			<Fa icon={faUserSlash} color="var(--danger-red)" />
		</Tooltip>
	{/if}

	<div class="username">
		<span>{value.split('@')[0]}</span>
		<span class="bottom-text">{'@' + value.split('@')[1]}</span>
	</div>
</div>

<style>
	.container {
		display: flex;
		flex-direction: row;
		align-items: left;
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
