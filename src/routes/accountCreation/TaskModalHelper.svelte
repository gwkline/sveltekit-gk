<script lang="ts">
	import Button from '$lib/Button.svelte';
	import Dropdown from '$lib/Dropdown.svelte';
	import Input from '$lib/Input.svelte';
	import Modal from '$lib/Modal.svelte';
	import MultiDropdown from '$lib/MultiDropdown.svelte';
	import { faCheck, faPlug, faSave, faX } from '@fortawesome/free-solid-svg-icons';
	import { isLoading, proxy_lists, verboseNacTasks } from '../../datastore';
	import { getProxies, makeRequest } from '../../helpers';
	import type { Tag } from '../../types';
	import type { Axios, AxiosResponse } from 'axios';
	import Fa from 'svelte-fa';

	export let showModal: boolean = false;
	export let checkedCheckoutTasks: number[] = [];
	export let closeModal: () => void = () => {
		showModal = false;
		isDuplicating = false;
		isEditing = false;
	};
	export let isEditing = false;
	export let isDuplicating = false;

	getProxies();

	let proxyListNames = $proxy_lists.map((list) => list.name);
	let browsers = ['Default', 'Chrome', 'Chrome Beta', 'Edge', 'Brave'];
	let nacTags = $verboseNacTasks.map((task) => task.email); //todo;
	let accountTags = $verboseNacTasks.map((task) => task.email); //todo
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

	const editTasks = () => {};
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
			predictedTaskCount = checkedCheckoutTasks.length === 0 ? 'all' : checkedCheckoutTasks.length;
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
			<div class="row">
				<Dropdown
					bind:value={selectedProxyListName}
					options={proxyListNames}
					size={'lg'}
					style={'width: 200px;'}
					title="Proxy List"
				/>
				<Dropdown
					bind:value={selectedBrowser}
					options={browsers}
					size={'lg'}
					style={'width: 200px;'}
					title="Browser"
				/>
			</div>
			<div class="row">
				<MultiDropdown
					options={nacTags}
					title="NAC Task Tags"
					titlePosition="top"
					on:update={(e) => handleNacTagSelection(e)}
				/>
				<MultiDropdown
					options={accountTags}
					title="Account Tags"
					titlePosition="top"
					on:update={(e) => handleAccountTagSelection(e)}
				/>
			</div>
		</div>

		<div>
			<h6 style="margin-top: 20px; margin-bottom: 10px;">IMAP Configuration</h6>
			<div class="row">
				<Input
					style="width: 200px;"
					title="Email Username"
					bind:value={emailUsername}
					placeholder="enigma@gmail.com"
				/>
				<Input
					style="width: 200px;"
					title="Email Password"
					bind:value={emailPassword}
					placeholder="p4ssw0rd69!"
				/>
			</div>
			<div class="row bottom">
				<Input style="width: 200px;" title="Inbox Folder" bind:value={emailFolder} />
				<Dropdown
					options={emailTypes}
					bind:value={selectedEmailType}
					size={'lg'}
					style={'width: 200px; height: 33px;'}
					title="Email Type"
				/>
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
				disabled={accountEmails.length === 0}
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
</style>
