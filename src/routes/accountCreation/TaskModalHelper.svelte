<script lang="ts">
	import MultiDropdown from '$lib/MultiDropdown.svelte';
	import Dropdown from '$lib/Dropdown.svelte';
	import Button from '$lib/Button.svelte';
	import Input from '$lib/Input.svelte';
	import Toggle from '$lib/Toggle.svelte';
	import Modal from '$lib/Modal.svelte';
	import Fa from 'svelte-fa';
	import { accounts, isLoading, proxy_lists, verboseNacTasks } from '../../datastore';
	import { faCheck, faPlug, faSave, faX } from '@fortawesome/free-solid-svg-icons';
	import { makeRequest } from '../../helpers';
	import type { AxiosResponse } from 'axios';
	import type { Tag } from '../../types';

	export let showModal: boolean = false;
	export let checkedItemIds: number[] = [];
	export let closeModal: () => void = () => {
		showModal = false;
		isDuplicating = false;
		isEditing = false;
	};
	export let isEditing = false;
	export let isDuplicating = false;

	let proxyListNames = $proxy_lists.map((list) => list.name);
	let browsers = ['Default', 'Chrome', 'Chrome Beta', 'Edge', 'Brave'];
	let nacTags = $verboseNacTasks.reduce((acc: string[], task) => {
		if (task.tags.length > 0) {
			task.tags.forEach((tag) => {
				if (!acc.includes(tag.name)) {
					acc.push(tag.name);
				}
			});
		}
		return acc;
	}, []);
	let accountTags = $accounts.reduce((acc: string[], account) => {
		if (account.tags.length > 0) {
			account.tags.forEach((tag) => {
				if (!acc.includes(tag.name)) {
					acc.push(tag.name);
				}
			});
		}
		return acc;
	}, []);
	let emailTypes = ['Gmail', 'Yahoo', 'Outlook', 'FastMail', 'iCloud', 'XYZ', 'Other'];

	let predictedTaskCount: string | number = 0;
	let selectedProxyList = 0;
	let selectedProxyListName = '';
	let selectedBrowser = 'Default';
	let selectedNacTags: Tag[] = [];
	let selectedAccountTags: Tag[] = [];
	let selectedEmailType = 'Gmail';

	let accountEmails: string[] = [];
	let emailUsername = '';
	let emailPassword = '';
	let emailFolder = '';
	let statusText = '';

	let editProxyList = false;
	let editBrowser = false;
	let editNacTags = false;
	let editAccountTags = false;
	let editEmailUsername = false;
	let editEmailPassword = false;
	let editInboxFolder = false;
	let editEmailType = false;

	let rawEmails = '';
	$: accountEmails = rawEmails == '' ? [] : rawEmails.split('\n').filter((email) => email !== '');

	$: selectedProxyList = $proxy_lists.find((list) => list.name === selectedProxyListName)?.id || 0;

	const handleNacTagSelection = (e: CustomEvent) => {
		selectedNacTags = e.detail;
	};

	const handleAccountTagSelection = (e: CustomEvent) => {
		selectedAccountTags = e.detail.selected;
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

	const saveTasks = () => {
		const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+';
		let tasks = accountEmails.map((email) => {
			return {
				account_tags: selectedAccountTags,
				browser_type: selectedBrowser,
				email: emailUsername,
				email_folder: emailFolder,
				email_imap_connection: '',
				email_password: emailPassword,
				email_provider: selectedEmailType,
				password: Array.from(crypto.getRandomValues(new Uint32Array(20)))
					.map((x) => characters[x % characters.length])
					.join(''),
				proxy_list_id: selectedProxyList,
				username: email,
				tags: selectedNacTags
			};
		});
		console.log(tasks);
	};

	const testConnection = async () => {
		$isLoading['testConn'] = true;

		let tasks = {
			username: rawEmails,
			recovery_provider: selectedEmailType,
			emails: accountEmails,
			tags: selectedNacTags,
			account_tags: selectedAccountTags,
			browser_type: selectedBrowser,
			email: emailUsername,
			email_folder: emailFolder,
			email_imap_connection: '',
			email_password: emailPassword,
			email_provider: selectedEmailType,
			proxy_list_id: selectedProxyList,
			proxy: 'Randomize',
			proxy_list: $proxy_lists.find((list) => list.id === selectedProxyList)
		};

		let res = (await makeRequest(
			'POST',
			'http://127.0.0.1:23432/email/test',
			tasks
		)) as AxiosResponse;

		if (res.status === 200) {
			statusText = 'success';
		} else {
			statusText = 'error';
		}

		$isLoading['testConn'] = false;
	};

	const editTasks = () => {
		let tasks = $verboseNacTasks.filter((task) => checkedItemIds.includes(task.id));

		tasks.map((task) => {
			if (editProxyList) {
				task.proxy_list_id = selectedProxyList;
			}
			if (editBrowser) {
				task.browser_type = selectedBrowser;
			}
			if (editNacTags) {
				task.tags = selectedNacTags;
			}
			if (editAccountTags) {
				task.account_tags = selectedAccountTags;
			}
			if (editEmailUsername) {
				task.email = emailUsername;
			}
			if (editEmailPassword) {
				task.email_password = emailPassword;
			}
			if (editInboxFolder) {
				task.email_folder = emailFolder;
			}
			if (editEmailType) {
				task.email_provider = selectedEmailType;
			}
		});
	};
	const duplicateTasks = () => {};

	const saveButtonText = () => {
		if (isDuplicating) return 'Duplicate';
		if (isEditing) return 'Edit';
		return 'Save';
	};

	$: {
		if (!isEditing && !isDuplicating) {
			predictedTaskCount = accountEmails.length;
		} else {
			predictedTaskCount = checkedItemIds.length === 0 ? 'all' : checkedItemIds.length;
		}
	}
</script>

<Modal on:close={closeModal}>
	<div slot="modal" class="modal-body">
		<div
			style="display: flex; flex-direction: row; justify-content: space-between; height: 20px; background: inherit"
		>
			<h5 style="margin-top: 0px; margin-bottom: 10px;">
				{isEditing ? 'Edit Tasks' : 'Create Tasks'}
			</h5>
			<Button
				variant="default"
				icon={faX}
				size="sm"
				shape="square"
				onclick={closeModal}
				shadow={false}
				style="width: 20px;"
			/>
		</div>
		<div>
			{#if !isEditing}
				<div class="row">
					<Input
						style="width: 100%;"
						title="Email List"
						type="paragraph"
						fullWidth={true}
						placeholder="email1@gmail.com"
						bind:value={rawEmails}
					/>
				</div>
			{/if}

			<div class="row">
				<div class="edit-wrap">
					{#if isEditing}
						<Toggle bind:checked={editProxyList} style="margin-right: 10px; margin-bottom: 8px;" />
					{/if}
					<Dropdown
						bind:value={selectedProxyListName}
						options={proxyListNames}
						size={'lg'}
						style={'width: 200px;'}
						title="Proxy List"
						disabled={(isEditing || isDuplicating) && !editProxyList}
					/>
				</div>
				<div class="edit-wrap">
					{#if isEditing}
						<Toggle bind:checked={editBrowser} style="margin-right: 10px; margin-bottom: 8px;" />
					{/if}
					<Dropdown
						bind:value={selectedBrowser}
						options={browsers}
						size={'lg'}
						style={'width: 200px;'}
						title="Browser"
						disabled={(isEditing || isDuplicating) && !editBrowser}
					/>
				</div>
			</div>
			<div class="row">
				<div class="edit-wrap">
					{#if isEditing}
						<Toggle bind:checked={editNacTags} style="margin-right: 10px; margin-bottom: 8px;" />
					{/if}
					<MultiDropdown
						options={nacTags}
						title="NAC Task Tags"
						titlePosition="top"
						disabled={(isEditing || isDuplicating) && !editNacTags}
						on:update={(e) => handleNacTagSelection(e)}
					/>
				</div>
				<div class="edit-wrap">
					{#if isEditing}
						<Toggle
							bind:checked={editAccountTags}
							style="margin-right: 10px; margin-bottom: 8px;"
						/>
					{/if}
					<MultiDropdown
						options={accountTags}
						title="Account Tags"
						titlePosition="top"
						disabled={(isEditing || isDuplicating) && !editAccountTags}
						on:update={(e) => handleAccountTagSelection(e)}
					/>
				</div>
			</div>
		</div>

		<div>
			<h6 style="margin-top: 20px; margin-bottom: 10px;">IMAP Configuration</h6>
			<div class="row">
				<div class="edit-wrap">
					{#if isEditing}
						<Toggle
							bind:checked={editEmailUsername}
							style="margin-right: 10px; margin-bottom: 8px;"
						/>
					{/if}
					<Input
						style="width: 200px;"
						title="Email Username"
						disabled={(isEditing || isDuplicating) && !editEmailUsername}
						bind:value={emailUsername}
						placeholder="enigma@gmail.com"
					/>
				</div>
				<div class="edit-wrap">
					{#if isEditing}
						<Toggle
							bind:checked={editEmailPassword}
							style="margin-right: 10px; margin-bottom: 8px;"
						/>
					{/if}
					<Input
						style="width: 200px;"
						title="Email Password"
						bind:value={emailPassword}
						disabled={(isEditing || isDuplicating) && !editEmailPassword}
						placeholder="p4ssw0rd69!"
					/>
				</div>
			</div>
			<div class="row bottom">
				<div class="edit-wrap">
					{#if isEditing}
						<Toggle
							bind:checked={editInboxFolder}
							style="margin-right: 10px; margin-bottom: 8px;"
						/>
					{/if}
					<Input
						style="width: 200px;"
						title="Inbox Folder"
						bind:value={emailFolder}
						disabled={(isEditing || isDuplicating) && !editInboxFolder}
					/>
				</div>
				<div class="edit-wrap">
					{#if isEditing}
						<Toggle bind:checked={editEmailType} style="margin-right: 10px; margin-bottom: 8px;" />
					{/if}
					<Dropdown
						options={emailTypes}
						bind:value={selectedEmailType}
						size={'lg'}
						disabled={(isEditing || isDuplicating) && !editEmailType}
						style={'width: 200px; height: 33px;'}
						title="Email Type"
					/>
				</div>
			</div>
			<div style="margin-top: 20px; justify-content:end; width: 100%; display: flex;">
				{#if statusText !== ''}
					{#if statusText === 'success'}
						<div style="display: flex; align-items: center; gap: 10px">
							<Fa icon={faCheck} color="green" />
							<div style="color: green; margin-right: 10px;">Connection Successful</div>
						</div>
					{:else}
						<div style="display: flex; align-items: center; gap: 10px">
							<Fa icon={faX} color="red" />
							<div style="color: red; margin-right: 10px;">Connection Failed</div>
						</div>
					{/if}
				{/if}
				<Button
					size="sm"
					variant="primary"
					icon={faPlug}
					style="align-items: center;"
					isLoading={$isLoading['testConn']}
					disabled={(isEditing || isDuplicating) &&
						!editEmailType &&
						!editEmailUsername &&
						!editEmailPassword &&
						!editInboxFolder}
					onclick={testConnection}>Test Connection</Button
				>
			</div>
		</div>
		<div class="row justify-content-center">
			<Button variant="primary" size="md" onclick={closeModal}>Cancel</Button>
			<Button
				variant="primary"
				alternate={true}
				size="md"
				icon={faSave}
				onclick={handleSaveClicked}
				disabled={accountEmails.length === 0 && !isDuplicating && !isEditing}
				isLoading={$isLoading['saveTasks']}>{saveButtonText()} {predictedTaskCount} tasks</Button
			>
		</div>
	</div>
</Modal>

<style>
	.modal-body {
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		width: 100%;
	}

	.row {
		display: flex;
		flex-direction: row;
		justify-content: space-between;
		align-items: center;
		margin: 10px 0px;
		gap: 20px;
	}

	.bottom {
		align-items: end;
	}

	.justify-content-center {
		margin-top: 30px;
		margin-bottom: 0;
		justify-content: end;
	}

	.edit-wrap {
		display: flex;
		flex-direction: row;
		align-items: end;
		gap: 10px;
	}
</style>
