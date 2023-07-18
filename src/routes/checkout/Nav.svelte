<script lang="ts">
	import Search from '$lib/Search.svelte';
	import Button from '$lib/Button.svelte';
	import Input from '$lib/Input.svelte';
	import Toggle from '$lib/Toggle.svelte';
	import {
		checkedCheckoutTasks,
		verboseTasks,
		settings,
		isLoading,
		shiftPressed,
		showTags
	} from '../../datastore';
	import {
		faPlay,
		faStop,
		faTrash,
		faPen,
		faCopy,
		faPlus
	} from '@fortawesome/free-solid-svg-icons';
	import { makeRequest } from '../../helpers';
	import type { HeaderConfigType, Settings, Task } from '../../types';
	import ConfirmationModal from '$lib/ConfirmationModal.svelte';
	import TaskModalHelper from './TaskModalHelper.svelte';

	let showModal = false;
	let showConfirmationModal = false;
	let maxActiveTaskCount: string;
	let maxStartingTaskCount: string;
	let buttonTextCount: string;
	let isEditing = false;
	let isDuplicating = false;

	type states = 'start' | 'stop' | 'delete' | 'duplicate';

	const getTaskIds = (all: boolean) => {
		return all ? $verboseTasks.map((task) => task.id) : $checkedCheckoutTasks;
	};

	const changeTasksState = (state: states, all = false) => {
		let ids = getTaskIds(all);
		ids = ids.filter((id) => id); // filter out any nulls/undefined

		if (ids.length === 0) {
			return Promise.resolve();
		}

		const urlMap = {
			stop: 'http://127.0.0.1:23432/tasks/stop?type=undefined',
			start: 'http://127.0.0.1:23432/tasks/start?type=undefined',
			delete: 'http://127.0.0.1:23432/tasks?type=checkout',
			duplicate: '',
			create: ''
		};

		const methodMap = {
			stop: 'post',
			start: 'post',
			delete: 'delete',
			duplicate: 'post',
			create: 'post'
		};

		let url = urlMap[state];
		let method = methodMap[state];

		return makeRequest(method, url, ids, () => {
			if (state == 'delete') {
				// Update verboseTasks by filtering out the tasks that were deleted
				verboseTasks.update((tasks) => {
					return tasks.filter((task) => !ids.includes(task.id));
				});

				// Reset checkedCheckoutTasks
				checkedCheckoutTasks.set([]);
			}
		});
	};

	const handleTaskAction = (state: states) => {
		const all: boolean =
			$shiftPressed || $checkedCheckoutTasks.filter((item) => item != -1).length === 0;
		isLoading.set({ [state]: true });

		// If the action is "stop", filter out tasks in the "Ready" state.
		if (state === 'stop') {
			const ids = getTaskIds(all).filter((id) => {
				const task = $verboseTasks.find((task: Task) => task.id === id);
				return task && task.state !== 'Ready';
			});
			if (ids.length === 0) {
				// If there are no valid tasks to stop, don't proceed.
				isLoading.set({ [state]: false });
				return;
			}
		}
		changeTasksState(state, all).then(() => {
			isLoading.set({ [state]: false });
		});
	};

	const triggerModal = () => {
		showConfirmationModal = true;
	};

	const cancelAction = () => {
		showConfirmationModal = false;
	};

	type settings = 'max_active_tasks' | 'max_starting_tasks';
	const saveSettings = (settingKey: settings, value: string) => {
		settings.update((currentSettings) => {
			let newSettings = currentSettings as Settings;

			newSettings[settingKey] = value ? parseInt(value) : newSettings[settingKey];
			return newSettings;
		});

		const url = 'http://127.0.0.1:23432/settings';
		const method = 'put';
		maxActiveTaskCount = '';
		maxStartingTaskCount = '';
		return makeRequest(method, url, $settings);
	};

	$: {
		let items = $checkedCheckoutTasks;
		//remove -1 from items
		items = items.filter((item) => item != -1);
		if ($shiftPressed || items.length == 0) {
			buttonTextCount = 'All';
		} else if (items.length == $verboseTasks.length) {
			buttonTextCount = `All (${items.length})`;
		} else {
			buttonTextCount = `${items.length}`;
		}
	}
</script>

<div class="container">
	<div class="button-row">
		<div class="button-group">
			<Button
				variant="success"
				onclick={() => {
					isEditing = false;
					showModal = true;
				}}
				size="md"
				icon={faPlus}
				resizable={false}
				style="button">Create Tasks</Button
			>
		</div>
	</div>
	<div class="button-row">
		<div class="button-group left-button-group">
			<Button
				variant="primary"
				onclick={() => handleTaskAction('start')}
				isLoading={$isLoading.start}
				size="md"
				icon={faPlay}
				resizable={false}
				style="button">Start {buttonTextCount} Tasks</Button
			>

			<Button
				variant="warning"
				onclick={() => handleTaskAction('stop')}
				isLoading={$isLoading.stop}
				size="md"
				icon={faStop}
				resizable={false}
				style="button">Stop {buttonTextCount} Tasks</Button
			>

			<Button
				variant="danger"
				onclick={triggerModal}
				isLoading={$isLoading.delete}
				size="md"
				icon={faTrash}
				resizable={false}
				style="button">Delete {buttonTextCount} Tasks</Button
			>
		</div>
		<div class="button-group right-button-group">
			<Button
				variant="default"
				size="md"
				icon={faPen}
				onclick={() => {
					isEditing = true;
					showModal = true;
				}}
				resizable={false}
				style="button">Edit {buttonTextCount} Tasks</Button
			>

			<Button
				variant="default"
				size="md"
				icon={faCopy}
				onclick={() => {
					isEditing = true;
					isDuplicating = true;
					showModal = true;
				}}
				resizable={false}
				style="button">Duplicate {buttonTextCount} Tasks</Button
			>
		</div>
	</div>
	<div class="button-row">
		<div class="button-group left-button-group">
			<Search size="md" />
			<div class="toggle-container">
				<Toggle bind:checked={$showTags} />
				<span class="toggle-label">Show tags</span>
			</div>
		</div>
		<div class="button-group right-button-group">
			<div class="input-group">
				<Input
					placeholder="Max Starting Tasks: {$settings.max_starting_tasks}"
					style="width: 175px;"
					bind:value={maxStartingTaskCount}
					on:blur={() => saveSettings('max_starting_tasks', maxStartingTaskCount)}
				/>
			</div>
			<div class="input-group">
				<Input
					placeholder="Max Active Tasks: {$settings.max_active_tasks}"
					style="width: 175px;"
					bind:value={maxActiveTaskCount}
					on:blur={() => saveSettings('max_active_tasks', maxActiveTaskCount)}
				/>
			</div>
		</div>
	</div>
</div>

{#if showConfirmationModal}
	<ConfirmationModal
		message={`You're about to delete ${buttonTextCount} of your tasks. This cannot be undone. Are you sure you want to continue?`}
		on:confirm={() => {
			showConfirmationModal = false;
			handleTaskAction('delete');
		}}
		on:cancel={() => {
			cancelAction();
		}}
	/>
{/if}

{#if showModal}
	<TaskModalHelper bind:showModal bind:isEditing bind:isDuplicating />
{/if}

<style>
	.button-row {
		display: flex;
		justify-content: space-between;
		margin: 10px 0;
	}

	.button-group {
		display: flex;
		flex-wrap: wrap;
		justify-content: space-evenly;
		align-items: center;
		padding: 5px 0px;
	}

	.button-group.left-button-group {
		justify-content: start;
	}

	.button-group.right-button-group {
		justify-content: end;
	}

	.toggle-container {
		display: flex;
		align-items: center;
		margin-left: 20px;
	}

	.toggle-label {
		margin-left: 10px;
		white-space: nowrap;
		font-size: 14px;
	}

	.input-group {
		display: flex;
		align-items: center;
		margin-right: 10px;
		justify-content: space-around;
	}
</style>
