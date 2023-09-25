<script lang="ts">
	import Button from '$lib/Button.svelte';
	import Input from '$lib/Input.svelte';
	import Checkbox from '$lib/Checkbox.svelte';
	import Dropdown from '$lib/Dropdown.svelte';
	import MultiDropdown from '$lib/MultiDropdown.svelte';
	import Toggle from '$lib/Toggle.svelte';
	import { faSave, faSearch, faStar, faX } from '@fortawesome/free-solid-svg-icons';
	import { cleanAccount, makeRequest } from '../../helpers';
	import { schedules, accounts, isLoading, checkoutSettings, verboseTasks } from '../../datastore';
	import type { Account, OutboundTask, Tag, Task } from '../../types';

	enum ModalType {
		None = 'None',
		Size = 'Size',
		Launches = 'Launches',
		CreateTasks = 'CreateTasks'
	}
	export let closeModal: () => void;
	export let currentModal: ModalType;
	export let checkedItemIds: number[] = [];

	export let sku = '';
	export let preferredSizeInput = '';
	export let randomSizeInput = '';
	export let isEditing = false;
	export let isDuplicating = false;

	let editSku: boolean = false;
	let editPreferredSizeInput: boolean = false;
	let editRandomSizeInput: boolean = false;
	let editScheduleDropdown: boolean = false;
	let editBrowserType: boolean = false;
	let editRetryMode: boolean = false;
	let editRetryNonWinner: boolean = false;
	let editRetryDeclines: boolean = false;
	let editExperimentalMode: boolean = false;

	let allAccountTags: string[];
	let allProfileTags: string[];
	let selectedAccountTags: string[] = [];
	let selectedProfileTags: string[] = [];
	let predictedTaskCount: number | string = 0;
	let scheduleNames = ['None', ...$schedules.map((schedule) => schedule.name)];
	let scheduleDropdown = 'None';

	const saveTasks = () => {
		let preferredSanitizedSizes = preferredSizeInput.split(',').map((item) => item.trim());

		let randomSanitizedSizes = randomSizeInput.split(',').map((item) => item.trim());

		let iter = 0;
		let filteredAccounts = $accounts;
		if ($checkoutSettings.specifyAccountsByAccountTag) {
			filteredAccounts = filteredAccounts.filter((account) => {
				let accountTags = account['tags'].map((item) => item.name);
				return accountTags.some((tag) => selectedAccountTags.includes(tag));
			});
		}
		if ($checkoutSettings.specifyAccountsByProfileTag) {
			filteredAccounts = filteredAccounts.filter((account) => {
				let profileTags = account['profile']['tags'].map((item) => item.name);
				return profileTags.some((tag) => selectedProfileTags.includes(tag));
			});
		}

		let scheduleId = 0;
		if (scheduleDropdown !== 'None') {
			scheduleId = $schedules.find((schedule) => schedule.name === scheduleDropdown)?.id || 0;
		}

		let tasks = filteredAccounts.map((account) => {
			let tags: Tag[];
			if ($checkoutSettings.useAccountTags) {
				tags = account['tags'];
			} else {
				tags = [];
			}

			let thisSize = preferredSanitizedSizes[iter % preferredSanitizedSizes.length];
			iter += 1;

			let enableRandomSizing = randomSanitizedSizes.length > 0;

			return {
				product: {
					product_id: sku,
					product_uri: 'https://www.nike.com/launch',
					size: thisSize,
					allowed_random_sizes: randomSanitizedSizes,
					enable_random_sizing: enableRandomSizing
				},
				headless: false,
				experimental_mode: $checkoutSettings.experimentalMode,
				retry_non_winner: $checkoutSettings.retryNonWinner,
				retry_on_decline: $checkoutSettings.retryDeclines,
				tags: tags,
				account_id: account['id'],
				schedule_id: scheduleId,
				max_expedited_shipping_price: 0,
				browser_type: $checkoutSettings.browserType,
				nike_module_type: 'Auto',
				retry_mode: $checkoutSettings.retryMode
			};
		});

		return makeRequest('post', 'http://127.0.0.1:23432/tasks?type=checkout', tasks, (response) => {
			let newTasks = response.data.created;
			let cleanedData = newTasks.map((task: Task) => {
				task['account'] = cleanAccount(task.account as Account);
				return task;
			});
			verboseTasks.update((tasks) => {
				return tasks.concat(cleanedData);
			});
		});
	};
	const editTasks = () => {
		let updatedTasks: OutboundTask[] = [];
		verboseTasks.update((tasks) => {
			let iter = 0;
			return tasks.map((task) => {
				if (checkedItemIds.length === 0 || checkedItemIds.includes(task.id)) {
					if (editSku) {
						task.product.product_id = sku;
					}
					if (editPreferredSizeInput) {
						let preferredSanitizedSizes = preferredSizeInput.split(',').map((item) => item.trim());
						task.product.size = preferredSanitizedSizes[iter % preferredSanitizedSizes.length];
					}
					if (editRandomSizeInput) {
						let randomSanitizedSizes = randomSizeInput.split(',').map((item) => item.trim());
						task.product.allowed_random_sizes = randomSanitizedSizes;
						task.product.enable_random_sizing = randomSanitizedSizes.length > 0;
					}
					if (editScheduleDropdown) {
						let scheduleId =
							scheduleDropdown !== 'None'
								? $schedules.find((schedule) => schedule.name === scheduleDropdown)?.id || 0
								: 0;
						task.schedule_id = scheduleId;
					}
					if (editBrowserType) {
						task.browser_type = $checkoutSettings.browserType;
					}
					if (editRetryMode) {
						task.retry_mode = $checkoutSettings.retryMode;
					}
					if (editRetryNonWinner) {
						task.retry_non_winner = $checkoutSettings.retryNonWinner;
					}
					if (editRetryDeclines) {
						task.retry_on_decline = $checkoutSettings.retryDeclines;
					}
					if (editExperimentalMode) {
						task.experimental_mode = $checkoutSettings.experimentalMode;
					}
				}
				updatedTasks.push(task);
				return task;
			});
		});

		return makeRequest('put', 'http://127.0.0.1:23432/tasks?type=checkout', updatedTasks, () => {});
	};

	const duplicateTasks = () => {
		let updatedTasks: OutboundTask[] = [];
		let iter = 0;
		$verboseTasks.forEach((task: OutboundTask) => {
			if (checkedItemIds.length === 0 || checkedItemIds.includes(task.id)) {
				task.account = null;
				task.id = 0;

				if (editSku) {
					task.product.product_id = sku;
				}
				if (editPreferredSizeInput) {
					let preferredSanitizedSizes = preferredSizeInput.split(',').map((item) => item.trim());
					task.product.size = preferredSanitizedSizes[iter % preferredSanitizedSizes.length];
				}
				if (editRandomSizeInput) {
					let randomSanitizedSizes = randomSizeInput.split(',').map((item) => item.trim());
					task.product.allowed_random_sizes = randomSanitizedSizes;
					task.product.enable_random_sizing = randomSanitizedSizes.length > 0;
				}
				if (editScheduleDropdown) {
					let scheduleId =
						scheduleDropdown !== 'None'
							? $schedules.find((schedule) => schedule.name === scheduleDropdown)?.id || 0
							: 0;
					task.schedule_id = scheduleId;
				}
				if (editBrowserType) {
					task.browser_type = $checkoutSettings.browserType;
				}
				if (editRetryMode) {
					task.retry_mode = $checkoutSettings.retryMode;
				}
				if (editRetryNonWinner) {
					task.retry_non_winner = $checkoutSettings.retryNonWinner;
				}
				if (editRetryDeclines) {
					task.retry_on_decline = $checkoutSettings.retryDeclines;
				}
				if (editExperimentalMode) {
					task.experimental_mode = $checkoutSettings.experimentalMode;
				}
				updatedTasks.push(task);
			}
		});

		return makeRequest(
			'post',
			'http://127.0.0.1:23432/tasks?type=checkout',
			updatedTasks,
			(response) => {
				if (response.status === 200) {
					// Add the newly created tasks to the verboseTasks list
					verboseTasks.update((tasks) => [...tasks, ...response.data.created]);
				}
			}
		);
	};

	const handleSaveClicked = () => {
		isLoading.set({ saveTasks: true });

		if (isEditing && isDuplicating) {
			duplicateTasks();
		}
		if (isEditing) {
			editTasks();
		} else {
			saveTasks();
		}

		isLoading.set({ saveTasks: false });
		closeModal();
		isEditing = false;
		isDuplicating = false;
	};

	$: {
		allAccountTags = Array.from(
			new Set(
				$accounts
					.flatMap((account) => account.tags)
					.filter((tag) => tag && tag.name)
					.map((tag) => tag.name)
			)
		);
	}

	$: {
		allProfileTags = Array.from(
			new Set(
				$accounts
					.flatMap((account) => account.profile?.tags) // Access profile tags
					.filter((tag) => tag && tag.name) // Filter out null and tags without a name
					.map((tag) => tag.name) // Map to tag names
			)
		);
	}

	$: dropdownStatus1 = $checkoutSettings.specifyAccountsByAccountTag ? true : false;
	$: dropdownStatus2 = $checkoutSettings.specifyAccountsByProfileTag ? true : false;

	$: {
		if (!isEditing && !isDuplicating) {
			let filteredAccounts = $accounts;
			let selectedAccountTagsSet = new Set(selectedAccountTags);
			let selectedProfileTagsSet = new Set(selectedProfileTags);

			if (selectedAccountTagsSet.size > 0 && dropdownStatus1) {
				filteredAccounts = filteredAccounts.filter((account) => {
					let tags = account.tags.map((tag) => tag.name);

					// Check if some tag is in selectedAccountTagsSet
					return tags.some((tag) => selectedAccountTagsSet.has(tag));
				});
			}

			if (selectedProfileTagsSet.size > 0 && dropdownStatus2) {
				filteredAccounts = filteredAccounts.filter((account) => {
					let profileTags = account.profile.tags?.map((tag) => tag.name) || [];

					// Check if some tag is in selectedProfileTagsSet
					return profileTags.some((tag) => selectedProfileTagsSet.has(tag));
				});
			}

			predictedTaskCount = filteredAccounts.length;
		} else {
			predictedTaskCount = checkedItemIds.length === 0 ? 'all' : checkedItemIds.length;
		}
	}

	const saveButtonText = () => {
		if (isDuplicating) return 'Duplicate';
		if (isEditing) return 'Edit';
		return 'Save';
	};
</script>

<div style="display: flex; justify-content: space-between; height: 20px; background: inherit">
	<h5 style="margin-bottom: 20px;">{isEditing ? 'Edit Tasks' : 'Create Tasks'}</h5>
	<Button
		variant="default"
		icon={faX}
		size="sm"
		shape="square"
		shadow={false}
		style="width: 20px;"
		onclick={closeModal}
	/>
</div>
<div class="row">
	<div class="component-wrapper sku">
		{#if isEditing}
			<Toggle bind:checked={editSku} style="margin-right: 10px; margin-bottom: 8px;" />
		{/if}
		<Input
			placeholder="Enter SKU"
			bind:value={sku}
			title="SKU"
			style="height: 36px;"
			disabled={isEditing && !editSku ? true : false}
		/>
		<Button
			icon={faSearch}
			style="margin-left: 10px;"
			onclick={() => {
				currentModal = ModalType.Launches;
			}}
			shape="square"
			size="sm"
			disabled={isEditing && !editSku ? true : false}
		/>
	</div>
	<div class="component-wrapper browser">
		{#if isEditing}
			<Toggle bind:checked={editBrowserType} style="margin-right: 10px; margin-bottom: 8px;" />
		{/if}
		<Dropdown
			title="Browser Type"
			id="browserDropdown"
			style="width: 200px"
			options={['Default', 'Chrome', 'Chrome Beta', 'Edge', 'Brave']}
			bind:value={$checkoutSettings.browserType}
			size="lg"
			disabled={isEditing && !editBrowserType ? true : false}
		/>
	</div>
</div>
<div class="row inputs">
	<div class="component-wrapper retryMode">
		{#if isEditing}
			<Toggle bind:checked={editRetryMode} style="margin-right: 10px; margin-bottom: 8px;" />
		{/if}
		<Dropdown
			title="Retry Mode"
			id="$checkoutSettings.retryMode"
			style="width: 200px"
			options={['Requeue', 'Restart']}
			bind:value={$checkoutSettings.retryMode}
			size="lg"
			disabled={isEditing && !editRetryMode ? true : false}
		/>
	</div>
	<div class="component-wrapper schedule">
		{#if isEditing}
			<Toggle bind:checked={editScheduleDropdown} style="margin-right: 10px; margin-bottom: 8px;" />
		{/if}
		<Dropdown
			title="Schedule"
			id="scheduleDropdown"
			style="width: 200px"
			options={scheduleNames}
			bind:value={scheduleDropdown}
			size="lg"
			disabled={isEditing && !editScheduleDropdown ? true : false}
		/>
	</div>
</div>
<div class="row">
	<div class="component-wrapper sizeRow">
		{#if isEditing}
			<Toggle
				bind:checked={editPreferredSizeInput}
				style="margin-right: 10px; margin-bottom: 8px;"
			/>
		{/if}
		<Input
			title="Preferred Size Input"
			placeholder="Enter Size Input"
			bind:value={preferredSizeInput}
			style="height: 36px; width: 100%;"
			fullWidth={true}
			disabled={isEditing && !editPreferredSizeInput ? true : false}
		/>
		<Button
			icon={faStar}
			onclick={() => {
				currentModal = ModalType.Size;
			}}
			style="margin: 0 0 0 10px;"
			shape="square"
			size="sm"
			disabled={isEditing && !editPreferredSizeInput ? true : false}
		/>
	</div>
</div>
<div class="row">
	<div class="component-wrapper sizeRow">
		<div class="component-wrapper">
			{#if isEditing}
				<Toggle
					bind:checked={editRandomSizeInput}
					style="margin-right: 10px; margin-bottom: 8px;"
				/>
			{/if}
			<Input
				title="Random Size Input"
				placeholder="Enter Size Input"
				bind:value={randomSizeInput}
				style="height: 36px; width: 100%;"
				fullWidth={true}
				disabled={isEditing && !editRandomSizeInput ? true : false}
			/>
			<Button
				icon={faStar}
				onclick={() => {
					currentModal = ModalType.Size;
				}}
				style="margin: 0 0 0 10px;"
				shape="square"
				size="sm"
				disabled={isEditing && !editRandomSizeInput ? true : false}
			/>
		</div>
	</div>
</div>

<div class="row-checkbox">
	<div class="component-wrapper checkboxWrapper">
		<div class="component-wrapper checkbox">
			<div class="checkbox-wrapper">
				{#if isEditing}
					<Toggle bind:checked={editRetryNonWinner} style="margin-right: 10px;" />
				{/if}
				<Checkbox
					option="$checkoutSettings.retryNonWinner"
					bind:checked={$checkoutSettings.retryNonWinner}
					disabled={isEditing && !editRetryNonWinner ? true : false}
				/>
				<label for="$checkoutSettings.retryNonWinner"> Retry Non-Winner </label>
			</div>
		</div>
		<div class="component-wrapper checkbox">
			<div class="checkbox-wrapper">
				{#if isEditing}
					<Toggle bind:checked={editRetryDeclines} style="margin-right: 10px;" />
				{/if}
				<Checkbox
					option="$checkoutSettings.retryDeclines"
					bind:checked={$checkoutSettings.retryDeclines}
					disabled={isEditing && !editRetryDeclines ? true : false}
				/>
				<label for="$checkoutSettings.retryDeclines"> Retry Declines </label>
			</div>
		</div>
	</div>
</div>
<div class="row-checkbox">
	<div class="component-wrapper checkboxWrapper">
		<div class="component-wrapper checkbox">
			{#if isEditing}
				<Toggle bind:checked={editExperimentalMode} style="margin-right: 10px;" />
			{/if}
			<div class="checkbox-wrapper">
				<Checkbox
					option="$checkoutSettings.experimentalMode"
					bind:checked={$checkoutSettings.experimentalMode}
					disabled={isEditing && !editExperimentalMode ? true : false}
				/>
				<label for="$checkoutSettings.experimentalMode"> Experimental Mode </label>
			</div>
		</div>
		{#if !isEditing}
			<div class="component-wrapper checkbox">
				<div class="checkbox-wrapper">
					<Checkbox
						option="$checkoutSettings.useAccountTags"
						bind:checked={$checkoutSettings.useAccountTags}
					/>
					<label for="$checkoutSettings.useAccountTags"> Use Account Tags </label>
				</div>
			</div>
		{/if}
	</div>
</div>
{#if !isEditing}
	<div class="row-checkbox">
		<div class="component-wrapper checkboxWrapper">
			<div class="component-wrapper checkbox">
				<div class="checkbox-wrapper">
					<Checkbox
						option="$checkoutSettings.specifyAccountsByAccountTag"
						bind:checked={$checkoutSettings.specifyAccountsByAccountTag}
					/>
					<label for="$checkoutSettings.specifyAccountsByAccountTag">
						Specify Accounts By Account Tag
					</label>
				</div>
			</div>
			<div class="component-wrapper checkbox">
				<div class="checkbox-wrapper">
					<Checkbox
						option="$checkoutSettings.specifyAccountsByProfileTag"
						bind:checked={$checkoutSettings.specifyAccountsByProfileTag}
					/>
					<label for="$checkoutSettings.specifyAccountsByProfileTag">
						Specify Accounts By Profile Tag
					</label>
				</div>
			</div>
		</div>
	</div>

	<div class="row">
		<MultiDropdown
			title=""
			style="width: 220px"
			options={allAccountTags}
			disabled={!dropdownStatus1}
			on:update={({ detail }) => (selectedAccountTags = detail.selected)}
		/>
		<MultiDropdown
			title=""
			style="width: 220px"
			options={allProfileTags}
			disabled={!dropdownStatus2}
			on:update={({ detail }) => (selectedProfileTags = detail.selected)}
		/>
	</div>
{/if}
<div class="row justify-content-center">
	<Button variant="primary" size="md" onclick={closeModal}>Cancel</Button>
	<Button
		variant="primary"
		alternate={true}
		size="md"
		icon={faSave}
		onclick={handleSaveClicked}
		isLoading={$isLoading['saveTasks']}>{saveButtonText()} {predictedTaskCount} tasks</Button
	>
</div>

<style>
	h5 {
		margin: 0;
	}

	.component-wrapper.browser,
	.component-wrapper.schedule {
		justify-content: flex-end;
	}

	.row,
	.row-checkbox {
		display: flex;
		flex-direction: row;
		width: 100%;
		justify-content: space-between;
	}

	.row {
		margin: 10px 0px;
		align-items: end;
	}

	.row-checkbox {
		margin: 5px 0px;
		align-items: center;
	}

	.component-wrapper {
		display: flex;
		flex-direction: row;
		justify-content: start;
		width: 100%;
		align-items: end;
	}

	.checkboxWrapper {
		display: flex;
		flex-direction: row;
		justify-content: space-between;
		width: 100%;
	}

	.component-wrapper.checkbox {
		width: 45%;
		align-items: center;
	}

	.checkbox-wrapper {
		display: flex;
		align-items: center;
		height: 30px;
		cursor: pointer;
	}

	label {
		font-size: small;
		margin: 0 10px;
		cursor: pointer;
	}

	.justify-content-center {
		margin-top: 30px;
		justify-content: end;
		margin-bottom: 0px;
		gap: 20px;
	}

	.sizeRow {
		width: 100%;
	}
</style>
