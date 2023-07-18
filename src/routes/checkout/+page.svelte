<script lang="ts">
	import CheckoutNav from './CheckoutNav.svelte';
	import Tags from '$lib/Tags.svelte';
	import Table from '$lib/Table.svelte';
	import TableRow from '../../lib/TableRow.svelte';
	import StatusBar from './StatusBar.svelte';
	import { makeRequest } from '../../helpers';
	import { browser } from '$app/environment';
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
		accessTokenExpiration,
		sortState,
		checkedAllCheckoutTasks,
		checkedCheckoutTasks
	} from '../../datastore';
	import type { Task, EventData, HeaderConfigType, TableRowType } from '../../types';

	let eventSource: EventSource;
	let tableData: TableRowType[] = [];
	let tableIds: number[] = [];
	let headers: string[] = [];
	let headerConfig: HeaderConfigType<Task> = {
		SKU: (task: Task) => task?.product?.product_id ?? '',
		Account: (task: Task) => task?.account?.username ?? '',
		Proxy: (task: Task) => task?.account?.proxy ?? '',
		Profile: (task: Task) => task?.account?.profile?.name ?? '',
		Browser: (task: Task) =>
			task?.browser_type == 'Default' ? $settings?.browser ?? '' : task?.browser_type ?? '',
		Status: (task: Task) => task?.status ?? ''
	};

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

	makeRequest('get', 'http://127.0.0.1:23432/settings', null, (response) => {
		settings.set(response.data);
	});

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

	const updateSortState = (e: CustomEvent) => {
		sortState.update((currentState) => {
			let newDirection: 0 | 1 | -1 = 1;
			let newColumn: string | null = e.detail;
			if (currentState.column === e.detail) {
				// Click on same column
				if (currentState.direction === 1) {
					// Change direction if currently ascending
					newDirection = -1;
				} else if (currentState.direction === -1) {
					// Remove sorting if currently descending
					newDirection = 0;
					newColumn = null;
				}
			}
			return { column: newColumn, direction: newDirection };
		});
	};

	const updateCheckedAll = (e: CustomEvent) => {
		checkedAllCheckoutTasks.set(e.detail.checked);

		if (e.detail.checked) {
			let allIds = $verboseTasks.map((task) => task.id);
			checkedCheckoutTasks.set(allIds);
		} else {
			checkedCheckoutTasks.set([]);
		}
	};

	const updateSelectedState = (e: CustomEvent) => {
		if ($selectedState === e.detail) {
			selectedState.set('');
		} else {
			selectedState.set(e.detail);
		}
	};

	$: {
		let filtered = $verboseTasks.filter((task) => {
			// Keyword Search
			let keywordMatch = true;
			if ($searchValue !== '') {
				keywordMatch = JSON.stringify(task).toLowerCase().includes($searchValue.toLowerCase());
			}

			// Tag Filtering
			let tagMatch;
			if ($selectedTags.includes('No Tags')) {
				tagMatch =
					task.tags.length === 0 ||
					$selectedTags.some((tag) => task.tags.map((tagObj) => tagObj.name).includes(tag));
			} else {
				tagMatch =
					$selectedTags.length === 0 ||
					$selectedTags.some((tag) => task.tags.map((tagObj) => tagObj.name).includes(tag));
			}

			// State Filtering
			let stateMatch = !$selectedState || task.state === $selectedState;
			return keywordMatch && tagMatch && stateMatch;
		});

		filteredTasks.set(filtered);

		headers = Object.keys(headerConfig);
		tableIds = [];

		let tableDataShortenedTemp = filtered.map((row) => {
			const rowObject: TableRowType = {};
			for (const header of headers) {
				rowObject[header] = headerConfig[header](row);
			}
			tableIds.push(row.id);
			return rowObject;
		});

		if (typeof $sortState.column === 'string') {
			// Get the getter function for the sort column
			const getSortValue = headerConfig[$sortState.column];
			const indices = tableDataShortenedTemp.map((_, index) => index); // Initialize indices array

			indices.sort((aIndex, bIndex) => {
				// Use the getter function to extract the sort value
				const aValue = getSortValue(filtered[aIndex]).toLowerCase();
				const bValue = getSortValue(filtered[bIndex]).toLowerCase();

				if (aValue < bValue) {
					return $sortState.direction === 1 ? -1 : 1;
				}
				if (aValue > bValue) {
					return $sortState.direction === 1 ? 1 : -1;
				}
				return 0;
			});

			// Sort the tableDataShortenedTemp array and the tableIds array according to the sorted indices
			tableDataShortenedTemp = indices.map((index) => tableDataShortenedTemp[index]);
			tableIds = indices.map((index) => tableIds[index]);
		}

		tableData = tableDataShortenedTemp;
	}
</script>

<StatusBar
	on:selectedState={updateSelectedState}
	tasks={$filteredTasks}
	selectedState={$selectedState}
/>
<CheckoutNav />
{#if $showTags} <Tags /> {/if}
<div class="container">
	<Table
		{tableData}
		{headers}
		{tableIds}
		sortState={$sortState}
		checkedAll={$checkedAllCheckoutTasks}
		on:sort={updateSortState}
		on:checkedAll={updateCheckedAll}
		let:row
		let:index
		let:itemId
	>
		<TableRow {row} {index} {itemId} />
	</Table>
</div>

<style>
	.container {
		flex-grow: 1;
		overflow-y: auto;
		scroll-behavior: smooth;
	}
</style>
