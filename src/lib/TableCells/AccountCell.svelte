<script lang="ts">
	import Tooltip from '$lib/Tooltip.svelte';
	import { faCreditCard, faUser, faUserSlash } from '@fortawesome/free-solid-svg-icons';
	import Fa from 'svelte-fa';
	import { privacy } from '../../datastore';

	export let value: string = '';
	export let loggedIn: boolean | null;
	export let sameName: boolean = false;
</script>

<div class="container">
	<div class="username {$privacy ? 'blur' : ''}">
		<span>{value.split('@')[0]}</span>
		<span class="bottom-text">{'@' + value.split('@')[1]}</span>
	</div>
	<div class="icons">
		{#if loggedIn}
			<Tooltip text="Account has a valid session">
				<Fa icon={faUser} color="var(--primary)" />
			</Tooltip>
		{:else if loggedIn === false}
			<Tooltip text="Account has a valid session">
				<Fa icon={faUserSlash} color="var(--danger-red)" />
			</Tooltip>
		{/if}
		{#if sameName}
			<Tooltip text="Checkout will use account first/last name">
				<Fa icon={faCreditCard} color="var(--light-gray-4)" />
			</Tooltip>
		{/if}
	</div>
</div>

<style>
	.container {
		display: flex;
		flex-direction: row;
		align-items: left;
		justify-content: left;
	}
	.blur {
		filter: blur(4px);
	}
	.icons {
		display: flex;
		flex-direction: row;
		padding-left: 10px;
		align-items: center;
		gap: 10px;
	}
	.username {
		display: flex;
		flex-direction: column;
	}
	.bottom-text {
		display: block;
		font-size: 11px;
		color: #888;
	}
</style>
