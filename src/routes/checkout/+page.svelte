<script lang="ts">
	import CheckoutNav from './CheckoutNav.svelte';
	import Tags from '$lib/Tags.svelte';
	import Table from '$lib/Table.svelte';
	import TableRow from '$lib/TableRow.svelte';
	import StatusBar from '../../lib/StatusBar.svelte';
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

	let allTags: string[] = [];
	let tagsCount: { tag: string; count: number }[] = [];
	let totalSelectedTasks: number = 0;

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

	const updateSearchValue = (e: CustomEvent) => {
		searchValue.set(e.detail);
	};

	const updateSelectedTags = (e: CustomEvent) => {
		const tag: string | string[] = e.detail;
		if (typeof tag === 'string') {
			// if the tag is already selected, remove it from selectedTags
			// otherwise, add it to selectedTags
			const index = $selectedTags.indexOf(tag);
			if (index > -1) {
				selectedTags.set($selectedTags.filter((t) => t !== tag));
			} else {
				selectedTags.set([...$selectedTags, tag]);
			}
		} else {
			// user wants to select all tags or no tags
			selectedTags.set(tag);
		}
	};

	const deleteSelectedTags = (e: CustomEvent) => {
		$selectedTags.forEach((tag) => removeTag(tag));
		selectedTags.set([]); // Clear selection after deleting
	};

	const deleteSelectedTasks = (e: CustomEvent) => {
		$selectedTags.forEach((tag) => removeTaskWithTag(tag));
		selectedTags.set([]); // Clear selection after deleting
	};

	const removeTaskWithTag = (tag: string) => {
		let taskIdsToRemove: number[] = [];

		verboseTasks.update((tasks) => {
			return tasks.filter((task) => {
				let taskHasTag = task.tags.some((t) => t.name === tag);
				let removingNoTags = $selectedTags.includes('No Tags') && task.tags.length === 0;

				if (taskHasTag || removingNoTags) {
					// add task id to array of task ids to remove
					taskIdsToRemove.push(task.id);
					// filter out this task
					return false;
				}

				// keep this task in the array
				return true;
			});
		});

		if (taskIdsToRemove.length > 0) {
			makeRequest(
				'delete',
				'http://127.0.0.1:23432/tasks?type=checkout',
				taskIdsToRemove,
				() => {}
			);
		}
	};

	const removeTag = (tag: string) => {
		let tasksToUpdate: Task[] = [];

		verboseTasks.update((tasks) => {
			return tasks.map((task) => {
				// check if task contains the tag
				let taskHasTag = task.tags.some((t) => t.name === tag);

				if (taskHasTag) {
					// remove the tag from this task
					task.tags = task.tags.filter((t) => t.name !== tag);

					// add task to array of tasks to update
					tasksToUpdate.push(task);
				}

				// return the potentially modified task
				return task;
			});
		});

		if (tasksToUpdate.length > 0) {
			makeRequest('put', 'http://127.0.0.1:23432/tasks?type=checkout', tasksToUpdate);
		}
	};

	const updateTagNames = (e: CustomEvent) => {
		// Do not proceed with the function if the editedText is empty
		let editedText = e.detail;

		let updatedTasks: Task[] = [];
		verboseTasks.update((tasks) => {
			return tasks.map((task) => {
				let taskHasSelectedTag = task.tags.some((t) => $selectedTags.includes(t.name));

				// If the "No Tags" tag is being edited and the task has no tags
				if ($selectedTags.includes('No Tags') && task.tags.length === 0) {
					// Add the new tag
					task.tags.push({ name: editedText });

					// Add the task to the updatedTasks array
					updatedTasks.push(task);
				}
				// If the task has a selected tag
				else if (taskHasSelectedTag) {
					// Update the name of the tag
					task.tags = task.tags.map((t) =>
						$selectedTags.includes(t.name) ? { ...t, name: editedText } : t
					);

					// Add the task to the updatedTasks array
					updatedTasks.push(task);
				}

				return task;
			});
		});

		if (updatedTasks.length > 0) {
			makeRequest('put', 'http://127.0.0.1:23432/tasks?type=checkout', updatedTasks);
		}

		selectedTags.set([]);
	};

	const addAdditionalTag = (e: CustomEvent) => {
		let updatedTasks: Task[] = [];
		let newTagText = e.detail;

		verboseTasks.update((tasks) => {
			return tasks.map((task) => {
				let taskHasSelectedTag = task.tags.some((t) => $selectedTags.includes(t.name));

				// If the "No Tags" tag is selected and the task has no tags
				if ($selectedTags.includes('No Tags') && task.tags.length === 0) {
					task.tags.push({ name: newTagText });
					updatedTasks.push(task);
				}

				// If the task has a selected tag
				if (taskHasSelectedTag) {
					// Add the new tag to the task
					task.tags.push({ name: newTagText });

					// Add the task to the updatedTasks array
					updatedTasks.push(task);
				}

				return task;
			});
		});

		if (updatedTasks.length > 0) {
			makeRequest('put', 'http://127.0.0.1:23432/tasks?type=checkout', updatedTasks);
		}
		selectedTags.set([]);
	};

	const addTagToTasks = (e: CustomEvent) => {
		let newTagText = e.detail;
		let updatedTasks: Task[] = [];
		verboseTasks.update((tasks) => {
			return tasks.map((task) => {
				if ($checkedCheckoutTasks.includes(task.id)) {
					task.tags.push({ name: newTagText });
					updatedTasks.push(task);
				}
				return task;
			});
		});
		if (updatedTasks.length > 0) {
			makeRequest('put', 'http://127.0.0.1:23432/tasks?type=checkout', updatedTasks);
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

	$: {
		allTags = $verboseTasks
			.map((task) => task.tags)
			.flat()
			.map((tag) => tag.name)
			.filter((tag) => tag);

		let uniqueTags = [...new Set(allTags)];

		tagsCount = uniqueTags.map((tag) => {
			return {
				tag: tag,
				count: allTags.filter((t) => t === tag).length
			};
		});

		// Count the number of accounts without any tags
		let noTagsCount = $verboseTasks.filter((account) => account.tags.length === 0).length;

		// Add a "No Tags" tag if there are any accounts without tags
		if (noTagsCount > 0) {
			tagsCount.unshift({ tag: 'No Tags', count: noTagsCount });
		}
	}

	$: {
		// Get all tasks with selected tags, but don't count a task more than once
		const selectedTasks = new Set();
		if ($selectedTags.length > 0) {
			$verboseTasks.forEach((task) => {
				const taskTags = task.tags.map((t) => t.name);
				if ($selectedTags.some((tag) => taskTags.includes(tag))) {
					selectedTasks.add(task.id);
				}

				// If the "No Tags" tag is selected, add tasks that have no tags
				if ($selectedTags.includes('No Tags') && task.tags.length === 0) {
					selectedTasks.add(task.id);
				}
			});
		}
		totalSelectedTasks = selectedTasks.size;
	}
</script>

<StatusBar
	on:selectedState={updateSelectedState}
	tasks={$filteredTasks}
	selectedState={$selectedState}
/>
<CheckoutNav on:searchValue={updateSearchValue} searchValue={$searchValue} />
{#if $showTags}
	<Tags
		{tagsCount}
		totalSelectedItems={totalSelectedTasks}
		selectedTags={$selectedTags}
		checkedItems={$checkedCheckoutTasks}
		on:selectTag={updateSelectedTags}
		on:deleteSelectedTags={deleteSelectedTags}
		on:deleteSelectedTasks={deleteSelectedTasks}
		on:updateTagNames={updateTagNames}
		on:addAdditionalTag={addAdditionalTag}
		on:addTagToTasks={addTagToTasks}
	/>
{/if}
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
