<script lang="ts">
	import Tags from '$lib/Tags.svelte';
	import Table from '$lib/Table.svelte';
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
		removeTags,
		addTag,
		createAddAdditionalTag,
		createHandleChecked,
		createTableLogic,
		computeTagCounts,
		computeTotalSelectedTasks
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
	import BaseTableRow from '$lib/TableRows/BaseTableRow.svelte';
	import CheckoutTableRow from '$lib/TableRows/CheckoutTableRow.svelte';

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
	let checkedItemIds: number[] = [];
	let totalSelectedTasks: number = 0;

	let filteredTasks: Task[] = [];
	let tableData: TableRowType<Task>[] = [];
	let tableIds: number[] = [];

	let selectedTags: string[] = [];
	let allTags: string[] = [];
	let tagsCount: { tag: string; count: number }[] = [];

	let headerConfig: HeaderConfigType<Task> = {
		SKU: (task: Task) => task?.product?.product_id ?? '',
		Account: (task: Task) => task?.account?.username ?? '',
		Proxy: (task: Task) => task?.account?.proxy ?? '',
		Profile: (task: Task) => task?.account?.profile?.name ?? '',
		Browser: (task: Task) =>
			task?.browser_type == 'Default' ? $settings?.browser ?? '' : task?.browser_type ?? '',
		Status: (task: Task) => task?.status ?? ''
	};

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
			let selectedIndices = checkedItemIds;

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

	const addAdditionalTag = createAddAdditionalTag(
		verboseTasks.update,
		'http://127.0.0.1:23432/tasks?type=checkout',
		() => selectedTags,
		(newTags: string[]) => {
			selectedTags = newTags;
		}
	);

	const addTagToTasks = (e: CustomEvent) => {
		let newTagText = e.detail;
		let updatedTasks: Task[] = [];
		verboseTasks.update((tasks) => {
			return tasks.map((task) => {
				if (checkedItemIds.includes(task.id) && !task.tags.some((t) => t.name === newTagText)) {
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

	const handleChecked = createHandleChecked(
		() => $verboseTasks,
		() => checkedItemIds,
		(ids) => {
			checkedItemIds = ids;
		},
		() => lastChecked,
		(id) => {
			lastChecked = id;
		},
		() => secondLastChecked,
		(id) => {
			secondLastChecked = id;
		},
		() => $shiftPressed
	);

	const handleCheckedAll = (e: CustomEvent) => {
		checkedAll = e.detail.checked;

		if (e.detail.checked) {
			let allIds = filteredTasks.map((task) => task.id);
			checkedItemIds = allIds;
		} else {
			checkedItemIds = [];
		}
	};

	const handleTask = (e: CustomEvent) => {
		let eventState = e.type as states;
		let taskId: number | null = e.detail?.id || null;
		isLoading.set({ [`${eventState}${taskId}`]: true, confirmation: true });

		let taskIds: number[];
		if (taskId) {
			taskIds = [taskId];
		} else {
			let all = $shiftPressed || checkedItemIds.filter((item) => item != -1).length === 0;
			let visibleItems = filteredTasks.map((task) => task.id);
			let overlap = checkedItemIds.filter((item) => visibleItems.includes(item));

			taskIds = all ? filteredTasks.map((task) => task.id) : overlap;
		}

		switch (eventState) {
			case 'start':
				makeRequest('post', `http://127.0.0.1:23432/tasks/start?type=undefined`, taskIds, () => {
					isLoading.set({ [`${eventState}${taskId}`]: false });
				});
				break;
			case 'focus':
				makeRequest(
					'get',
					`http://127.0.0.1:23432/task/${taskId}/focus?type=undefined`,
					taskIds,
					() => {
						isLoading.set({ [`${eventState}${taskId}`]: false });
					}
				);
				break;
			case 'stop':
				taskIds = taskIds.filter((id) => {
					const task = $verboseTasks.find((task: Task) => task.id === id);
					return task && task.state !== 'Ready';
				});
				if (taskIds.length === 0) {
					// If there are no valid tasks to stop, don't proceed.
					isLoading.set({ [eventState]: false });
					return;
				}
				makeRequest('post', `http://127.0.0.1:23432/tasks/stop?type=undefined`, taskIds, () => {
					isLoading.set({ [`${eventState}${taskId}`]: false });
				});
				break;
			case 'delete':
				makeRequest('delete', `http://127.0.0.1:23432/tasks?type=checkout`, taskIds, () => {
					// Update verboseTasks by filtering out the tasks that were deleted
					verboseTasks.update((tasks) => {
						return tasks.filter((task) => !taskIds.includes(task.id));
					});

					// Reset checkedItemIds
					checkedItemIds = [];
					isLoading.set({ [`${eventState}${taskId}`]: false, confirmation: false });
					showConfirmationModal = false;
				});
				break;
			case 'edit':
				if (taskId) {
					checkedItemIds = [taskId];
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
		createTableLogic(
			() => $verboseTasks,
			() => searchValue,
			() => selectedTags,
			() => selectedState,
			(tasks) => {
				filteredTasks = tasks;
			},
			() => headerConfig,
			(ids) => {
				tableIds = ids;
			},
			() => tableIds,
			() => sortState,
			(data) => {
				tableData = data;
			},
			(ids) => {
				checkedItemIds = ids;
			},
			() => checkedItemIds,
			true
		);
	}

	// Sets the value of allTags and tagsCount
	$: computeTagCounts(
		() => $verboseTasks,
		(task) => task.tags,
		(tags) => {
			allTags = tags;
		},
		(counts) => {
			tagsCount = counts;
		}
	);

	// Sets the value of totalSelectedTasks
	$: totalSelectedTasks = computeTotalSelectedTasks(
		() => $verboseTasks,
		() => selectedTags,
		(task) => task.tags
	);

	// Sets the value of buttonTextCount
	$: {
		let items = checkedItemIds;
		let visibleItems = filteredTasks.map((task) => task.id);
		let overlap = items.filter((item) => visibleItems.includes(item));

		if ($shiftPressed || overlap.length == 0 || overlap.length == visibleItems.length) {
			buttonTextCount = `All`;
		} else {
			buttonTextCount = `(${overlap.length})`;
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
		checkedItems={checkedItemIds}
		on:selectTag={handleSelectTag}
		on:deleteSelectedTags={deleteSelectedTags}
		on:deleteSelectedTasks={deleteSelectedTasksByTags}
		on:deleteSelectedTasksTags={deleteSelectedTagsByTasks}
		on:updateTagNames={updateTagNames}
		on:addAdditionalTag={addAdditionalTag}
		on:addTagToTasks={addTagToTasks}
	/>
{/if}

<Table
	let:row
	{tableData}
	headers={Object.keys(headerConfig)}
	{checkedAll}
	{sortState}
	checkedCount={checkedItemIds.length}
	on:sort={handleSort}
	on:checkedAll={handleCheckedAll}
>
	<BaseTableRow
		{row}
		let:column
		let:value
		let:row
		let:page
		page="checkout"
		checked={checkedItemIds.includes(row.itemId)}
		on:checked={handleChecked}
		on:delete={handleTask}
		on:start={handleTask}
		on:edit={handleTask}
		on:stop={handleTask}
		on:focus={handleTask}
	>
		<CheckoutTableRow {value} {column} {row} {page} />
	</BaseTableRow>
</Table>

<CheckoutNavBottom
	{buttonTextCount}
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
	<TaskModalHelper {checkedItemIds} bind:showModal bind:isEditing bind:isDuplicating />
{/if}

{#if showConfirmationModal}
	<ConfirmationModal
		message={`You're about to delete ${buttonTextCount.toLowerCase()} of your tasks. This cannot be undone. Are you sure you want to continue?`}
		on:confirm={() => {
			handleTask(new CustomEvent('delete'));
		}}
		on:cancel={() => {
			showConfirmationModal = false;
		}}
	/>
{/if}
