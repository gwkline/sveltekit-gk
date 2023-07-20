<script lang="ts">
	import CheckoutNav from './CheckoutNav.svelte';
	import Tags from '$lib/Tags.svelte';
	import Table from '$lib/Table.svelte';
	import TableRow from '$lib/TableRow.svelte';
	import StatusBar from '../../lib/StatusBar.svelte';
	import ConfirmationModal from '$lib/ConfirmationModal.svelte';
	import { makeRequest } from '../../helpers';
	import {
		verboseTasks,
		searchValue,
		settings,
		showTags,
		sortState,
		shiftPressed,
		isLoading
	} from '../../datastore';
	import type { Task, HeaderConfigType, TableRowType, State, Settings } from '../../types';
	import TaskModalHelper from './TaskModalHelper.svelte';
	import UpdateBar from '$lib/UpdateBar.svelte';

	type settings = 'max_active_tasks' | 'max_starting_tasks';
	type states = 'start' | 'stop' | 'delete' | 'duplicate' | 'edit' | 'create';
	let showModal = false;
	let showConfirmationModal = false;
	let isEditing = false;
	let isDuplicating = false;
	let buttonTextCount: string;
	let selectedTags: string[] = [];
	let selectedState: State | '' = '';
	let filterOn: boolean = false;
	let lastChecked: number | null = null;
	let secondLastChecked: number | null = null;
	let checkedAll: boolean = false;
	let checkedCheckoutTasks: number[] = [];
	let filteredTasks: Task[] = [];
	let tableData: TableRowType[] = [];
	let tableIds: number[] = [];
	let allTags: string[] = [];
	let tagsCount: { tag: string; count: number }[] = [];
	let totalSelectedTasks: number = 0;
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
				tags: account['tags'],
				profile: {
					id: account['profile']['id'],
					name: account['profile']['name'],
					tags: account['profile']['tags'],
					payment: {
						id: account['profile']['payment']['id'],
						tags: account['profile']['payment']['tags'],
						card_name: account['profile']['payment']['card_name']
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
		checkedAll = e.detail.checked;

		if (e.detail.checked) {
			let allIds = $verboseTasks.map((task) => task.id);
			checkedCheckoutTasks = allIds;
		} else {
			checkedCheckoutTasks = [];
		}
	};

	const updateSelectedState = (e: CustomEvent) => {
		if (selectedState === e.detail) {
			selectedState = '';
		} else {
			selectedState = e.detail;
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
			const index = selectedTags.indexOf(tag);
			if (index > -1) {
				selectedTags = selectedTags.filter((t) => t !== tag);
			} else {
				selectedTags = [...selectedTags, tag];
			}
		} else {
			// user wants to select all tags or no tags
			selectedTags = tag;
		}
	};

	const deleteSelectedTags = (e: CustomEvent) => {
		selectedTags.forEach((tag) => removeTag(tag));
		selectedTags = []; // Clear selection after deleting
	};

	const deleteSelectedTasks = (e: CustomEvent) => {
		selectedTags.forEach((tag) => removeTaskWithTag(tag));
		selectedTags = []; // Clear selection after deleting
	};

	const removeTaskWithTag = (tag: string) => {
		let taskIdsToRemove: number[] = [];

		verboseTasks.update((tasks) => {
			return tasks.filter((task) => {
				let taskHasTag = task.tags.some((t) => t.name === tag);
				let removingNoTags = selectedTags.includes('No Tags') && task.tags.length === 0;

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
				let taskHasSelectedTag = task.tags.some((t) => selectedTags.includes(t.name));

				// If the "No Tags" tag is being edited and the task has no tags
				if (selectedTags.includes('No Tags') && task.tags.length === 0) {
					// Add the new tag
					task.tags.push({ name: editedText });

					// Add the task to the updatedTasks array
					updatedTasks.push(task);
				}
				// If the task has a selected tag
				else if (taskHasSelectedTag) {
					// Update the name of the tag
					task.tags = task.tags.map((t) =>
						selectedTags.includes(t.name) ? { ...t, name: editedText } : t
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

		selectedTags = [];
	};

	const addAdditionalTag = (e: CustomEvent) => {
		let updatedTasks: Task[] = [];
		let newTagText = e.detail;

		verboseTasks.update((tasks) => {
			return tasks.map((task) => {
				let taskHasSelectedTag = task.tags.some((t) => selectedTags.includes(t.name));

				// If the "No Tags" tag is selected and the task has no tags
				if (selectedTags.includes('No Tags') && task.tags.length === 0) {
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
		selectedTags = [];
	};

	const addTagToTasks = (e: CustomEvent) => {
		let newTagText = e.detail;
		let updatedTasks: Task[] = [];
		verboseTasks.update((tasks) => {
			return tasks.map((task) => {
				if (checkedCheckoutTasks.includes(task.id)) {
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

	const handleChecked = (e: CustomEvent) => {
		let itemId: number = e.detail;

		secondLastChecked = lastChecked;
		lastChecked = itemId;

		let arrayOfTaskIndexes = checkedCheckoutTasks;
		if (checkedCheckoutTasks.includes(itemId)) {
			arrayOfTaskIndexes.splice(arrayOfTaskIndexes.indexOf(itemId), 1);
		} else {
			arrayOfTaskIndexes.push(itemId);
		}
		checkedCheckoutTasks = arrayOfTaskIndexes;

		if ($shiftPressed && lastChecked === itemId && secondLastChecked !== null) {
			let start = Math.min(lastChecked, secondLastChecked);
			let end = Math.max(lastChecked, secondLastChecked);

			for (let i = start + 1; i < end; i++) {
				let taskWithThisId = $verboseTasks.find((task) => task.id === i);
				if (taskWithThisId && !checkedCheckoutTasks.includes(taskWithThisId.id)) {
					checkedCheckoutTasks.push(i);
				}
			}
		}
	};

	const handleTask = (e: CustomEvent) => {
		console.log('hey');
		let taskId: number | null = e.detail;
		let taskIds: number[];
		let state = e.type as states;
		isLoading.set({ [state]: true });

		if (taskId) {
			taskIds = [taskId];
		} else {
			let all = $shiftPressed || checkedCheckoutTasks.filter((item) => item != -1).length === 0;
			taskIds = all ? $verboseTasks.map((task) => task.id) : checkedCheckoutTasks;
		}

		switch (state) {
			case 'start':
				makeRequest('post', `http://127.0.0.1:23432/tasks/start?type=undefined`, taskIds);
				break;
			case 'stop':
				taskIds = taskIds.filter((id) => {
					const task = $verboseTasks.find((task: Task) => task.id === id);
					return task && task.state !== 'Ready';
				});
				if (taskIds.length === 0) {
					// If there are no valid tasks to stop, don't proceed.
					isLoading.set({ [state]: false });
					return;
				}
				makeRequest('post', `http://127.0.0.1:23432/tasks/stop?type=undefined`, taskIds);
				break;
			case 'delete':
				makeRequest('delete', `http://127.0.0.1:23432/tasks?type=checkout`, taskIds, () => {
					// Update verboseTasks by filtering out the tasks that were deleted
					verboseTasks.update((tasks) => {
						return tasks.filter((task) => taskId != task.id);
					});

					// Reset checkedCheckoutTasks
					checkedCheckoutTasks = [];
				});
				break;
			case 'edit':
				if (taskId) {
					checkedCheckoutTasks = [taskId];
				}
				isEditing = true;
				showModal = true;
				break;
			case 'create':
				isEditing = false;
				showModal = true;
				break;
			case 'duplicate':
				isEditing = true;
				isDuplicating = true;
				showModal = true;
				break;
		}

		isLoading.set({ [state]: false });
	};

	const clearFilters = () => {
		selectedTags = [];
		selectedState = '';
		searchValue.set('');
		filteredTasks = [];
		sortState.set({ column: null, direction: 0 });
	};

	const saveSettings = (e: CustomEvent) => {
		let settingKey = e.detail.name as settings;
		let value = e.detail.value;

		settings.update((currentSettings) => {
			let newSettings = currentSettings as Settings;

			newSettings[settingKey] = value ? parseInt(value) : newSettings[settingKey];
			return newSettings;
		});

		const url = 'http://127.0.0.1:23432/settings';
		const method = 'put';

		return makeRequest(method, url, $settings);
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
			if (selectedTags.includes('No Tags')) {
				tagMatch =
					task.tags.length === 0 ||
					selectedTags.some((tag) => task.tags.map((tagObj) => tagObj.name).includes(tag));
			} else {
				tagMatch =
					selectedTags.length === 0 ||
					selectedTags.some((tag) => task.tags.map((tagObj) => tagObj.name).includes(tag));
			}

			// State Filtering
			let stateMatch = !selectedState || task.state === selectedState;
			return keywordMatch && tagMatch && stateMatch;
		});

		filteredTasks = filtered;

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
		if (selectedTags.length > 0) {
			$verboseTasks.forEach((task) => {
				const taskTags = task.tags.map((t) => t.name);
				if (selectedTags.some((tag) => taskTags.includes(tag))) {
					selectedTasks.add(task.id);
				}

				// If the "No Tags" tag is selected, add tasks that have no tags
				if (selectedTags.includes('No Tags') && task.tags.length === 0) {
					selectedTasks.add(task.id);
				}
			});
		}
		totalSelectedTasks = selectedTasks.size;
	}

	$: {
		let items = checkedCheckoutTasks;
		if ($shiftPressed || items.length == 0) {
			buttonTextCount = 'All';
		} else if (items.length == $verboseTasks.length) {
			buttonTextCount = `All (${items.length})`;
		} else {
			buttonTextCount = `${items.length}`;
		}
	}

	$: {
		if (
			(filteredTasks.length > 0 && filteredTasks.length < $verboseTasks.length) ||
			selectedTags.length > 0 ||
			selectedState != '' ||
			$searchValue != '' ||
			$sortState.column != null
		) {
			filterOn = true;
		} else {
			filterOn = false;
		}
	}
</script>

{#if filterOn}
	<UpdateBar>
		You're viewing a filtered set of tasks. To clear all filters, <button
			on:click={clearFilters}
			class="nav-button">click here.</button
		>
	</UpdateBar>
{/if}

<StatusBar tasks={filteredTasks} {selectedState} on:selectedState={updateSelectedState} />

<CheckoutNav
	searchValue={$searchValue}
	{buttonTextCount}
	maxStartingTasks={`${$settings.max_starting_tasks}`}
	maxActiveTasks={`${$settings.max_active_tasks}`}
	on:searchValue={updateSearchValue}
	on:create={handleTask}
	on:start={handleTask}
	on:stop={handleTask}
	on:edit={handleTask}
	on:duplicate={handleTask}
	on:saveSettings={saveSettings}
	on:showConfirmationModal={() => {
		showConfirmationModal = true;
	}}
/>

{#if $showTags}
	<Tags
		{tagsCount}
		totalSelectedItems={totalSelectedTasks}
		{selectedTags}
		checkedItems={checkedCheckoutTasks}
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
		verboseData={filteredTasks}
		sortState={$sortState}
		{checkedAll}
		let:row
		let:index
		let:itemId
		let:thisTask
		on:sort={updateSortState}
		on:checkedAll={updateCheckedAll}
	>
		<TableRow
			{row}
			{index}
			{itemId}
			{thisTask}
			checked={checkedCheckoutTasks.includes(itemId)}
			on:checked={handleChecked}
			on:delete={handleTask}
			on:start={handleTask}
			on:edit={handleTask}
			on:stop={handleTask}
		/>
	</Table>
</div>

{#if showModal}
	<TaskModalHelper bind:showModal bind:isEditing bind:isDuplicating {checkedCheckoutTasks} />
{/if}

{#if showConfirmationModal}
	<ConfirmationModal
		message={`You're about to delete ${buttonTextCount} of your tasks. This cannot be undone. Are you sure you want to continue?`}
		on:confirm={() => {
			showConfirmationModal = false;
			handleTask(new CustomEvent('delete'));
		}}
		on:cancel={() => {
			showConfirmationModal = false;
		}}
	/>
{/if}

<style>
	.container {
		flex-grow: 1;
		overflow-y: auto;
		scroll-behavior: smooth;
	}

	.nav-button {
		background: none;
		outline: none;
		border: none;
		color: var(--off-black);
	}

	.nav-button:hover {
		color: var(--light-gray-3);
	}
</style>
