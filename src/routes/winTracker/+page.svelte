<script lang="ts">
	import Tags from '$lib/Tags.svelte';
	import Table from '$lib/Table.svelte';
	import UpdateBar from '$lib/UpdateBar.svelte';
	import WinTrackerNav from './WinTrackerNav.svelte';
	import ConfirmationModal from '$lib/ConfirmationModal.svelte';
	import {
		makeRequest,
		updateSortState,
		updateSelectedTags,
		removeTags,
		addTag
	} from '../../helpers';
	import { showTags, shiftPressed, isLoading, wins } from '../../datastore';
	import type {
		HeaderConfigType,
		TableRowType,
		ActivityState,
		SortState,
		Win,
		states
	} from '../../types';
	import WinTableRow from '$lib/TableRows/WinTableRow.svelte';
	import BaseTableRow from '$lib/TableRows/BaseTableRow.svelte';

	let searchValue: string = '';
	let sortState: SortState = { column: null, direction: 0 };

	let showConfirmationModal = false;

	let buttonTextCount: string;
	let selectedState: ActivityState | '' = '';
	let filterOn: boolean = false;

	let lastChecked: number | null = null;
	let secondLastChecked: number | null = null;
	let checkedAll: boolean = false;
	let checkedCheckoutTasks: number[] = [];
	let totalSelectedTasks: number = 0;

	let filteredWins: Win[] = [];
	let tableData: TableRowType<Win>[] = [];
	let tableIds: number[] = [];

	let selectedTags: string[] = [];
	let allTags: string[] = [];
	let tagsCount: { tag: string; count: number }[] = [];

	let headers: string[] = [];
	let headerConfig: HeaderConfigType<Win> = {
		Date: (win) => win.checkout_date,
		Product: (win) => win.image_url,
		SKU: (win) => win.style_color_code,
		Account: (win) => win.account_name,
		'Order Number': (win) => win.order_number,
		Size: (win) => win.size,
		Address: (win) => win.shipping_address,
		Status: (win) => win.order_status,
		Tracking: (win) => win.tracking_number
	};

	const handleSort = (e: CustomEvent) => {
		sortState = updateSortState(e, sortState);
	};

	const updateSearchValue = (e: CustomEvent) => {
		searchValue = e.detail;
	};

	const handleSelectTag = (e: CustomEvent) => {
		selectedTags = updateSelectedTags(e, selectedTags);
	};

	const deleteSelectedTags = () => {
		wins.update((wins) => {
			const updatedWins = removeTags(wins, selectedTags, 'http://127.0.0.1:23432/wins') as Win[];

			// Create a Map of the updated wins for quick access
			const updatedWinsMap = new Map(updatedWins.map((win) => [win.id, win]));

			// Update tasks with the updated wins
			return wins.map((win) => {
				const updatedAccount = updatedWinsMap.get(win.id);
				if (updatedAccount) {
					win = updatedAccount;
				}
				return win;
			});
		});

		selectedTags = []; // Clear selection after deleting
	};

	const updateTagNames = (e: CustomEvent) => {
		// Do not proceed with the function if the editedText is empty
		let editedText = e.detail;

		wins.update((wins) => {
			const updatedWins = addTag(
				wins,
				selectedTags,
				editedText,
				'http://127.0.0.1:23432/wins'
			) as Win[];

			// Update tasks with the updated wins
			return wins.map((win) => {
				const updatedAccount = updatedWins.find((newWin) => newWin.id === win.id);
				if (updatedAccount) {
					win = updatedAccount;
				}
				return win;
			});
		});

		selectedTags = [];
	};

	const addAdditionalTag = (e: CustomEvent) => {
		let newTagText = e.detail;
		let updatedWins: Win[] = [];
		wins.update((wins) => {
			return wins.map((win) => {
				let taskHasSelectedTag = win.tags.some((t) => selectedTags.includes(t.name));

				// If the "No Tags" tag is selected and the task has no tags
				if (selectedTags.includes('No Tags') && win.tags.length === 0) {
					win.tags.push({ name: newTagText });
					updatedWins.push(win);
				}

				// If the task has a selected tag
				if (taskHasSelectedTag) {
					// Add the new tag to the task
					win.tags.push({ name: newTagText });

					// Add the task to the updatedWins array
					updatedWins.push(win);
				}

				return win;
			});
		});

		if (updatedWins.length > 0) {
			makeRequest('put', 'http://127.0.0.1:23432/wins', updatedWins);
		}
		selectedTags = [];
	};

	const addTagToWin = (e: CustomEvent) => {
		let newTagText = e.detail;
		let updatedWins: Win[] = [];
		wins.update((wins) => {
			return wins.map((win) => {
				if (checkedCheckoutTasks.includes(win.id)) {
					win.tags.push({ name: newTagText });
					updatedWins.push(win);
				}
				return win;
			});
		});
		if (updatedWins.length > 0) {
			makeRequest('put', 'http://127.0.0.1:23432/wins', updatedWins);
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
				let taskWithThisId = $wins.find((win) => win.id === i);
				if (taskWithThisId && !checkedCheckoutTasks.includes(taskWithThisId.id)) {
					checkedCheckoutTasks.push(i);
				}
			}
		}
	};

	const handleCheckedAll = (e: CustomEvent) => {
		checkedAll = e.detail.checked;

		if (e.detail.checked) {
			let allIds = filteredWins.map((win) => win.id);
			checkedCheckoutTasks = allIds;
		} else {
			checkedCheckoutTasks = [];
		}
	};

	const handleTask = (e: CustomEvent) => {
		let state = e.type as states;
		let winId: number | null = e.detail?.id || null;
		isLoading.set({ [`${state}${winId}`]: true });

		let winIds: number[];
		if (winId) {
			winIds = [winId];
		} else {
			let all = $shiftPressed || checkedCheckoutTasks.filter((item) => item != -1).length === 0;
			winIds = all ? filteredWins.map((win) => win.id) : checkedCheckoutTasks;
		}

		switch (state) {
			case 'delete':
				makeRequest('delete', 'http://127.0.0.1:23432/wins', winIds, () => {
					wins.update((wins) => {
						return wins.filter((win) => {
							if (winIds.includes(win.id)) {
								return false;
							}
							return true;
						});
					});
					isLoading.set({ [`${state}${winId}`]: false });
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

	const handleEdit = () => {};

	// Sets the value of filteredWins and tableData
	$: {
		let filtered = $wins.filter((win) => {
			// Keyword Search
			let keywordMatch = true;
			if (searchValue !== '') {
				keywordMatch = JSON.stringify(win).toLowerCase().includes(searchValue.toLowerCase());
			}

			// Tag Filtering
			let tagMatch;
			if (selectedTags.includes('No Tags')) {
				tagMatch =
					win.tags.length === 0 ||
					selectedTags.some((tag) => win.tags.map((tagObj) => tagObj.name).includes(tag));
			} else {
				tagMatch =
					selectedTags.length === 0 ||
					selectedTags.some((tag) => win.tags.map((tagObj) => tagObj.name).includes(tag));
			}

			// ActivityState Filtering
			return keywordMatch && tagMatch;
		});

		filteredWins = filtered;

		headers = Object.keys(headerConfig);
		tableIds = [];

		let tableDataShortenedTemp = filtered.map((row, index) => {
			const rowObject: TableRowType<Win> = {
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
		allTags = $wins
			.map((win) => win.tags)
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

		// Count the number of wins without any tags
		let noTagsCount = $wins.filter((win) => win.tags.length === 0).length;

		// Add a "No Tags" tag if there are any wins without tags
		if (noTagsCount > 0) {
			tagsCount.unshift({ tag: 'No Tags', count: noTagsCount });
		}
	}

	// Sets the value of totalSelectedTasks
	$: {
		// Get all tasks with selected tags, but don't count a task more than once
		const selectedTasks = new Set();
		if (selectedTags.length > 0) {
			$wins.forEach((win) => {
				const taskTags = win.tags.map((t) => t.name);
				if (selectedTags.some((tag) => taskTags.includes(tag))) {
					selectedTasks.add(win.id);
				}

				// If the "No Tags" tag is selected, add tasks that have no tags
				if (selectedTags.includes('No Tags') && win.tags.length === 0) {
					selectedTasks.add(win.id);
				}
			});
		}
		totalSelectedTasks = selectedTasks.size;
	}

	// Sets the value of buttonTextCount
	$: {
		let items = checkedCheckoutTasks;
		if ($shiftPressed || items.length == 0 || items.length == filteredWins.length) {
			buttonTextCount = 'All';
		} else {
			buttonTextCount = `(${items.length})`;
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

<WinTrackerNav
	{buttonTextCount}
	{searchValue}
	on:searchValue={updateSearchValue}
	on:edit={handleEdit}
	on:delete={() => {
		showConfirmationModal = true;
	}}
/>

{#if $showTags}
	<Tags
		{tagsCount}
		{selectedTags}
		checkedItems={checkedCheckoutTasks}
		on:selectTag={handleSelectTag}
		on:addTagToTasks={addTagToWin}
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
		on:sort={handleSort}
		on:checkedAll={handleCheckedAll}
	>
		<BaseTableRow
			{row}
			let:column
			let:value
			let:row
			page="activity"
			checked={checkedCheckoutTasks.includes(row.itemId)}
			on:checked={handleChecked}
			on:delete={handleTask}
			on:start={handleTask}
			on:edit={handleTask}
			on:stop={handleTask}
			on:focus={handleTask}
		>
			<WinTableRow {value} {column} {row} />
		</BaseTableRow>
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
