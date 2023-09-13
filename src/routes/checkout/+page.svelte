<script lang="ts">
	import Tags from '$lib/Tags.svelte';
	import Table from '$lib/Table.svelte';
	import TaskTableRow from '$lib/TableRows/CheckoutTableRow.svelte';
	import StatusBar from '$lib/StatusBar.svelte';
	import UpdateBar from '$lib/UpdateBar.svelte';
	import CheckoutNav from './CheckoutNav.svelte';
	import TaskModalHelper from './TaskModalHelper.svelte';
	import ConfirmationModal from '$lib/ConfirmationModal.svelte';
	import {
		makeRequest,
		updateSortState,
		updateSelectedTags,
		saveSettings,
		getSettings,
		getCheckoutTasks,
		removeTags,
		addTag
	} from '../../helpers';
	import { verboseTasks, settings, showTags, shiftPressed, isLoading } from '../../datastore';
	import type {
		Task,
		HeaderConfigType,
		TableRowType,
		CheckoutState,
		SortState,
		states
	} from '../../types';
	import CheckoutNavBottom from './CheckoutNavBottom.svelte';

	let searchValue: string = '';
	let sortState: SortState = { column: null, direction: 0 };

	let showModal = false;
	let showConfirmationModal = false;
	let isEditing = false;
	let isDuplicating = false;

	let buttonTextCount: string;
	let selectedState: CheckoutState | '' = '';
	let filterOn: boolean = false;

	let lastChecked: number | null = null;
	let secondLastChecked: number | null = null;
	let checkedAll: boolean = false;
	let checkedCheckoutTasks: number[] = [];
	let totalSelectedTasks: number = 0;

	let filteredTasks: Task[] = [];
	let tableData: TableRowType<Task>[] = [];
	let tableIds: number[] = [];

	let selectedTags: string[] = [];
	let allTags: string[] = [];
	let tagsCount: { tag: string; count: number }[] = [];

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

	getSettings();
	getCheckoutTasks();

	const handleSort = (e: CustomEvent) => {
		sortState = updateSortState(e, sortState);
	};

	const updateSelectedState = (e: CustomEvent) => {
		if (selectedState === e.detail) {
			selectedState = '';
		} else {
			selectedState = e.detail;
		}
	};

	const updateSearchValue = (e: CustomEvent) => {
		searchValue = e.detail;
	};

	const handleSelectTag = (e: CustomEvent) => {
		selectedTags = updateSelectedTags(e, selectedTags);
	};

	const deleteSelectedTags = () => {
		verboseTasks.update((tasks) => {
			return removeTags(
				tasks,
				selectedTags,
				'http://127.0.0.1:23432/tasks?type=checkout'
			) as Task[];
		});
		selectedTags = []; // Clear selection after deleting
	};

	const updateTagNames = (e: CustomEvent) => {
		// Do not proceed with the function if the editedText is empty
		let editedText = e.detail;

		verboseTasks.update((tasks) => {
			return addTag(
				tasks,
				selectedTags,
				editedText,
				'http://127.0.0.1:23432/tasks?type=checkout'
			) as Task[];
		});

		selectedTags = [];
	};

	const deleteSelectedTasksByTags = () => {
		let taskIdsToRemove: number[] = [];
		verboseTasks.update((tasks) => {
			return tasks.filter((task) => {
				let taskHasTag = task.tags.some((t) => selectedTags.includes(t.name));
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
		selectedTags = []; // Clear selection after deleting
	};

	const deleteSelectedTagsByTasks = () => {
		verboseTasks.update((tasks) => {
			let selectedIndices = checkedCheckoutTasks;

			// Get the selected tasks based on indices
			let selectedTasks = selectedIndices.map((index) => tasks[index]);

			// Generate an array of changes (deltas) to be applied
			let deltas = removeTags(
				selectedTasks,
				selectedTags,
				'http://127.0.0.1:23432/tasks?type=checkout'
			);

			// Apply the changes back to the original tasks array
			deltas.forEach((delta, index) => {
				let originalIndex = selectedIndices[index];
				// Apply the delta to modify the original task at this index
				// (This assumes that 'delta' contains all the information needed to modify 'tasks[originalIndex]')
				tasks[originalIndex] = { ...tasks[originalIndex], ...delta };
			});

			return tasks;
		});
		selectedTags = []; // Clear selection after deleting
	};

	const addAdditionalTag = (e: CustomEvent) => {
		let newTagText = e.detail;
		let updatedTasks: Task[] = [];
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

	const handleCheckedAll = (e: CustomEvent) => {
		checkedAll = e.detail.checked;

		if (e.detail.checked) {
			let allIds = filteredTasks.map((task) => task.id);
			checkedCheckoutTasks = allIds;
		} else {
			checkedCheckoutTasks = [];
		}
	};

	const handleTask = (e: CustomEvent) => {
		let state = e.type as states;
		let taskId: number | null = e.detail?.id || null;
		isLoading.set({ [`${state}${taskId}`]: true });

		let taskIds: number[];
		if (taskId) {
			taskIds = [taskId];
		} else {
			let all = $shiftPressed || checkedCheckoutTasks.filter((item) => item != -1).length === 0;
			taskIds = all ? filteredTasks.map((task) => task.id) : checkedCheckoutTasks;
		}

		switch (state) {
			case 'start':
				makeRequest('post', `http://127.0.0.1:23432/tasks/start?type=undefined`, taskIds, () => {
					isLoading.set({ [`${state}${taskId}`]: false });
				});
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
				makeRequest('post', `http://127.0.0.1:23432/tasks/stop?type=undefined`, taskIds, () => {
					isLoading.set({ [`${state}${taskId}`]: false });
				});
				break;
			case 'delete':
				makeRequest('delete', `http://127.0.0.1:23432/tasks?type=checkout`, taskIds, () => {
					// Update verboseTasks by filtering out the tasks that were deleted
					verboseTasks.update((tasks) => {
						return tasks.filter((task) => !taskIds.includes(task.id));
					});

					// Reset checkedCheckoutTasks
					checkedCheckoutTasks = [];
					isLoading.set({ [`${state}${taskId}`]: false });
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
	};

	const clearFilters = () => {
		selectedTags = [];
		selectedState = '';
		searchValue = '';
		sortState = { column: null, direction: 0 };
	};

	const handleSaveSettings = (e: CustomEvent) => {
		saveSettings(e.detail.name, e.detail.value);
	};

	// Sets the value of filteredTasks and tableData
	$: {
		let filtered = $verboseTasks.filter((task) => {
			// Keyword Search
			let keywordMatch = true;
			if (searchValue !== '') {
				keywordMatch = JSON.stringify(task).toLowerCase().includes(searchValue.toLowerCase());
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

			// CheckoutState Filtering
			let stateMatch = !selectedState || task.state === selectedState;
			return keywordMatch && tagMatch && stateMatch;
		});

		filteredTasks = filtered;

		headers = Object.keys(headerConfig);
		tableIds = [];

		let tableDataShortenedTemp = filtered.map((row, index) => {
			const rowObject: TableRowType<Task> = {
				index: index + 1,
				itemId: row.id,
				thisItem: row
			};
			for (const header of headers) {
				rowObject[header] = headerConfig[header](row);
			}
			tableIds.push(row.id);
			return rowObject;
		});

		if (typeof sortState.column === 'string') {
			// Get the getter function for the sort column
			const getSortValue = headerConfig[sortState.column];
			const indices = tableDataShortenedTemp.map((_, index) => index); // Initialize indices array

			indices.sort((aIndex, bIndex) => {
				// Use the getter function to extract the sort value
				const aValue = getSortValue(filtered[aIndex]).toLowerCase();
				const bValue = getSortValue(filtered[bIndex]).toLowerCase();

				if (aValue < bValue) {
					return sortState.direction === 1 ? -1 : 1;
				}
				if (aValue > bValue) {
					return sortState.direction === 1 ? 1 : -1;
				}
				return 0;
			});

			// Sort the tableDataShortenedTemp array and the tableIds array according to the sorted indices
			tableDataShortenedTemp = indices.map((index) => tableDataShortenedTemp[index]);
			tableIds = indices.map((index) => tableIds[index]);
		}

		tableData = tableDataShortenedTemp;
	}

	// Sets the value of allTags and tagsCount
	$: {
		allTags = $verboseTasks
			.map((task) => task.tags)
			.flat()
			.map((tag) => tag.name)
			.filter((tag) => tag);

		let filteredTags = filteredTasks
			.map((task) => task.tags)
			.flat()
			.map((tag) => tag.name)
			.filter((tag) => tag);

		let uniqueTags = [...new Set(allTags)];

		tagsCount = uniqueTags.map((tag) => {
			return {
				tag: tag,
				count: filteredTags.filter((t) => t === tag).length
			};
		});

		// Count the number of accounts without any tags
		let noTagsCount = $verboseTasks.filter((account) => account.tags.length === 0).length;

		// Add a "No Tags" tag if there are any accounts without tags
		if (noTagsCount > 0) {
			tagsCount.unshift({ tag: 'No Tags', count: noTagsCount });
		}
	}

	// Sets the value of totalSelectedTasks
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

	// Sets the value of buttonTextCount
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

	// Sets the value of filterOn
	$: {
		if (
			selectedTags.length > 0 ||
			selectedState != '' ||
			searchValue != '' ||
			sortState.column != null
		) {
			filterOn = true;
		} else {
			filterOn = false;
		}
	}
</script>

{#if filterOn}
	<UpdateBar on:click={clearFilters}
		>You're viewing a filtered set of tasks. To clear all filters, click here.</UpdateBar
	>
{/if}

<StatusBar
	page="checkout"
	tasks={filteredTasks}
	{selectedState}
	on:selectedState={updateSelectedState}
/>

<CheckoutNav
	{buttonTextCount}
	{searchValue}
	maxStartingTasks={`${$settings.max_starting_tasks}`}
	maxActiveTasks={`${$settings.max_active_tasks}`}
	on:searchValue={updateSearchValue}
	on:create={handleTask}
	on:start={handleTask}
	on:stop={handleTask}
	on:edit={handleTask}
	on:duplicate={handleTask}
	on:saveSettings={handleSaveSettings}
	on:showConfirmationModal={() => {
		showConfirmationModal = true;
	}}
/>

{#if $showTags}
	<Tags
		{tagsCount}
		{selectedTags}
		checkedItems={checkedCheckoutTasks}
		on:selectTag={handleSelectTag}
		on:deleteSelectedTags={deleteSelectedTags}
		on:deleteSelectedTasks={deleteSelectedTasksByTags}
		on:deleteSelectedTasksTags={deleteSelectedTagsByTasks}
		on:updateTagNames={updateTagNames}
		on:addAdditionalTag={addAdditionalTag}
		on:addTagToTasks={addTagToTasks}
	/>
{/if}

<div class="table-container">
	<Table
		let:row
		{tableData}
		{headers}
		{checkedAll}
		{sortState}
		on:sort={handleSort}
		on:checkedAll={handleCheckedAll}
	>
		<TaskTableRow
			{row}
			page="checkout"
			checked={checkedCheckoutTasks.includes(row.itemId)}
			on:checked={handleChecked}
			on:delete={handleTask}
			on:start={handleTask}
			on:edit={handleTask}
			on:stop={handleTask}
		/>
	</Table>
</div>
<CheckoutNavBottom
	{buttonTextCount}
	{searchValue}
	maxStartingTasks={`${$settings.max_starting_tasks}`}
	maxActiveTasks={`${$settings.max_active_tasks}`}
	on:searchValue={updateSearchValue}
	on:create={handleTask}
	on:start={handleTask}
	on:stop={handleTask}
	on:edit={handleTask}
	on:duplicate={handleTask}
	on:saveSettings={handleSaveSettings}
	on:showConfirmationModal={() => {
		showConfirmationModal = true;
	}}
/>

{#if showModal}
	<TaskModalHelper {checkedCheckoutTasks} bind:showModal bind:isEditing bind:isDuplicating />
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
	.table-container {
		flex-grow: 1;
		overflow-y: auto;
		scroll-behavior: smooth;
	}
</style>
