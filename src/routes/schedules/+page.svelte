<script lang="ts">
	import Table from '$lib/Table.svelte';
	import UpdateBar from '$lib/UpdateBar.svelte';
	import ProxyNav from './ScheduleNav.svelte';
	import ConfirmationModal from '$lib/ConfirmationModal.svelte';
	import { createTableLogic, makeRequest, updateSortState } from '../../helpers';
	import { shiftPressed, isLoading, schedules } from '../../datastore';
	import type {
		HeaderConfigType,
		ActivityState,
		SortState,
		Schedule,
		states,
		TableRowType
	} from '../../types';
	import ScheduleTableRow from '$lib/TableRows/SchedulesTableRow.svelte';
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

	let filteredSchedules: Schedule[] = [];
	let tableData: TableRowType<Schedule>[] = [];
	let tableIds: number[] = [];

	let selectedTags: string[] = [];

	let headers: string[] = [];
	let headerConfig: HeaderConfigType<Schedule> = {
		Name: (schedule) => schedule.name,
		Time: (schedule) => schedule.start_time,
		Interval: (schedule) => schedule.interval_seconds.toString()
	};

	const handleSort = (e: CustomEvent) => {
		sortState = updateSortState(e, sortState);
	};

	const updateSearchValue = (e: CustomEvent) => {
		searchValue = e.detail;
	};

	const handleChecked = (e: CustomEvent) => {
		let itemId: number = e.detail;

		secondLastChecked = lastChecked;
		lastChecked = itemId;

		let arrayOfTaskIndexes = checkedItemIds;
		if (checkedItemIds.includes(itemId)) {
			arrayOfTaskIndexes.splice(arrayOfTaskIndexes.indexOf(itemId), 1);
		} else {
			arrayOfTaskIndexes.push(itemId);
		}
		checkedItemIds = arrayOfTaskIndexes;

		if ($shiftPressed && lastChecked === itemId && secondLastChecked !== null) {
			let start = Math.min(lastChecked, secondLastChecked);
			let end = Math.max(lastChecked, secondLastChecked);

			for (let i = start + 1; i < end; i++) {
				let taskWithThisId = $schedules.find((schedule) => schedule.id === i);
				if (taskWithThisId && !checkedItemIds.includes(taskWithThisId.id)) {
					checkedItemIds.push(i);
				}
			}
		}
	};

	const handleCheckedAll = (e: CustomEvent) => {
		checkedAll = e.detail.checked;

		if (e.detail.checked) {
			let allIds = filteredSchedules.map((schedule) => schedule.id);
			checkedItemIds = allIds;
		} else {
			checkedItemIds = [];
		}
	};

	const handleTask = (e: CustomEvent) => {
		let state = e.type as states;
		let scheduleId: number | null = e.detail?.id || null;
		isLoading.set({ [`${state}${scheduleId}`]: true });

		let scheduleIds: number[];
		if (scheduleId) {
			scheduleIds = [scheduleId];
		} else {
			let all = $shiftPressed || checkedItemIds.filter((item) => item != -1).length === 0;
			scheduleIds = all ? filteredSchedules.map((schedule) => schedule.id) : checkedItemIds;
		}

		switch (state) {
			case 'delete':
				makeRequest('delete', 'http://127.0.0.1:23432/schedules', scheduleIds, () => {
					schedules.update((schedules) => {
						return schedules.filter((schedule) => {
							if (scheduleIds.includes(schedule.id)) {
								return false;
							}
							return true;
						});
					});
					isLoading.set({ [`${state}${scheduleId}`]: false });
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
			() => $schedules,
			() => searchValue,
			() => selectedTags,
			() => selectedState,
			(tasks) => {
				filteredSchedules = tasks;
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

	// Sets the value of buttonTextCount
	$: {
		let items = checkedItemIds;
		if ($shiftPressed || items.length == 0 || items.length == filteredSchedules.length) {
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
		<ScheduleTableRow {value} {column} />
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
