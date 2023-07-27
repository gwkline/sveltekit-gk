<script lang="ts">
	import Tags from '$lib/Tags.svelte';
	import Table from '$lib/Table.svelte';
	import UpdateBar from '$lib/UpdateBar.svelte';
	import AccountNav from './AccountNav.svelte';
	import ConfirmationModal from '$lib/ConfirmationModal.svelte';
	import {
		makeRequest,
		updateSortState,
		updateSelectedTags,
		saveSettings,
		getSettings,
		removeTags,
		addTag,
		getAccounts
	} from '../../helpers';
	import {
		accounts,
		settings,
		showTags,
		shiftPressed,
		isLoading,
		schedules
	} from '../../datastore';
	import type {
		HeaderConfigType,
		AccountTableRowType,
		ActivityState,
		SortState,
		ActivityTask,
		ActivityMode,
		Account,
		ShortAccount,
		states
	} from '../../types';
	import AccountTableRow from '$lib/TableRows/AccountTableRow.svelte';

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

	let filteredAccounts: ShortAccount[] = [];
	let tableData: AccountTableRowType[] = [];
	let tableIds: number[] = [];

	let selectedTags: string[] = [];
	let allTags: string[] = [];
	let tagsCount: { tag: string; count: number }[] = [];

	let headers: string[] = [];
	let headerConfig: HeaderConfigType<ShortAccount> = {
		Account: (account) => account?.username ?? '',
		Proxy: (account) => account?.proxy ?? '',
		Profile: (account) => account?.profile?.name ?? '',
		Payment: (account) => account.profile.payment.card_name || '',
		Email: (account) => account.email || '',
		'Date Added': (account) => cleanDate(account.created_at),
		Wins: (account) => account.previous_wins.number_of_wins.toString()
	};

	const cleanDate = (dateString: string) => {
		let date = new Date(dateString);
		return (
			(date.getMonth() + 1).toString().padStart(2, '0') +
			'/' +
			date.getDate().toString().padStart(2, '0') +
			'/' +
			date.getFullYear()
		);
	};

	getSettings();
	getAccounts();

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
		accounts.update((accounts) => {
			const updatedAccounts = removeTags(
				accounts,
				selectedTags,
				'http://127.0.0.1:23432/accounts'
			) as ShortAccount[];

			// Create a Map of the updated accounts for quick access
			const updatedAccountsMap = new Map(updatedAccounts.map((account) => [account.id, account]));

			// Update tasks with the updated accounts
			return accounts.map((account) => {
				const updatedAccount = updatedAccountsMap.get(account.id);
				if (updatedAccount) {
					account = updatedAccount;
				}
				return account;
			});
		});

		selectedTags = []; // Clear selection after deleting
	};

	const updateTagNames = (e: CustomEvent) => {
		// Do not proceed with the function if the editedText is empty
		let editedText = e.detail;

		accounts.update((accounts) => {
			const updatedAccounts = addTag(
				accounts,
				selectedTags,
				editedText,
				'http://127.0.0.1:23432/accounts'
			) as ShortAccount[];

			// Update tasks with the updated accounts
			return accounts.map((account) => {
				const updatedAccount = updatedAccounts.find((account) => account.id === account.id);
				if (updatedAccount) {
					account = updatedAccount;
				}
				return account;
			});
		});

		selectedTags = [];
	};

	const addAdditionalTag = (e: CustomEvent) => {
		let newTagText = e.detail;
		let updatedAccounts: (Account | ShortAccount)[] = [];
		accounts.update((accounts) => {
			return accounts.map((account) => {
				let taskHasSelectedTag = account.tags.some((t) => selectedTags.includes(t.name));

				// If the "No Tags" tag is selected and the task has no tags
				if (selectedTags.includes('No Tags') && account.tags.length === 0) {
					account.tags.push({ name: newTagText });
					updatedAccounts.push(account);
				}

				// If the task has a selected tag
				if (taskHasSelectedTag) {
					// Add the new tag to the task
					account.tags.push({ name: newTagText });

					// Add the task to the updatedAccounts array
					updatedAccounts.push(account);
				}

				return account;
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
		accounts.update((accounts) => {
			return accounts.map((account) => {
				if (checkedCheckoutTasks.includes(account.id)) {
					account.tags.push({ name: newTagText });
					updatedAccounts.push(account);
				}
				return account;
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
				let taskWithThisId = $accounts.find((account) => account.id === i);
				if (taskWithThisId && !checkedCheckoutTasks.includes(taskWithThisId.id)) {
					checkedCheckoutTasks.push(i);
				}
			}
		}
	};

	const handleCheckedAll = (e: CustomEvent) => {
		checkedAll = e.detail.checked;

		if (e.detail.checked) {
			let allIds = filteredAccounts.map((account) => account.id);
			checkedCheckoutTasks = allIds;
		} else {
			checkedCheckoutTasks = [];
		}
	};

	const handleTask = (e: CustomEvent) => {
		let state = e.type as states;
		let accountId: number | null = e.detail?.id || null;
		isLoading.set({ [`${state}${accountId}`]: true });

		let accountIds: number[];
		if (accountId) {
			accountIds = [accountId];
		} else {
			let all = $shiftPressed || checkedCheckoutTasks.filter((item) => item != -1).length === 0;
			accountIds = all ? filteredAccounts.map((account) => account.id) : checkedCheckoutTasks;
		}

		switch (state) {
			case 'delete':
				makeRequest('delete', 'http://127.0.0.1:23432/accounts', accountIds, () => {
					accounts.update((accounts) => {
						return accounts.map((account) => {
							if (accountIds.includes(account.id)) {
								if (typeof account.metadata === 'undefined') {
									account.metadata = { logged_in: false };
								} else {
									account.metadata.logged_in = false;
								}
							}
							return account;
						});
					});
					isLoading.set({ [`${state}${accountId}`]: false });
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

	// Sets the value of filteredAccounts and tableData
	$: {
		let filtered = $accounts.filter((account) => {
			// Keyword Search
			let keywordMatch = true;
			if (searchValue !== '') {
				keywordMatch = JSON.stringify(account).toLowerCase().includes(searchValue.toLowerCase());
			}

			// Tag Filtering
			let tagMatch;
			if (selectedTags.includes('No Tags')) {
				tagMatch =
					account.tags.length === 0 ||
					selectedTags.some((tag) => account.tags.map((tagObj) => tagObj.name).includes(tag));
			} else {
				tagMatch =
					selectedTags.length === 0 ||
					selectedTags.some((tag) => account.tags.map((tagObj) => tagObj.name).includes(tag));
			}

			// ActivityState Filtering
			return keywordMatch && tagMatch;
		});

		filteredAccounts = filtered;

		headers = Object.keys(headerConfig);
		tableIds = [];

		let tableDataShortenedTemp = filtered.map((row, index) => {
			const rowObject: AccountTableRowType = {
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
		allTags = $accounts
			.map((account) => account.tags)
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
		let noTagsCount = $accounts.filter((account) => account.tags.length === 0).length;

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
			$accounts.forEach((account) => {
				const taskTags = account.tags.map((t) => t.name);
				if (selectedTags.some((tag) => taskTags.includes(tag))) {
					selectedTasks.add(account.id);
				}

				// If the "No Tags" tag is selected, add tasks that have no tags
				if (selectedTags.includes('No Tags') && account.tags.length === 0) {
					selectedTasks.add(account.id);
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
		} else if (items.length == filteredAccounts.length) {
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

<AccountNav
	{buttonTextCount}
	{searchValue}
	schedules={$schedules}
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
		totalSelectedItems={totalSelectedTasks}
		checkedItems={checkedCheckoutTasks}
		showDeleteTasks={false}
		on:selectTag={handleSelectTag}
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
		on:sort={handleSort}
		on:checkedAll={handleCheckedAll}
	>
		<AccountTableRow
			{row}
			checked={checkedCheckoutTasks.includes(row.itemId)}
			on:checked={handleChecked}
			on:start={handleTask}
			on:stop={handleTask}
			on:editActivity={handleTask}
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
