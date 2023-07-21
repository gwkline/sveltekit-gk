<script lang="ts">
	import Tags from '$lib/Tags.svelte';
	import Table from '$lib/Table.svelte';
	import TableRow from '$lib/TableRow.svelte';
	import StatusBar from '$lib/StatusBar.svelte';
	import UpdateBar from '$lib/UpdateBar.svelte';
	import ActivityNav from './ActivityNav.svelte';
	import ConfirmationModal from '$lib/ConfirmationModal.svelte';
	import { makeRequest } from '../../helpers';
	import {
		verboseActivityTasks,
		settings,
		showTags,
		shiftPressed,
		isLoading,
		schedules,
		verboseTasks
	} from '../../datastore';
	import type {
		Task,
		HeaderConfigType,
		TableRowType,
		ActivityState,
		Settings,
		SortState,
		ActivityTask,
		ActivityMode,
		Account,
		ShortAccount
	} from '../../types';

	type settings = 'max_active_tasks' | 'max_starting_tasks';
	type states =
		| 'start'
		| 'stop'
		| 'delete'
		| 'duplicate'
		| 'edit'
		| 'create'
		| 'startIndiv'
		| 'stopIndiv'
		| 'deleteIndiv';

	let searchValue: string = '';
	let sortState: SortState = { column: null, direction: 0 };

	let showSMSModal = false;
	let showPasswordModal = false;

	let showConfirmationModal = false;

	let buttonTextCount: string;
	let selectedState: ActivityState | '' = '';
	let filterOn: boolean = false;

	let lastChecked: number | null = null;
	let secondLastChecked: number | null = null;
	let checkedAll: boolean = false;
	let checkedCheckoutTasks: number[] = [];
	let totalSelectedTasks: number = 0;

	let filteredTasks: ActivityTask[] = [];
	let tableData: TableRowType[] = [];
	let tableIds: number[] = [];

	let selectedTags: string[] = [];
	let allTags: string[] = [];
	let tagsCount: { tag: string; count: number }[] = [];

	let headers: string[] = [];
	let headerConfig: HeaderConfigType<ActivityTask> = {
		Account: (task: ActivityTask) => task?.account?.username ?? '',
		Proxy: (task: ActivityTask) => task?.account?.proxy ?? '',
		Profile: (task: ActivityTask) => task?.account?.profile?.name ?? '',
		Payment: (task: ActivityTask) => task?.account.profile.payment.card_name || '',
		Mode: (task: ActivityTask) => task?.mode || 'BP Solve',
		Status: (task: ActivityTask) => task?.status ?? ''
	};

	makeRequest('get', 'http://127.0.0.1:23432/settings', null, (response) => {
		settings.set(response.data);
	});

	makeRequest('get', 'http://127.0.0.1:23432/accounts/activity', null, (response) => {
		let data = response.data;
		let cleanedData = data.map((task: Task) => {
			let account = task['account'];
			task['account'] = {
				id: account['id'],
				username: account['username'],
				proxy: account['proxy'],
				tags: account['tags'],
				use_account_name: account['use_account_name'],
				metadata: {
					logged_in: account.metadata?.logged_in ? account.metadata?.logged_in : false
				},
				profile: {
					id: account['profile']['id'],
					name: account['profile']['name'],
					tags: account['profile']['tags'],
					payment: {
						id: account['profile']['payment']['id'],
						tags: account['profile']['payment']['tags'],
						card_name: account['profile']['payment']['card_name'],
						card_type: account['profile']['payment']['card_type']
					}
				}
			};
			return task;
		});
		verboseActivityTasks.set(cleanedData);
	});

	makeRequest('get', 'http://127.0.0.1:23432/schedules', null, (response) => {
		schedules.set(response.data);
	});

	const updateSortState = (e: CustomEvent) => {
		let currentState = sortState;
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
		sortState = { column: newColumn, direction: newDirection };
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

	const removeTag = (tag: string) => {
		let accountsToUpdate: (Account | ShortAccount)[] = [];

		verboseActivityTasks.update((tasks) => {
			return tasks.map((task) => {
				// check if task contains the tag
				let taskHasTag = task.account.tags.some((t) => t.name === tag);

				if (taskHasTag) {
					// remove the tag from this task
					task.account.tags = task.account.tags.filter((t) => t.name !== tag);

					// add task to array of tasks to update
					accountsToUpdate.push(task.account);
				}

				// return the potentially modified task
				return task;
			});
		});

		if (accountsToUpdate.length > 0) {
			makeRequest('put', 'http://127.0.0.1:23432/accounts', accountsToUpdate);
		}
	};

	const updateTagNames = (e: CustomEvent) => {
		// Do not proceed with the function if the editedText is empty
		let editedText = e.detail;

		let updatedAccounts: (Account | ShortAccount)[] = [];
		verboseActivityTasks.update((tasks) => {
			return tasks.map((task) => {
				let taskHasSelectedTag = task.account.tags.some((t) => selectedTags.includes(t.name));

				// If the "No Tags" tag is being edited and the task has no tags
				if (selectedTags.includes('No Tags') && task.account.tags.length === 0) {
					// Add the new tag
					task.account.tags.push({ name: editedText });

					// Add the task to the updatedAccounts array
					updatedAccounts.push(task.account);
				}
				// If the task has a selected tag
				else if (taskHasSelectedTag) {
					// Update the name of the tag
					task.account.tags = task.account.tags.map((t) =>
						selectedTags.includes(t.name) ? { ...t, name: editedText } : t
					);

					// Add the task to the updatedAccounts array
					updatedAccounts.push(task.account);
				}

				return task;
			});
		});

		if (updatedAccounts.length > 0) {
			makeRequest('put', 'http://127.0.0.1:23432/tasks?type=checkout', updatedAccounts);
		}

		selectedTags = [];
	};

	const addAdditionalTag = (e: CustomEvent) => {
		let newTagText = e.detail;
		let updatedAccounts: (Account | ShortAccount)[] = [];
		verboseActivityTasks.update((tasks) => {
			return tasks.map((task) => {
				let taskHasSelectedTag = task.account.tags.some((t) => selectedTags.includes(t.name));

				// If the "No Tags" tag is selected and the task has no tags
				if (selectedTags.includes('No Tags') && task.account.tags.length === 0) {
					task.account.tags.push({ name: newTagText });
					updatedAccounts.push(task.account);
				}

				// If the task has a selected tag
				if (taskHasSelectedTag) {
					// Add the new tag to the task
					task.account.tags.push({ name: newTagText });

					// Add the task to the updatedAccounts array
					updatedAccounts.push(task.account);
				}

				return task;
			});
		});

		if (updatedAccounts.length > 0) {
			makeRequest('put', 'http://127.0.0.1:23432/accounts', updatedAccounts);
		}
		selectedTags = [];
	};

	const addTagToAccount = (e: CustomEvent) => {
		let newTagText = e.detail;
		let updatedAccounts: (Account | ShortAccount)[] = [];
		verboseActivityTasks.update((tasks) => {
			return tasks.map((task) => {
				if (checkedCheckoutTasks.includes(task.id)) {
					task.account.tags.push({ name: newTagText });
					updatedAccounts.push(task.account);
				}
				return task;
			});
		});
		if (updatedAccounts.length > 0) {
			makeRequest('put', 'http://127.0.0.1:23432/accounts', updatedAccounts);
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
				let taskWithThisId = $verboseActivityTasks.find((task) => task.id === i);
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
		let taskId: number | null = e.detail;
		let taskIds: number[];
		let state = e.type as states;
		isLoading.set({ [state]: true });

		if (taskId) {
			taskIds = [taskId];
		} else {
			let all = $shiftPressed || checkedCheckoutTasks.filter((item) => item != -1).length === 0;
			taskIds = all ? $verboseActivityTasks.map((task) => task.id) : checkedCheckoutTasks;
		}

		switch (state) {
			case 'start':
			case 'startIndiv':
				let theseTasks = $verboseActivityTasks.filter((task) => taskIds.includes(task.id));
				let theseModes = theseTasks.map((task) => {
					return task.mode;
				});
				if (theseModes.includes('addverifiednumber') && theseModes.includes('passwordreset')) {
					// Todo: throw error
				}
				if (theseModes.includes('addverifiednumber')) {
					showSMSModal = true;
				} else if (theseModes.includes('passwordreset')) {
					showPasswordModal = true;
				}

				makeRequest('post', 'http://127.0.0.1:23432/accounts/activity/start', taskIds, () => {
					isLoading.set({ [state]: false });
				});
				break;
			case 'stop':
			case 'stopIndiv':
				taskIds = taskIds.filter((id) => {
					const task = $verboseActivityTasks.find((task: ActivityTask) => task.id === id);
					return task && task.state !== 'Ready';
				});
				if (taskIds.length === 0) {
					// If there are no valid tasks to stop, don't proceed.
					isLoading.set({ [state]: false });
					return;
				}
				makeRequest('post', 'http://127.0.0.1:23432/accounts/activity/stop', taskIds, () => {
					isLoading.set({ [state]: false });
				});
				break;
			case 'delete':
			case 'deleteIndiv':
				makeRequest('delete', 'http://127.0.0.1:23432/accounts/sessions', taskIds, () => {
					verboseActivityTasks.update((tasks) => {
						return tasks.map((task) => {
							if (taskIds.includes(task.id)) {
								if (typeof task.account.metadata === 'undefined') {
									task.account.metadata = { logged_in: false };
								} else {
									task.account.metadata.logged_in = false;
								}
							}
							return task;
						});
					});
					isLoading.set({ [state]: false });
				});
				break;
		}
	};

	const clearFilters = () => {
		selectedTags = [];
		selectedState = '';
		searchValue = '';
		sortState = { column: null, direction: 0 };
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

	const changeActivityMode = (e: CustomEvent) => {
		console.log(e);
		let taskId: number = e.detail.id;
		let mode: ActivityMode = e.detail.mode;
		if (mode === undefined) {
			return;
		}
		let taskIds: number[];
		let state = e.type as states;
		isLoading.set({ [state]: true });

		if (taskId) {
			taskIds = [taskId];
		} else {
			let all = $shiftPressed || checkedCheckoutTasks.filter((item) => item != -1).length === 0;
			taskIds = all ? $verboseActivityTasks.map((task) => task.id) : checkedCheckoutTasks;
		}

		let tasks = $verboseActivityTasks.filter((task: ActivityTask) => taskIds.includes(task.id));
		tasks = tasks.map((task) => {
			task.mode = mode;
			return task;
		});

		return makeRequest('put', 'http://127.0.0.1:23432/accounts/activity', tasks, () => {
			verboseActivityTasks.update((stateTasks) => {
				for (let task of tasks) {
					const index = stateTasks.findIndex((t) => t.id === task.id);
					if (index !== -1) {
						stateTasks[index] = task;
					}
				}
				return stateTasks;
			});
			isLoading.set({ [state]: false });
		});
	};

	const changeSchedule = (e: CustomEvent) => {
		console.log(e);
		let scheduleName: string = e.detail;
		let taskIds: number[];
		let state = e.type as states;
		isLoading.set({ [state]: true });

		let all = $shiftPressed || checkedCheckoutTasks.filter((item) => item != -1).length === 0;
		taskIds = all ? $verboseActivityTasks.map((task) => task.id) : checkedCheckoutTasks;

		let tasks = $verboseActivityTasks.filter((task: ActivityTask) => taskIds.includes(task.id));
		tasks = tasks.map((task) => {
			let foundSchedule = $schedules.find((schedule) => schedule.name === scheduleName);
			if (foundSchedule) {
				task.schedule_id = foundSchedule.id;
			} else if (scheduleName === 'None' || scheduleName === '') {
				task.schedule_id = 0;
			}
			return task;
		});
		return makeRequest('put', 'http://127.0.0.1:23432/accounts/activity', tasks, () => {
			verboseActivityTasks.update((stateTasks) => {
				for (let task of tasks) {
					const index = stateTasks.findIndex((t) => t.id === task.id);
					if (index !== -1) {
						stateTasks[index] = task;
					}
				}
				return stateTasks;
			});
			isLoading.set({ [state]: false });
		});
	};

	// Sets the value of filteredTasks and tableData
	$: {
		let filtered = $verboseActivityTasks.filter((task) => {
			// Keyword Search
			let keywordMatch = true;
			if (searchValue !== '') {
				keywordMatch = JSON.stringify(task).toLowerCase().includes(searchValue.toLowerCase());
			}

			// Tag Filtering
			let tagMatch;
			if (selectedTags.includes('No Tags')) {
				tagMatch =
					task.account.tags.length === 0 ||
					selectedTags.some((tag) => task.account.tags.map((tagObj) => tagObj.name).includes(tag));
			} else {
				tagMatch =
					selectedTags.length === 0 ||
					selectedTags.some((tag) => task.account.tags.map((tagObj) => tagObj.name).includes(tag));
			}

			// ActivityState Filtering
			let stateMatch = !selectedState || task.state === selectedState;
			return keywordMatch && tagMatch && stateMatch;
		});

		filteredTasks = filtered;

		headers = Object.keys(headerConfig);
		tableIds = [];

		let tableDataShortenedTemp = filtered.map((row, index) => {
			const rowObject: TableRowType = {
				index: index + 1,
				itemId: row.id,
				thisTask: row
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
		allTags = $verboseActivityTasks
			.map((task) => task.account.tags)
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
		let noTagsCount = $verboseActivityTasks.filter((task) => task.account.tags.length === 0).length;

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
			$verboseActivityTasks.forEach((task) => {
				const taskTags = task.account.tags.map((t) => t.name);
				if (selectedTags.some((tag) => taskTags.includes(tag))) {
					selectedTasks.add(task.id);
				}

				// If the "No Tags" tag is selected, add tasks that have no tags
				if (selectedTags.includes('No Tags') && task.account.tags.length === 0) {
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
		} else if (items.length == $verboseActivityTasks.length) {
			buttonTextCount = `All (${items.length})`;
		} else {
			buttonTextCount = `${items.length}`;
		}
	}

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
	tasks={filteredTasks}
	{selectedState}
	on:selectedState={updateSelectedState}
	page="activity"
/>

<ActivityNav
	{buttonTextCount}
	{searchValue}
	schedules={$schedules}
	maxStartingActivityTasks={`${$settings.max_starting_activity_tasks}`}
	on:searchValue={updateSearchValue}
	on:start={handleTask}
	on:stop={handleTask}
	on:changeActivityMode={changeActivityMode}
	on:changeSchedule={changeSchedule}
	on:saveSettings={saveSettings}
	on:delete={() => {
		showConfirmationModal = true;
	}}
/>

{#if $showTags}
	<Tags
		{tagsCount}
		{selectedTags}
		totalSelectedItems={totalSelectedTasks}
		checkedItems={checkedCheckoutTasks}
		showDeleteTasks={false}
		on:selectTag={updateSelectedTags}
		on:addTagToTasks={addTagToAccount}
		on:deleteSelectedTags={deleteSelectedTags}
		on:updateTagNames={updateTagNames}
		on:addAdditionalTag={addAdditionalTag}
	/>
{/if}

<div class="container">
	<Table
		let:row
		{tableData}
		{headers}
		{checkedAll}
		{sortState}
		on:sort={updateSortState}
		on:checkedAll={handleCheckedAll}
	>
		<TableRow
			{row}
			checked={checkedCheckoutTasks.includes(row.itemId)}
			on:checked={handleChecked}
			on:startIndiv={handleTask}
			on:edit={changeActivityMode}
			on:deleteIndiv={handleTask}
			on:stopIndiv={handleTask}
			page="activity"
		/>
	</Table>
</div>

{#if showConfirmationModal}
	<ConfirmationModal
		message={`You're about to clear sessions for ${buttonTextCount} of your tasks. This cannot be undone. Are you sure you want to continue?`}
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
</style>
