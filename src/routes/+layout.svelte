<script lang="ts">
	import Sidebar from '$lib/Sidebar.svelte';
	import UpdateBar from '$lib/UpdateBar.svelte';
	import ThemeToggle from '$lib/ThemeToggle.svelte';
	import { inject } from '@vercel/analytics';
	import {
		findMemberships,
		getAccounts,
		getActivityTasks,
		getCheckoutTasks,
		getNACTasks,
		getPayments,
		getProfiles,
		getProxies,
		getSchedules,
		getSettings,
		getWins
	} from '../helpers';
	import { browser, dev } from '$app/environment';
	import { onDestroy, onMount } from 'svelte';
	import {
		accessDenied,
		accessTokenExpiration,
		networkError,
		shiftPressed,
		sidebarCollapsed,
		validAccessToken,
		verboseActivityTasks,
		verboseNacTasks,
		verboseTasks
	} from '../datastore';
	import type { Writable } from 'svelte/store';
	import type { EventData, VerboseTask } from '../types';
	import { onNavigate } from '$app/navigation';

	onNavigate((navigation) => {
		if (!document.startViewTransition) return;

		return new Promise((resolve) => {
			document.startViewTransition(async () => {
				resolve();
				await navigation.complete;
			});
		});
	});

	let eventSource: EventSource;

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

	getSettings();
	getActivityTasks();
	getSchedules();
	getNACTasks();
	getAccounts();
	getCheckoutTasks();
	getPayments();
	getProfiles();
	getProxies();
	getWins();
	getSchedules();

	// On component mount
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

		if (browser && $validAccessToken && $accessTokenExpiration > Date.now() / 1000) {
			// Connect to the event stream
			eventSource = new EventSource('http://localhost:23432/tasks/status?stream=messages');

			// Listen for messages
			eventSource.onmessage = (event) => {
				const data = JSON.parse(event.data);
				updateTasks(data);
			};

			// Handle any error that may occur
			eventSource.onerror = (error) => {
				console.error('EventSource failed:', error);
				eventSource.close();
			};
		}
	});

	const updateTasks = (updatedTasks: EventData[]) => {
		updatedTasks.forEach((newTaskData) => {
			let id = newTaskData['data']['id'];
			let status = newTaskData['data']['status'];
			let state = newTaskData['data']['state'];

			let store: Writable<VerboseTask[]> | undefined;
			if (newTaskData['type'] === 'Task') {
				store = verboseTasks;
			} else if (newTaskData['type'] === 'AccountActivity') {
				store = verboseActivityTasks;
			} else if (newTaskData['type'] === 'AccountCreation') {
				store = verboseNacTasks;
			}

			if (store) {
				// Update the status of the task with the given id
				store.update((tasks: VerboseTask[]) => {
					const taskIndex = tasks.findIndex((task) => task['id'] == id);
					if (
						taskIndex !== -1 &&
						(tasks[taskIndex]['status'] !== status || tasks[taskIndex]['state'] !== state)
					) {
						const updatedTasks = [...tasks];
						updatedTasks[taskIndex]['status'] = status;
						updatedTasks[taskIndex]['state'] = state;
						return updatedTasks;
					}
					return tasks;
				});
			}
		});
	};

	// On component destroy
	onDestroy(() => {
		// Close the connection to the event stream
		if (eventSource) {
			eventSource.close();
		}
	});

	inject({ mode: dev ? 'development' : 'production' });
</script>

<head>
	<link rel="stylesheet" href="" />
</head>

<svelte:window on:keydown={handleKeydown} on:keyup={handleKeyup} />
<Sidebar />
<ThemeToggle />

<div class="{$sidebarCollapsed ? 'collapsed' : ''} master-container">
	{#if !$validAccessToken}
		<UpdateBar>
			<p>
				You are in sandbox mode. If you are a PE user and would like to use the full functionality,
				please sign in on the <a href="/dashboard">dashboard.</a>
			</p>
		</UpdateBar>
	{/if}
	{#if $accessDenied}
		<UpdateBar color="var(--danger-red)"
			>Please go to your Project Enigma dashboard and click "use this key" to continue using the bot</UpdateBar
		>
	{/if}
	{#if $networkError}
		<UpdateBar color="var(--danger-red)"
			>Please make sure your Project Enigma is running, your extension is enabled, and that you are
			connected to the internet.</UpdateBar
		>
	{/if}
	{#if $accessTokenExpiration < Date.now() / 1000 && $accessTokenExpiration != -1}
		<UpdateBar color="var(--danger-red)"
			>Your authorization has expired. Please refresh the page to continue using the bot
		</UpdateBar>
	{/if}
	<div class="border-card">
		<slot />
	</div>
</div>

<style lang="css" global>
	@import 'https://fonts.googleapis.com/css?family=Roboto';

	* {
		font-family: Roboto;
	}

	.master-container {
		position: relative;
		right: 0;
		margin-left: 170px;
		height: 100%;
		display: flex;
		flex-direction: column;
		margin-right: 10px;
	}

	.master-container.collapsed {
		margin-left: 50px;
	}

	.border-card {
		background-color: var(--background);
		border: 1px solid var(--light-gray-3);
		margin: 10px;
		padding: 10px 50px;
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

	@keyframes fade-in {
		from {
			opacity: 0;
		}
	}

	@keyframes fade-out {
		to {
			opacity: 0;
		}
	}

	@keyframes slide-from-right {
		from {
			transform: translateX(30px);
		}
	}

	@keyframes slide-to-left {
		to {
			transform: translateX(-30px);
		}
	}

	:root::view-transition-old(root) {
		animation:
			90ms cubic-bezier(0.4, 0, 1, 1) both fade-out,
			300ms cubic-bezier(0.4, 0, 0.2, 1) both slide-to-left;
	}

	:root::view-transition-new(root) {
		animation:
			210ms cubic-bezier(0, 0, 0.2, 1) 90ms both fade-in,
			300ms cubic-bezier(0.4, 0, 0.2, 1) both slide-from-right;
	}
</style>
