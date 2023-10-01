<script lang="ts">
	import Tags from '$lib/Tags.svelte';
	import Table from '$lib/Table.svelte';
	import UpdateBar from '$lib/UpdateBar.svelte';
	import ProfileNav from './ProfileNav.svelte';
	import ConfirmationModal from '$lib/ConfirmationModal.svelte';
	import {
		makeRequest,
		updateSortState,
		updateSelectedTags,
		removeTags,
		addTag,
		createAddAdditionalTag,
		createHandleChecked,
		computeTagCounts
	} from '../../helpers';
	import { showTags, shiftPressed, isLoading, profiles } from '../../datastore';
	import type {
		HeaderConfigType,
		TableRowType,
		ActivityState,
		SortState,
		Account,
		Profile,
		states,
		ShortProfile
	} from '../../types';
	import ProfileTableRow from '$lib/TableRows/ProfileTableRow.svelte';
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

	let filteredProfiles: Profile[] = [];
	let tableData: TableRowType<Profile | ShortProfile>[] = [];
	let tableIds: number[] = [];

	let selectedTags: string[] = [];
	let allTags: string[] = [];
	let tagsCount: { tag: string; count: number }[] = [];

	let headers: string[] = [];
	let headerConfig: HeaderConfigType<Profile> = {
		'Profile Name': (profile) => profile.name,
		'Line 1': (profile) => profile.shipping?.address_1 || '',
		'Line 2': (profile) => profile.shipping?.address_2 || '',
		Zip: (profile) => profile.shipping?.zip || '',
		State: (profile) => profile.shipping?.state || '',
		Payment: (profile) => profile.payment.card_name,
		Wins: (profile) => profile.previous_wins.number_of_wins.toString()
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
		profiles.update((profiles) => {
			const updatedProfiles = removeTags(
				profiles,
				selectedTags,
				'http://127.0.0.1:23432/profiles'
			) as Profile[];

			// Create a Map of the updated profiles for quick access
			const updatedProfilesMap = new Map(updatedProfiles.map((profile) => [profile.id, profile]));

			// Update tasks with the updated profiles
			return profiles.map((profile) => {
				const updatedAccount = updatedProfilesMap.get(profile.id);
				if (updatedAccount) {
					profile = updatedAccount;
				}
				return profile;
			});
		});

		selectedTags = []; // Clear selection after deleting
	};

	const updateTagNames = (e: CustomEvent) => {
		// Do not proceed with the function if the editedText is empty
		let editedText = e.detail;

		profiles.update((profiles) => {
			const updatedProfiles = addTag(
				profiles,
				selectedTags,
				editedText,
				'http://127.0.0.1:23432/profiles'
			) as Profile[];

			// Update tasks with the updated profiles
			return profiles.map((profile) => {
				const updatedAccount = updatedProfiles.find((newProfile) => newProfile.id === profile.id);
				if (updatedAccount) {
					profile = updatedAccount;
				}
				return profile;
			});
		});

		selectedTags = [];
	};

	const setSelectedTags = (newTags: string[]) => {
		selectedTags = newTags;
	};

	const getSelectedTags = () => selectedTags;

	const addAdditionalTag = createAddAdditionalTag(
		profiles.update,
		'http://127.0.0.1:23432/profiles',
		getSelectedTags,
		setSelectedTags
	);

	const addTagToAccount = (e: CustomEvent) => {
		let newTagText = e.detail;
		let updatedProfiles: (Account | Profile)[] = [];
		profiles.update((profiles) => {
			return profiles.map((profile) => {
				if (checkedItemIds.includes(profile.id)) {
					profile.tags.push({ name: newTagText });
					updatedProfiles.push(profile);
				}
				return profile;
			});
		});
		if (updatedProfiles.length > 0) {
			makeRequest('put', 'http://127.0.0.1:23432/profiles', updatedProfiles);
		}
	};

	const handleChecked = createHandleChecked(
		() => $profiles,
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
			let allIds = filteredProfiles.map((profile) => profile.id);
			checkedItemIds = allIds;
		} else {
			checkedItemIds = [];
		}
	};

	const handleTask = (e: CustomEvent) => {
		let state = e.type as states;
		let profileId: number | null = e.detail?.id || null;
		isLoading.set({ [`${state}${profileId}`]: true });

		let profileIds: number[];
		if (profileId) {
			profileIds = [profileId];
		} else {
			let all = $shiftPressed || checkedItemIds.filter((item) => item != -1).length === 0;
			profileIds = all ? filteredProfiles.map((profile) => profile.id) : checkedItemIds;
		}

		switch (state) {
			case 'delete':
				makeRequest('delete', 'http://127.0.0.1:23432/profiles', profileIds, () => {
					profiles.update((profiles) => {
						return profiles.filter((profile) => {
							if (profileIds.includes(profile.id)) {
								return false;
							}
							return true;
						});
					});
					isLoading.set({ [`${state}${profileId}`]: false });
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

	// Sets the value of filteredProfiles and tableData
	$: {
		let filtered = $profiles.filter((profile) => {
			// Keyword Search
			let keywordMatch = true;
			if (searchValue !== '') {
				keywordMatch = JSON.stringify(profile).toLowerCase().includes(searchValue.toLowerCase());
			}

			// Tag Filtering
			let tagMatch;
			if (selectedTags.includes('No Tags')) {
				tagMatch =
					profile.tags.length === 0 ||
					selectedTags.some((tag) => profile.tags.map((tagObj) => tagObj.name).includes(tag));
			} else {
				tagMatch =
					selectedTags.length === 0 ||
					selectedTags.some((tag) => profile.tags.map((tagObj) => tagObj.name).includes(tag));
			}

			// ActivityState Filtering
			return keywordMatch && tagMatch;
		});

		filteredProfiles = filtered;

		headers = Object.keys(headerConfig);
		tableIds = [];

		let tableDataShortenedTemp = filtered.map((row, index) => {
			const rowObject: TableRowType<Profile | ShortProfile> = {
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
	$: computeTagCounts(
		() => $profiles,
		(profile) => profile.tags,
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
			$profiles.forEach((profile) => {
				const taskTags = profile.tags.map((t) => t.name);
				if (selectedTags.some((tag) => taskTags.includes(tag))) {
					selectedTasks.add(profile.id);
				}

				// If the "No Tags" tag is selected, add tasks that have no tags
				if (selectedTags.includes('No Tags') && profile.tags.length === 0) {
					selectedTasks.add(profile.id);
				}
			});
		}
		totalSelectedTasks = selectedTasks.size;
	}

	// Sets the value of buttonTextCount
	$: {
		let items = checkedItemIds;
		if ($shiftPressed || items.length == 0 || items.length == filteredProfiles.length) {
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

<ProfileNav
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
		page="activity"
		checked={checkedItemIds.includes(row.itemId)}
		on:checked={handleChecked}
		on:delete={handleTask}
		on:start={handleTask}
		on:edit={handleTask}
		on:stop={handleTask}
		on:focus={handleTask}
	>
		<ProfileTableRow {value} {column} />
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
