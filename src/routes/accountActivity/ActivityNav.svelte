<script lang="ts">
	import Search from '$lib/Search.svelte';
	import Button from '$lib/Button.svelte';
	import Input from '$lib/Input.svelte';
	import Toggle from '$lib/Toggle.svelte';
	import { isLoading, showTags } from '../../datastore';
	import { faPlay, faStop, faPen, faTrash } from '@fortawesome/free-solid-svg-icons';
	import { createEventDispatcher } from 'svelte';

	export let searchValue: string = '';
	export let buttonTextCount: string;
	export let maxStartingActivityTasks: string;

	let maxStartingActivityTaskCount: string;

	type settings = 'max_starting_activity_tasks';
	type states = 'start' | 'stop' | 'delete' | 'duplicate' | 'edit' | 'create';

	const dispatch = createEventDispatcher();

	const handleTaskAction = (state: states) => {
		switch (state) {
			case 'start':
				dispatch('start');
				break;
			case 'stop':
				dispatch('stop');
				break;
			case 'edit':
				dispatch('edit');
				break;
			case 'delete':
				dispatch('delete');
				break;
		}
	};

	const saveSettings = (settingKey: settings, value: string) => {
		dispatch('saveSettings', { name: settingKey, value: value });

		maxStartingActivityTaskCount = '';
	};
</script>

<div class="container">
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
				onclick={() => handleTaskAction('delete')}
				isLoading={$isLoading.delete}
				size="md"
				icon={faTrash}
				resizable={false}
				style="button">Clear {buttonTextCount} Sessions</Button
			>
		</div>
		<div class="button-group right-button-group">
			<Button
				variant="default"
				size="md"
				icon={faPen}
				onclick={() => handleTaskAction('edit')}
				resizable={false}
				style="button">Edit {buttonTextCount} Tasks</Button
			>
		</div>
	</div>
	<div class="button-row">
		<div class="button-group left-button-group">
			<Search size="md" on:searchValue value={searchValue} />
			<div class="toggle-container">
				<Toggle bind:checked={$showTags} />
				<span class="toggle-label">Show tags</span>
			</div>
		</div>
		<div class="button-group right-button-group">
			<div class="input-group">
				<Input
					placeholder="Max Starting Tasks: {maxStartingActivityTasks}"
					style="width: 175px;"
					bind:value={maxStartingActivityTaskCount}
					on:blur={() => saveSettings('max_starting_activity_tasks', maxStartingActivityTaskCount)}
				/>
			</div>
		</div>
	</div>
</div>

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
