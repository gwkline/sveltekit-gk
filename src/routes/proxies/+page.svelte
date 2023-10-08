<script lang="ts">
	import Table from '$lib/Table.svelte';
	import UpdateBar from '$lib/UpdateBar.svelte';
	import ProxyNav from './ProxyNav.svelte';
	import ConfirmationModal from '$lib/ConfirmationModal.svelte';
	import {
		computeButtonTextCount,
		createHandleChecked,
		createTableLogic,
		makeRequest,
		updateSortState
	} from '../../helpers';
	import { shiftPressed, isLoading, proxy_lists } from '../../datastore';
	import type {
		HeaderConfigType,
		ActivityState,
		SortState,
		ProxyList,
		states,
		TableRowType
	} from '../../types';
	import ProxyListTableRow from '$lib/TableRows/SchedulesTableRow.svelte';
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

	let filteredProxyLists: ProxyList[] = [];
	let tableData: TableRowType<ProxyList>[] = [];
	let tableIds: number[] = [];

	let selectedTags: string[] = [];

	let headerConfig: HeaderConfigType<ProxyList> = {
		Name: (proxy_list) => proxy_list.name,
		Count: (proxy_list) => proxy_list.proxies?.length.toString() || '0',
		Wins: (proxy_list) => proxy_list.previous_wins.number_of_wins.toString()
	};

	const handleSort = (e: CustomEvent) => {
		sortState = updateSortState(e, sortState);
	};

	const updateSearchValue = (e: CustomEvent) => {
		searchValue = e.detail;
	};

	const handleCheckedAll = (e: CustomEvent) => {
		checkedAll = e.detail.checked;

		if (e.detail.checked) {
			let allIds = filteredProxyLists.map((proxy_list) => proxy_list.id);
			checkedItemIds = allIds;
		} else {
			checkedItemIds = [];
		}
	};

	const handleTask = (e: CustomEvent) => {
		let state = e.type as states;
		let proxy_listId: number | null = e.detail?.id || null;
		isLoading.set({ [`${state}${proxy_listId}`]: true });

		let proxy_listIds: number[];
		if (proxy_listId) {
			proxy_listIds = [proxy_listId];
		} else {
			let all = $shiftPressed || checkedItemIds.filter((item) => item != -1).length === 0;
			proxy_listIds = all ? filteredProxyLists.map((proxy_list) => proxy_list.id) : checkedItemIds;
		}

		switch (state) {
			case 'delete':
				makeRequest('delete', 'http://127.0.0.1:23432/proxy_lists', proxy_listIds, () => {
					proxy_lists.update((proxy_lists) => {
						return proxy_lists.filter((proxy_list) => {
							if (proxy_listIds.includes(proxy_list.id)) {
								return false;
							}
							return true;
						});
					});
					isLoading.set({ [`${state}${proxy_listId}`]: false });
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

	const handleChecked = createHandleChecked(
		() => $proxy_lists,
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

	// Sets the value of filteredTasks and tableData
	$: createTableLogic(
		() => $proxy_lists,
		() => searchValue,
		() => selectedTags,
		() => selectedState,
		(tasks) => {
			filteredProxyLists = tasks;
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

	// Sets the value of buttonTextCount
	$: buttonTextCount = computeButtonTextCount(
		() => checkedItemIds,
		() => filteredProxyLists,
		() => $shiftPressed
	);

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

<ProxyNav
	{buttonTextCount}
	{searchValue}
	on:searchValue={updateSearchValue}
	on:edit={handleEdit}
	on:delete={() => {
		showConfirmationModal = true;
	}}
/>

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
		page="activity"
		checked={checkedItemIds.includes(row.itemId)}
		on:checked={handleChecked}
		on:delete={handleTask}
		on:start={handleTask}
		on:edit={handleTask}
		on:stop={handleTask}
		on:focus={handleTask}
	>
		<ProxyListTableRow {value} {column} />
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
