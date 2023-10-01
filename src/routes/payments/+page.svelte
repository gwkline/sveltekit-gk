<script lang="ts">
	import Tags from '$lib/Tags.svelte';
	import Table from '$lib/Table.svelte';
	import UpdateBar from '$lib/UpdateBar.svelte';
	import PaymentNav from './PaymentNav.svelte';
	import ConfirmationModal from '$lib/ConfirmationModal.svelte';
	import {
		makeRequest,
		updateSortState,
		updateSelectedTags,
		removeTags,
		addTag,
		createAddAdditionalTag,
		createHandleChecked,
		createTableLogic,
		computeTagCounts,
		computeTotalSelectedTasks,
		computeButtonTextCount
	} from '../../helpers';
	import { showTags, shiftPressed, isLoading, payments } from '../../datastore';
	import type {
		HeaderConfigType,
		TableRowType,
		ActivityState,
		SortState,
		Payment,
		states
	} from '../../types';
	import PaymentTableRow from '$lib/TableRows/PaymentTableRow.svelte';
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

	let filteredPayments: Payment[] = [];
	let tableData: TableRowType<Payment>[] = [];
	let tableIds: number[] = [];

	let selectedTags: string[] = [];
	let allTags: string[] = [];
	let tagsCount: { tag: string; count: number }[] = [];

	let headers: string[] = [];
	let headerConfig: HeaderConfigType<Payment> = {
		Name: (payment) => payment.card_name || '',
		'Card Number': (payment) => maskCardNumber(payment.card_number),
		CVV: (payment) => payment.ccv,
		Expiration: (payment) => payment.exp_month + '/' + payment.exp_year
	};

	const maskCardNumber = (cardNumber: string): string => {
		const lastFour = cardNumber.slice(-4);
		if (lastFour.length === 0) return '';
		const maskedSection = '*'.repeat(cardNumber.length - 4);
		return maskedSection + lastFour;
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
		payments.update((payments) => {
			const updatedPayments = removeTags(
				payments,
				selectedTags,
				'http://127.0.0.1:23432/payments'
			) as Payment[];

			// Create a Map of the updated payments for quick access
			const updatedPaymentsMap = new Map(updatedPayments.map((payment) => [payment.id, payment]));

			// Update tasks with the updated payments
			return payments.map((payment) => {
				const updatedAccount = updatedPaymentsMap.get(payment.id);
				if (updatedAccount) {
					payment = updatedAccount;
				}
				return payment;
			});
		});

		selectedTags = []; // Clear selection after deleting
	};

	const updateTagNames = (e: CustomEvent) => {
		// Do not proceed with the function if the editedText is empty
		let editedText = e.detail;

		payments.update((payments) => {
			const updatedPayments = addTag(
				payments,
				selectedTags,
				editedText,
				'http://127.0.0.1:23432/payments'
			) as Payment[];

			// Update tasks with the updated payments
			return payments.map((payment) => {
				const updatedAccount = updatedPayments.find((newPayment) => newPayment.id === payment.id);
				if (updatedAccount) {
					payment = updatedAccount;
				}
				return payment;
			});
		});

		selectedTags = [];
	};

	const setSelectedTags = (newTags: string[]) => {
		selectedTags = newTags;
	};
	const getSelectedTags = () => selectedTags;

	const addAdditionalTag = createAddAdditionalTag(
		payments.update,
		'http://127.0.0.1:23432/payments',
		getSelectedTags,
		setSelectedTags
	);

	const addTagToPayment = (e: CustomEvent) => {
		let newTagText = e.detail;
		let updatedPayments: Payment[] = [];
		payments.update((payments) => {
			return payments.map((payment) => {
				if (checkedItemIds.includes(payment.id)) {
					payment.tags.push({ name: newTagText });
					updatedPayments.push(payment);
				}
				return payment;
			});
		});
		if (updatedPayments.length > 0) {
			makeRequest('put', 'http://127.0.0.1:23432/payments', updatedPayments);
		}
	};

	const handleChecked = createHandleChecked(
		() => $payments,
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
			let allIds = filteredPayments.map((payment) => payment.id);
			checkedItemIds = allIds;
		} else {
			checkedItemIds = [];
		}
	};

	const handleTask = (e: CustomEvent) => {
		let state = e.type as states;
		let paymentId: number | null = e.detail?.id || null;
		isLoading.set({ [`${state}${paymentId}`]: true });

		let paymentIds: number[];
		if (paymentId) {
			paymentIds = [paymentId];
		} else {
			let all = $shiftPressed || checkedItemIds.filter((item) => item != -1).length === 0;
			paymentIds = all ? filteredPayments.map((payment) => payment.id) : checkedItemIds;
		}

		switch (state) {
			case 'delete':
				makeRequest('delete', 'http://127.0.0.1:23432/payments', paymentIds, () => {
					payments.update((payments) => {
						return payments.filter((payment) => {
							if (paymentIds.includes(payment.id)) {
								return false;
							}
							return true;
						});
					});
					isLoading.set({ [`${state}${paymentId}`]: false });
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
			() => $payments,
			() => searchValue,
			() => selectedTags,
			() => selectedState,
			(tasks) => {
				filteredPayments = tasks;
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
		() => $payments,
		(payment) => payment.tags,
		(tags) => {
			allTags = tags;
		},
		(counts) => {
			tagsCount = counts;
		}
	);

	// Sets the value of totalSelectedTasks
	$: totalSelectedTasks = computeTotalSelectedTasks(
		() => $payments,
		() => selectedTags,
		(task) => task.tags
	);

	// Sets the value of buttonTextCount
	$: {
		buttonTextCount = computeButtonTextCount(
			() => checkedItemIds,
			() => filteredPayments,
			() => $shiftPressed
		);
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

<PaymentNav
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
		on:addTagToTasks={addTagToPayment}
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
		page="payments"
		checked={checkedItemIds.includes(row.itemId)}
		on:checked={handleChecked}
		on:delete={handleTask}
		on:start={handleTask}
		on:edit={handleTask}
		on:stop={handleTask}
		on:focus={handleTask}
	>
		<PaymentTableRow {value} {column} />
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
