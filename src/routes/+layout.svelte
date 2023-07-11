<script lang="ts">
	import Sidebar from '../lib/Sidebar.svelte';
	import ThemeToggle from '../lib/ThemeToggle.svelte';
	import { shiftPressed, sidebarCollapsed } from '../datastore';

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
</script>

<head>
	<link rel="stylesheet" href="/global.css" />
	<link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Roboto" />
</head>

<svelte:window on:keydown={handleKeydown} on:keyup={handleKeyup} />
<Sidebar />
<ThemeToggle />
<div class="{$sidebarCollapsed ? 'collapsed' : ''} container">
	<div class="border-card">
		<slot />
	</div>
</div>

<style>
	* {
		font-family: Roboto;
	}

	.container {
		position: relative; /* Or absolute, or fixed, depending on your needs */
		right: 0;
		margin-left: 225px;
		height: 100%;
		width: calc(
			100% - 230px
		); /* This will ensure the width of container is always the full width minus the left margin */
		display: flex;
		flex-direction: column;
	}

	.container.collapsed {
		margin-left: 50px;
		width: calc(100% - 60px); /* Update this too, to take into account the changed left margin */
	}

	.border-card {
		background-color: var(--background);
		border: 1px solid var(--light-gray-3);
		margin: 10px 10px 10px 10px; /* Change the bottom margin value here */
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
