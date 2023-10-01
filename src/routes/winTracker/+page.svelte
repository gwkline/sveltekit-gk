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
		addTag,
		createAddAdditionalTag,
		createHandleChecked,
		createTableLogic
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
	let checkedItemIds: number[] = [];
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

	const setSelectedTags = (newTags: string[]) => {
		selectedTags = newTags;
	};
	const getSelectedTags = () => selectedTags;

	const addAdditionalTag = createAddAdditionalTag(
		wins.update,
		'http://127.0.0.1:23432/wins',
		getSelectedTags,
		setSelectedTags
	);

	const addTagToWin = (e: CustomEvent) => {
		let newTagText = e.detail;
		let updatedWins: Win[] = [];
		wins.update((wins) => {
			return wins.map((win) => {
				if (checkedItemIds.includes(win.id)) {
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

	const handleChecked = createHandleChecked(
		() => $wins,
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
			let allIds = filteredWins.map((win) => win.id);
			checkedItemIds = allIds;
		} else {
			checkedItemIds = [];
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
			let all = $shiftPressed || checkedItemIds.filter((item) => item != -1).length === 0;
			winIds = all ? filteredWins.map((win) => win.id) : checkedItemIds;
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

	// Sets the value of filteredTasks and tableData
	$: {
		createTableLogic(
			() => $wins,
			() => searchValue,
			() => selectedTags,
			() => selectedState,
			(tasks) => {
				filteredWins = tasks;
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
			false
		);
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
		let items = checkedItemIds;
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
		checkedItems={checkedItemIds}
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
		headers={Object.keys(headerConfig)}
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
			checked={checkedItemIds.includes(row.itemId)}
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
