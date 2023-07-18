<script lang="ts">
	import Sidebar from '$lib/Sidebar.svelte';
	import ThemeToggle from '$lib/ThemeToggle.svelte';
	import { browser } from '$app/environment';
	import { onMount } from 'svelte';
	import {
		accessDenied,
		accessTokenExpiration,
		filteredTasks,
		networkError,
		searchValue,
		selectedState,
		selectedTags,
		shiftPressed,
		sidebarCollapsed,
		sortState,
		validAccessToken,
		verboseTasks
	} from '../datastore';
	import { findMemberships } from '../helpers';
	import UpdateBar from '$lib/UpdateBar.svelte';

	export const ssr = false;
	export const prerender = true;

	const handleKeydown = (event: KeyboardEvent) => {
		if (event.key === 'Shift') {
			shiftPressed.set(true);
		}
	};
	const handleKeyup = (event: KeyboardEvent) => {
		if (event.key === 'Shift') {
			shiftPressed.set(false);
		}
	};

	onMount(() => {
		if (browser && (!$validAccessToken || $accessTokenExpiration < Date.now())) {
			findMemberships().then((memberships) => {
				if (!memberships.some((membership) => membership.valid)) {
					return Promise.resolve();
				} else {
					validAccessToken.set(true);
					accessTokenExpiration.set(Date.now() + 60 * 60 * 1000);
				}
			});
		}
	});

	const clearFilters = () => {
		selectedTags.set([]);
		selectedState.set('');
		searchValue.set('');
		filteredTasks.set([]);
		sortState.set({ column: null, direction: 0 });
	};

	let filterOn: boolean;
	$: if (
		($filteredTasks.length > 0 && $filteredTasks.length < $verboseTasks.length) ||
		$selectedTags.length > 0 ||
		$selectedState != '' ||
		$searchValue != '' ||
		$sortState.column != null
	) {
		filterOn = true;
	} else {
		filterOn = false;
	}

	import { dev } from '$app/environment';
	import { inject } from '@vercel/analytics';

	inject({ mode: dev ? 'development' : 'production' });
</script>

<head>
	<link rel="stylesheet" href="" />
</head>

<svelte:window on:keydown={handleKeydown} on:keyup={handleKeyup} />
<Sidebar />
<ThemeToggle />

<div class="{$sidebarCollapsed ? 'collapsed' : ''} master-container">
	{#if !$validAccessToken || $accessTokenExpiration < Date.now() / 1000}
		<UpdateBar>
			<p>
				You are in sandbox mode. If you are a PE user and would like to use the full functionality,
				please sign in on the <a href="/dashboard">dashboard.</a>
			</p>
		</UpdateBar>
	{/if}
	{#if filterOn}
		<UpdateBar>
			You're viewing a filtered set of tasks. To clear all filters, <button
				on:click={clearFilters}
				class="nav-button">click here.</button
			>
		</UpdateBar>
	{/if}
	{#if $accessDenied}
		<UpdateBar color="var(--danger-red)"
			>Please go to your Project Enigma dashboard and click "use this key" to continue using the bot</UpdateBar
		>
	{/if}
	{#if $networkError}
		<UpdateBar color="var(--danger-red)"
			>Please make sure your Project Enigma is running and that you are connected to the internet.</UpdateBar
		>
	{/if}
	<div class="border-card">
		<slot />
	</div>
</div>

<style lang="css" global>
	@import 'https://fonts.googleapis.com/css?family=Roboto';
	@import '/global.css';

	.nav-button {
		background: none;
		outline: none;
		border: none;
		color: var(--off-black);
	}

	.nav-button:hover {
		color: var(--light-gray-3);
	}

	* {
		font-family: Roboto;
	}

	.master-container {
		position: relative;
		right: 0;
		margin-left: 225px;
		height: 100%;
		width: calc(100% - 230px);
		display: flex;
		flex-direction: column;
	}

	.master-container.collapsed {
		margin-left: 50px;
		width: calc(100% - 60px);
	}

	.border-card {
		background-color: var(--background);
		border: 1px solid var(--light-gray-3);
		margin: 10px 10px 10px 10px;
		padding: 20px 50px;
		position: relative;
		top: 5px;
		bottom: 5px;
		left: 5px;
		right: 5px;
		height: 100%;
		border-radius: 8px;
		overflow-y: hidden;
		overflow-x: hidden;
		display: flex;
		flex-direction: column;
	}
</style>
