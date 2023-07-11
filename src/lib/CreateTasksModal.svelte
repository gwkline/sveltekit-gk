<script lang="ts">
	import Modal from './Modal.svelte';
	import Button from './Button.svelte';
	import Input from './Input.svelte';
	import Dropdown from './Dropdown.svelte';
	import Checkbox from './Checkbox.svelte';
	import { faSave } from '@fortawesome/free-solid-svg-icons';
	import { makeRequest } from '../helpers';
	import type { Account, Schedule, Tag } from '../types';
	import { schedules, accounts, isLoading, checkoutSettings } from '../datastore';
	import MultiDropdown from './MultiDropdown.svelte';

	export let showModal;
	export let closeModal: () => void;
	export let modalTitle: string;

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

	let allAccountTags: string[];
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

	let allProfileTags: string[];
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

	let selectedAccountTags: string[];
	let selectedProfileTags: string[];
	let scheduleNames = ['None', ...$schedules.map((schedule) => schedule.name)];

	// Add state variables for the form input values
	let sku = 'DV0831-103';
	let preferredSizeInput = '10,9,8,7,6';
	let randomSizeInput = '10,9,8,7,6';
	let scheduleDropdown = 'None';

	let browserDropdown: string;
	$: browserDropdown = $checkoutSettings.browserType;

	let errorHandlingDropdown: string;
	$: errorHandlingDropdown = $checkoutSettings.retryMode;

	let retryNonWinner: boolean;
	$: retryNonWinner = $checkoutSettings.retryNonWinner;

	let retryDeclines: boolean;
	$: retryDeclines = $checkoutSettings.retryDeclines;

	let experimentalMode: boolean;
	$: experimentalMode = $checkoutSettings.experimentalMode;

	let useAccountTags: boolean;
	$: useAccountTags = $checkoutSettings.useAccountTags;

	$: dropdownStatus1 = specifyAccountsByAccountTag ? 'default' : 'disabled';
	$: dropdownStatus2 = specifyAccountsByProfileTag ? 'default' : 'disabled';

	let specifyAccountsByAccountTag: boolean;
	$: specifyAccountsByAccountTag = $checkoutSettings.specifyAccountsByAccountTag;

	let specifyAccountsByProfileTag: boolean;
	$: specifyAccountsByProfileTag = $checkoutSettings.specifyAccountsByProfileTag;

	const saveTasks = () => {
		let preferredSanitizedSizes = preferredSizeInput.split(',').map((item) => item.trim());

		let randomSanitizedSizes = randomSizeInput.split(',').map((item) => item.trim());

		let iter = 0;
		let filteredAccounts = $accounts;
		if (specifyAccountsByAccountTag) {
			filteredAccounts = filteredAccounts.filter((account) => {
				let accountTags = account['tags'].map((item) => item.name);
				return accountTags.some((tag) => selectedAccountTags.includes(tag));
			});
		}
		if (specifyAccountsByProfileTag) {
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
			if (useAccountTags) {
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
				experimental_mode: experimentalMode,
				retry_non_winner: retryNonWinner,
				retry_on_decline: retryDeclines,
				tags: tags,
				account_id: account['id'],
				schedule_id: scheduleId,
				max_expedited_shipping_price: 0,
				browser_type: browserDropdown,
				nike_module_type: 'Auto',
				retry_mode: errorHandlingDropdown
			};
		});

		return makeRequest('post', 'http://127.0.0.1:23432/tasks?type=checkout', tasks, () => {
			closeModal();
		});
	};
</script>

<Modal on:close={() => (showModal = false)}>
	<div slot="modal" class="modal-body">
		<h5 style="margin-bottom: 20px;">{modalTitle}</h5>
		<div class="form-row">
			<Input placeholder="Enter SKU" bind:value={sku} title="SKU" />
			<Dropdown
				title="Browser Type"
				id="browserDropdown"
				style="width: 200px"
				options={['Default', 'Chrome', 'Chrome Beta', 'Edge', 'Brave']}
				bind:value={browserDropdown}
				size="lg"
			/>
		</div>
		<div class="form-row">
			<Input
				title="Preferred Size Input"
				placeholder="Enter Size Input"
				bind:value={preferredSizeInput}
			/>

			<Dropdown
				title="Retry Mode"
				id="errorHandlingDropdown"
				style="width: 200px"
				options={['Requeue', 'Restart']}
				bind:value={errorHandlingDropdown}
				size="lg"
			/>
		</div>
		<div class="form-row">
			<Input
				title="Random Size Input"
				placeholder="Enter Size Input"
				bind:value={randomSizeInput}
			/>
			<Dropdown
				title="Schedule"
				id="scheduleDropdown"
				style="width: 200px"
				options={scheduleNames}
				bind:value={scheduleDropdown}
				size="lg"
			/>
		</div>

		<div class="form-row-checkbox">
			<div class="checkbox-wrapper">
				<Checkbox option="retryNonWinner" bind:checked={$checkoutSettings.retryNonWinner} />
				<label for="retryNonWinner"> Retry Non-Winner </label>
			</div>
			<div class="checkbox-wrapper">
				<Checkbox option="retryDeclines" bind:checked={$checkoutSettings.retryDeclines} />
				<label for="retryDeclines"> Retry Declines </label>
			</div>
		</div>
		<div class="form-row-checkbox">
			<div class="checkbox-wrapper">
				<Checkbox option="useAccountTags" bind:checked={$checkoutSettings.useAccountTags} />
				<label for="useAccountTags"> Use Account Tags </label>
			</div>
			<div class="checkbox-wrapper">
				<Checkbox option="experimentalMode" bind:checked={$checkoutSettings.experimentalMode} />
				<label for="experimentalMode"> Experimental Mode </label>
			</div>
		</div>
		<div class="form-row-checkbox">
			<div class="checkbox-wrapper">
				<Checkbox
					option="specifyAccountsByAccountTag"
					bind:checked={$checkoutSettings.specifyAccountsByAccountTag}
				/>
				<label for="specifyAccountsByAccountTag"> Specify Accounts By Account Tag </label>
			</div>
			<div class="checkbox-wrapper">
				<Checkbox
					option="specifyAccountsByProfileTag"
					bind:checked={$checkoutSettings.specifyAccountsByProfileTag}
				/>
				<label for="specifyAccountsByProfileTag"> Specify Accounts By Profile Tag </label>
			</div>
		</div>
		<div class="form-row">
			<MultiDropdown
				title=""
				style="width: 200px"
				options={allAccountTags}
				status={dropdownStatus1}
				on:update={({ detail }) => (selectedAccountTags = detail.selected)}
			/>
			<MultiDropdown
				title=""
				style="width: 200px"
				options={allProfileTags}
				status={dropdownStatus2}
				on:update={({ detail }) => (selectedProfileTags = detail.selected)}
			/>
		</div>
		<div class="form-row justify-content-center">
			<Button variant="secondary" size="lg" onclick={closeModal}>Cancel</Button>
			<Button
				variant="primary"
				size="lg"
				icon={faSave}
				onclick={() => {
					isLoading.set({ saveTasks: true });
					saveTasks().then(() => {
						isLoading.set({ saveTasks: false });
					});
				}}
				isLoading={$isLoading['saveTasks']}>Save</Button
			>
		</div>
	</div>
</Modal>

<style>
	h5 {
		margin: 0;
	}

	.checkbox-wrapper {
		flex: 1;
		display: flex;
		align-items: center;
		height: 30px;
		max-width: 200px;
	}
	.checkbox-wrapper label {
		margin-right: 10px;
	}

	label {
		font-size: small;
		margin-left: 10px;
	}

	.modal-body {
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		width: 100%;
	}
	.form-row {
		display: flex;
		justify-content: space-between;
		margin-bottom: 20px;
		gap: 20px;
	}

	.form-row-checkbox {
		display: flex;
		justify-content: space-between;
		margin-bottom: 10px;
		gap: 20px;
	}

	.justify-content-center {
		margin-top: 30px;
		justify-content: center;
	}
</style>
