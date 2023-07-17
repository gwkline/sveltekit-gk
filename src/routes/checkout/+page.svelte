<script lang="ts">
	import Nav from './Nav.svelte';
	import Table from '$lib/Table.svelte';
	import StatusBar from './StatusBar.svelte';
	import { onMount, onDestroy } from 'svelte';
	import {
		verboseTasks,
		filteredTasks,
		selectedState,
		searchValue,
		settings,
		selectedTags,
		showTags,
		validAccessToken,
		accessTokenExpiration
	} from '../../datastore';
	import { makeRequest } from '../../helpers';
	import type { Task, EventData, HeaderConfigType } from '../../types';
	import Tags from '$lib/Tags.svelte';
	import { browser } from '$app/environment';

	let eventSource: EventSource;

	const updateTasks = (updatedTasks: EventData[]) => {
		updatedTasks.forEach((newTaskData) => {
			let id = newTaskData['data']['id'];
			let status = newTaskData['data']['status'];
			let state = newTaskData['data']['state'];

			// Update the status of the task with the given id
			verboseTasks.update((tasks) => {
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
		});
	};

	// On component mount
	onMount(() => {
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

	// On component destroy
	onDestroy(() => {
		// Close the connection to the event stream
		if (eventSource) {
			eventSource.close();
		}
	});

	if (Object.keys($settings).length === 0) {
		let method = 'get';
		let url = 'http://127.0.0.1:23432/settings';

		makeRequest(method, url, null, (response) => {
			settings.set(response.data);
		});
	}

	makeRequest('get', 'http://127.0.0.1:23432/tasks?type=checkout', null, (response) => {
		let data = response.data;
		let cleanedData = data.map((task: Task) => {
			let account = task['account'];
			task['account'] = {
				id: account['id'],
				username: account['username'],
				proxy: account['proxy'],
				profile: {
					id: account['profile']['id'],
					name: account['profile']['name'],
					tags: account['profile']['tags'],
					payment: {
						id: account['profile']['payment']['id'],
						tags: account['profile']['payment']['tags']
					}
				}
			};
			return task;
		});
		verboseTasks.set(cleanedData);
	});

	let headerConfig: HeaderConfigType<Task> = {
		SKU: (task: Task) => task?.product?.product_id ?? '',
		Account: (task: Task) => task?.account?.username ?? '',
		Proxy: (task: Task) => task?.account?.proxy ?? '',
		Profile: (task: Task) => task?.account?.profile?.name ?? '',
		Browser: (task: Task) =>
			task?.browser_type == 'Default' ? $settings?.browser ?? '' : task?.browser_type ?? '',
		Status: (task: Task) => task?.status ?? ''
	};

	let filterOn: boolean;
	$: if (
		($filteredTasks.length > 0 && $filteredTasks.length < $verboseTasks.length) ||
		$selectedTags.length > 0 ||
		$selectedState != '' ||
		$searchValue != ''
	) {
		filterOn = true;
	} else {
		filterOn = false;
	}
</script>

<StatusBar />
<Nav />
{#if $showTags} <Tags /> {/if}
<div class="container">
	<Table tableData={filterOn ? $filteredTasks : $verboseTasks} {headerConfig} />
</div>

<style>
	.container {
		flex-grow: 1;
		overflow-y: auto;
		scroll-behavior: smooth;
	}
</style>
