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
		createAddAdditionalTag,
		removeTags,
		addTag,
		cleanDate,
		createHandleChecked,
		createTableLogic,
		computeTagCounts
	} from '../../helpers';
	import { accounts, showTags, shiftPressed, isLoading } from '../../datastore';
	import type {
		HeaderConfigType,
		TableRowType,
		ActivityState,
		SortState,
		Account,
		ShortAccount,
		states
	} from '../../types';
	import AccountTableRow from '$lib/TableRows/AccountTableRow.svelte';
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

	let filteredAccounts: ShortAccount[] = [];
	let tableData: TableRowType<Account>[] = [];
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
				const updatedAccount = updatedAccounts.find((thisAccount) => thisAccount.id === account.id);
				if (updatedAccount) {
					account = updatedAccount;
				}
				return account;
			});
		});

		selectedTags = [];
	};

	const setSelectedTags = (newTags: string[]) => {
		selectedTags = newTags;
	};

	const getSelectedTags = () => selectedTags;

	const addAdditionalTag = createAddAdditionalTag(
		accounts.update,
		'http://127.0.0.1:23432/accounts',
		getSelectedTags,
		setSelectedTags
	);

	const addTagToAccount = (e: CustomEvent) => {
		let newTagText = e.detail;
		let updatedAccounts: (Account | ShortAccount)[] = [];
		accounts.update((accounts) => {
			return accounts.map((account) => {
				if (checkedItemIds.includes(account.id)) {
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

	const handleChecked = createHandleChecked(
		() => $accounts,
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
			let allIds = filteredAccounts.map((account) => account.id);
			checkedItemIds = allIds;
		} else {
			checkedItemIds = [];
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
			let all = $shiftPressed || checkedItemIds.filter((item) => item != -1).length === 0;
			accountIds = all ? filteredAccounts.map((account) => account.id) : checkedItemIds;
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

	// Sets the value of filteredTasks and tableData
	$: {
		createTableLogic(
			() => $accounts,
			() => searchValue,
			() => selectedTags,
			() => selectedState,
			(tasks) => {
				filteredAccounts = tasks;
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
	$: computeTagCounts(
		() => $accounts,
		(account) => account.tags,
		(tags) => {
			allTags = tags;
		},
		(counts) => {
			tagsCount = counts;
		}
	);

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
		let items = checkedItemIds;
		if ($shiftPressed || items.length == 0 || items.length == filteredAccounts.length) {
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

<AccountNav
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
		on:addTagToTasks={addTagToAccount}
		on:deleteSelectedTags={deleteSelectedTags}
		on:updateTagNames={updateTagNames}
		on:addAdditionalTag={addAdditionalTag}
	/>
{/if}

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
		page="accounts"
		checked={checkedItemIds.includes(row.itemId)}
		on:checked={handleChecked}
		on:delete={handleTask}
		on:start={handleTask}
		on:edit={handleTask}
		on:stop={handleTask}
		on:focus={handleTask}
	>
		<AccountTableRow {value} {column} {row} />
	</BaseTableRow>
</Table>

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
