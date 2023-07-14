<script lang="ts">
	import Button from '$lib/Button.svelte';
	import Input from '$lib/Input.svelte';
	import Checkbox from '$lib/Checkbox.svelte';
	import Dropdown from '$lib/Dropdown.svelte';
	import MultiDropdown from '$lib/MultiDropdown.svelte';
	import Toggle from '$lib/Toggle.svelte';
	import { faSave, faSearch, faStar } from '@fortawesome/free-solid-svg-icons';
	import { makeRequest } from '../../helpers';
	import {
		schedules,
		accounts,
		isLoading,
		checkoutSettings,
		verboseTasks,
		checkedCheckoutTasks,
		editSku,
		editPreferredSizeInput,
		editRandomSizeInput,
		editScheduleDropdown,
		editBrowserType,
		editRetryMode,
		editRetryNonWinner,
		editRetryDeclines,
		editExperimentalMode
	} from '../../datastore';
	import type { Account, Tag } from '../../types';

	enum ModalType {
		None = 'None',
		Size = 'Size',
		Launches = 'Launches',
		CreateTasks = 'CreateTasks'
	}
	export let closeModal: () => void;
	export let currentModal: ModalType;

	export let sku = '';
	export let preferredSizeInput = '';
	export let randomSizeInput = '';
	export let isEditing = false;

	let allAccountTags: string[];
	let allProfileTags: string[];
	let selectedAccountTags: string[];
	let selectedProfileTags: string[];
	let scheduleNames = ['None', ...$schedules.map((schedule) => schedule.name)];
	let scheduleDropdown = 'None';

	const startEditing = () => {
		isEditing = true;
	};

	const endEditing = () => {
		isEditing = false;
	};

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

		return makeRequest('post', 'http://127.0.0.1:23432/tasks?type=checkout', tasks);
	};

	const editTasks = () => {
		let updatedTasks: any[] = [];
		verboseTasks.update((tasks) => {
			let iter = 0;
			return tasks.map((task) => {
				if ($checkedCheckoutTasks.length === 0 || $checkedCheckoutTasks.includes(task.id)) {
					if ($editSku) {
						task.product.product_id = sku;
					}
					if ($editPreferredSizeInput) {
						let preferredSanitizedSizes = preferredSizeInput.split(',').map((item) => item.trim());
						task.product.size = preferredSanitizedSizes[iter % preferredSanitizedSizes.length];
					}
					if ($editRandomSizeInput) {
						let randomSanitizedSizes = randomSizeInput.split(',').map((item) => item.trim());
						task.product.allowed_random_sizes = randomSanitizedSizes;
						task.product.enable_random_sizing = randomSanitizedSizes.length > 0;
					}
					if ($editScheduleDropdown) {
						let scheduleId =
							scheduleDropdown !== 'None'
								? $schedules.find((schedule) => schedule.name === scheduleDropdown)?.id || 0
								: 0;
						task.schedule_id = scheduleId;
					}
					if ($editBrowserType) {
						task.browser_type = $checkoutSettings.browserType;
					}
					if ($editRetryMode) {
						task.retry_mode = $checkoutSettings.retryMode;
					}
					if ($editRetryNonWinner) {
						task.retry_non_winner = $checkoutSettings.retryNonWinner;
					}
					if ($editRetryDeclines) {
						task.retry_on_decline = $checkoutSettings.retryDeclines;
					}
					if ($editExperimentalMode) {
						task.experimental_mode = $checkoutSettings.experimentalMode;
					}
				}
				updatedTasks.push(task);
				return task;
			});
		});

		return makeRequest(
			'post',
			'http://127.0.0.1:23432/tasks?type=checkout',
			updatedTasks,
			() => {}
		);
	};

	const handleSaveClicked = () => {
		isLoading.set({ saveTasks: true });

		if (isEditing) {
			editTasks();
			isEditing = false;
		} else {
			saveTasks();
		}

		isLoading.set({ saveTasks: false });
		closeModal();
	};

	makeRequest('get', 'http://127.0.0.1:23432/schedules', null, (response) => {
		schedules.set(response.data);
	});

	makeRequest('get', 'http://127.0.0.1:23432/accounts', null, (response) => {
		let rawAccounts: Account[] = response.data;
		let cleanedAccounts = rawAccounts.map((account) => {
			account['metadata'] = {};
			let profile = account['profile'];
			let payment = profile['payment'];

			account['profile'] = {
				name: profile['name'],
				payment: {
					id: payment['id'],
					tags: payment['tags']
				},
				id: profile['id'],
				tags: profile['tags']
			};
			return account;
		});

		accounts.set(cleanedAccounts);
	});

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
</script>

<h5 style="margin-bottom: 20px;">{isEditing ? 'Edit Tasks' : 'Create Tasks'}</h5>
<div class="row">
	<div class="component-wrapper sku">
		{#if isEditing}
			<Toggle bind:checked={$editSku} style="margin-right: 10px; margin-bottom: 8px;" />
		{/if}
		<Input
			placeholder="Enter SKU"
			bind:value={sku}
			title="SKU"
			style="height: 36px;"
			variant="transparent"
			disabled={isEditing && !$editSku ? true : false}
		/>
		<Button
			icon={faSearch}
			style="margin-left: 10px;"
			onclick={() => {
				currentModal = ModalType.Launches;
			}}
			disabled={isEditing && !$editSku ? true : false}
		/>
	</div>
	<div class="component-wrapper browser">
		{#if isEditing}
			<Toggle bind:checked={$editBrowserType} style="margin-right: 10px; margin-bottom: 8px;" />
		{/if}
		<Dropdown
			title="Browser Type"
			id="browserDropdown"
			style="width: 200px"
			options={['Default', 'Chrome', 'Chrome Beta', 'Edge', 'Brave']}
			bind:value={$checkoutSettings.browserType}
			size="lg"
			disabled={isEditing && !$editBrowserType ? true : false}
		/>
	</div>
</div>
<div class="row inputs">
	<div class="component-wrapper retryMode">
		{#if isEditing}
			<Toggle bind:checked={$editRetryMode} style="margin-right: 10px; margin-bottom: 8px;" />
		{/if}
		<Dropdown
			title="Retry Mode"
			id="$checkoutSettings.retryMode"
			style="width: 200px"
			options={['Requeue', 'Restart']}
			bind:value={$checkoutSettings.retryMode}
			size="lg"
			disabled={isEditing && !$editRetryMode ? true : false}
		/>
	</div>
	<div class="component-wrapper schedule">
		{#if isEditing}
			<Toggle
				bind:checked={$editScheduleDropdown}
				style="margin-right: 10px; margin-bottom: 8px;"
			/>
		{/if}
		<Dropdown
			title="Schedule"
			id="scheduleDropdown"
			style="width: 200px"
			options={scheduleNames}
			bind:value={scheduleDropdown}
			size="lg"
			disabled={isEditing && !$editScheduleDropdown ? true : false}
		/>
	</div>
</div>
<div class="row">
	<div class="component-wrapper sizeRow">
		{#if isEditing}
			<Toggle
				bind:checked={$editPreferredSizeInput}
				style="margin-right: 10px; margin-bottom: 8px;"
			/>
		{/if}
		<Input
			title="Preferred Size Input"
			placeholder="Enter Size Input"
			bind:value={preferredSizeInput}
			style="height: 36px; width: 100%;"
			variant="transparent"
			disabled={isEditing && !$editPreferredSizeInput ? true : false}
		/>
		<Button
			icon={faStar}
			onclick={() => {
				currentModal = ModalType.Size;
			}}
			style="margin: 0 0 0 10px;"
			disabled={isEditing && !$editPreferredSizeInput ? true : false}
		/>
	</div>
</div>
<div class="row">
	<div class="component-wrapper sizeRow">
		<div class="component-wrapper">
			{#if isEditing}
				<Toggle
					bind:checked={$editRandomSizeInput}
					style="margin-right: 10px; margin-bottom: 8px;"
				/>
			{/if}
			<Input
				title="Random Size Input"
				placeholder="Enter Size Input"
				bind:value={randomSizeInput}
				style="height: 36px; width: 100%;"
				variant="transparent"
				disabled={isEditing && !$editRandomSizeInput ? true : false}
			/>
			<Button
				icon={faStar}
				onclick={() => {
					currentModal = ModalType.Size;
				}}
				style="margin: 0 0 0 10px;"
				disabled={isEditing && !$editRandomSizeInput ? true : false}
			/>
		</div>
	</div>
</div>

<div class="row-checkbox">
	<div class="component-wrapper checkboxWrapper">
		<div class="component-wrapper checkbox">
			{#if isEditing}
				<Toggle bind:checked={$editRetryNonWinner} style="margin-right: 10px;" />
			{/if}
			<Checkbox
				option="$checkoutSettings.retryNonWinner"
				bind:checked={$checkoutSettings.retryNonWinner}
				disabled={isEditing && !$editRetryNonWinner ? true : false}
			/>
			<label for="$checkoutSettings.retryNonWinner"> Retry Non-Winner </label>
		</div>
		<div class="component-wrapper checkbox">
			<div class="checkbox-wrapper">
				{#if isEditing}
					<Toggle bind:checked={$editRetryDeclines} style="margin-right: 10px;" />
				{/if}
				<Checkbox
					option="$checkoutSettings.retryDeclines"
					bind:checked={$checkoutSettings.retryDeclines}
					disabled={isEditing && !$editRetryDeclines ? true : false}
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
				<Toggle bind:checked={$editExperimentalMode} style="margin-right: 10px;" />
			{/if}
			<div class="checkbox-wrapper">
				<Checkbox
					option="$checkoutSettings.experimentalMode"
					bind:checked={$checkoutSettings.experimentalMode}
					disabled={isEditing && !$editExperimentalMode ? true : false}
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
	<Button variant="secondary" size="lg" onclick={closeModal}>Cancel</Button>
	<Button
		variant="primary"
		size="lg"
		icon={faSave}
		onclick={handleSaveClicked}
		isLoading={$isLoading['saveTasks']}>Save</Button
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
	}

	label {
		font-size: small;
		margin: 0 10px;
	}

	.justify-content-center {
		margin-top: 30px;
		justify-content: center;
	}

	.sizeRow {
		width: 100%;
	}
</style>