<script lang="ts">
	import Search from './Search.svelte';
	import Button from './Button.svelte';
	import Input from '../lib/Input.svelte';
	import Toggle from './Toggle.svelte';
	import Tags from './Tags.svelte';
	import CreateTasksModal from './CreateTasksModal.svelte';
	import {
		checkedCheckoutTasks,
		verboseTasks,
		settings,
		isLoading,
		shiftPressed,
		showTags
	} from '../datastore';
	import {
		faPlay,
		faStop,
		faTrash,
		faPen,
		faCopy,
		faPlus,
		faSave
	} from '@fortawesome/free-solid-svg-icons';
	import { makeRequest } from '../helpers';
	import type { Task } from '../types';

	let showModal = false;
	let modalTitle: string;
	let maxActiveTaskCount: string;
	let maxStartingTaskCount: string;
	let buttonTextCount: string;

	type states = 'start' | 'stop' | 'delete' | 'duplicate';

	const closeModal = () => {
		showModal = false;
	};

	const getTaskIds = (all: boolean) => {
		return all
			? $verboseTasks.map((task) => task.id)
			: $checkedCheckoutTasks.map((index) => $verboseTasks[index - 1]?.id);
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
		const all = $shiftPressed || $checkedCheckoutTasks.filter((item) => item != -1).length === 0;
		isLoading.set({ [state]: true });

		if (state === 'duplicate') {
			duplicateTasks(all).then(() => {
				isLoading.set({ [state]: false });
			});
		} else {
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
		}
	};

	const duplicateTasks = (all: boolean = false) => {
		const tasks: any[] = getTaskIds(all).reduce((result, id) => {
			const task: Task | undefined = $verboseTasks.find((task) => task.id === id);
			if (task) {
				result.push({ ...task, account: null, id: 0 });
			}
			return result;
		}, [] as any[]);

		const url = 'http://127.0.0.1:23432/tasks?type=checkout';
		const method = 'post';

		return makeRequest(method, url, tasks, (response: any) => {
			verboseTasks.update((curTasks: Task[]) => {
				return curTasks.concat(response.data['created']);
			});
		});
	};

	const saveSettings = () => {
		settings.update((curSettings) => {
			curSettings['max_starting_tasks'] = maxStartingTaskCount
				? parseInt(maxStartingTaskCount)
				: curSettings['max_starting_tasks'];
			curSettings['max_active_tasks'] = maxActiveTaskCount
				? parseInt(maxActiveTaskCount)
				: curSettings['max_active_tasks'];
			return curSettings;
		});

		const url = 'http://127.0.0.1:23432/settings';
		const method = 'put';
		maxActiveTaskCount = '';
		maxStartingTaskCount = '';
		return makeRequest(method, url, $settings, () => {});
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
					modalTitle = 'Create Tasks';
					showModal = true;
				}}
				size="md"
				icon={faPlus}
				resizable={true}
				style="button">Create Tasks</Button
			>
		</div>
	</div>
	<div class="button-row">
		<div class="button-group">
			<Button
				variant="primary"
				onclick={() => handleTaskAction('start')}
				isLoading={$isLoading.start}
				size="md"
				icon={faPlay}
				resizable={true}
				style="button">Start {buttonTextCount} Tasks</Button
			>

			<Button
				variant="warning"
				onclick={() => handleTaskAction('stop')}
				isLoading={$isLoading.stop}
				size="md"
				icon={faStop}
				resizable={true}
				style="button">Stop {buttonTextCount} Tasks</Button
			>

			<Button
				variant="danger"
				onclick={() => handleTaskAction('delete')}
				isLoading={$isLoading.delete}
				size="md"
				icon={faTrash}
				resizable={true}
				style="button">Delete {buttonTextCount} Tasks</Button
			>
		</div>
		<div class="button-group">
			<Button
				variant="default"
				size="md"
				icon={faPen}
				onclick={() => {
					modalTitle = `Edit ${buttonTextCount} Tasks`;
					showModal = true;
				}}
				resizable={true}
				style="button">Edit {buttonTextCount} Tasks</Button
			>

			<Button
				variant="default"
				size="md"
				icon={faCopy}
				onclick={() => handleTaskAction('duplicate')}
				resizable={true}
				style="button">Duplicate {buttonTextCount} Tasks</Button
			>
		</div>
	</div>
	<div class="third-row">
		<div class="search-container">
			<Search size="md" />
			<div class="toggle-container">
				<Toggle bind:checked={$showTags} />
				<span class="toggle-label">Show tags</span>
			</div>
		</div>
		<div class="controls-container">
			<div class="input-group">
				<Input
					placeholder="Max Starting Tasks"
					size="xs"
					value={maxStartingTaskCount}
					on:input={(event) => (maxStartingTaskCount = event.detail)}
				/>
				<Button icon={null} shape="square-button" variant="secondary" onclick={() => {}}
					>{$settings.max_starting_tasks}</Button
				>
			</div>
			<div class="input-group">
				<Input
					placeholder="Max Active Tasks"
					size="xs"
					value={maxActiveTaskCount}
					on:input={(event) => (maxActiveTaskCount = event.detail)}
				/>
				<Button shape="square-button" onclick={() => {}} variant="secondary"
					>{$settings.max_active_tasks}</Button
				>
				<Button
					onclick={() => {
						isLoading.set({ saveSettings: true });
						saveSettings().then(() => {
							isLoading.set({ saveSettings: false });
						});
					}}
					icon={faSave}
					variant="default"
					isLoading={$isLoading['saveSettings']}
				/>
			</div>
		</div>
	</div>
</div>
{#if $showTags} <Tags /> {/if}
{#if showModal}
	<CreateTasksModal {showModal} {closeModal} {modalTitle} />
{/if}

<style>
	.button-row {
		display: flex;
		justify-content: space-between;
		margin: 10px 0;
	}

	.button-group {
		display: flex;
		align-items: center;
	}
	.third-row {
		display: flex;
		justify-content: space-between;
		align-items: center;
		width: 100%; /* Ensure third row takes up full width */
		margin: 10px 0;
	}

	.search-container {
		display: flex;
		align-items: center;
		justify-content: space-between; /* space out search and toggle */
		width: 30%; /* Adjust as needed */
	}

	.toggle-container {
		display: flex;
		align-items: center; /* Center the toggle vertically */
		margin-left: 20px; /* Add some space between search and toggle */
	}

	.toggle-label {
		margin-left: 10px;
		white-space: nowrap;
		font-size: 14px;
	}

	.controls-container {
		display: flex;
		justify-content: flex-end; /* Spread the controls horizontally */
		align-items: center;
		width: 60%; /* Adjust as needed */
	}

	.input-group {
		display: flex;
		align-items: center;
		margin-right: 10px; /* Add some spacing between input groups */
	}

	@media (max-width: 980px) {
		.third-row {
			flex-direction: column;
			justify-content: flex-start;
			align-items: flex-start;
		}

		.search-container,
		.controls-container {
			width: 100%; /* Ensure these containers take up full width */
		}

		.controls-container {
			flex-direction: column;
			align-items: flex-start;
			justify-content: space-between;
		}

		.input-group {
			width: 100%; /* Ensure input groups take up full width */
			margin-top: 20px; /* Add some spacing between input groups on small screens */
		}
	}
</style>
