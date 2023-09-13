<script lang="ts">
	import Search from '$lib/Search.svelte';
	import Button from '$lib/Button.svelte';
	import Input from '$lib/Input.svelte';
	import Toggle from '$lib/Toggle.svelte';
	import { settings, isLoading, showTags } from '../../datastore';
	import {
		faPlay,
		faStop,
		faTrash,
		faPen,
		faCopy,
		faPlus
	} from '@fortawesome/free-solid-svg-icons';
	import { createEventDispatcher } from 'svelte';

	export let buttonTextCount: string;

	let maxActiveTaskCount: string;
	let maxStartingTaskCount: string;

	type settings = 'max_active_tasks' | 'max_starting_tasks';
	type states = 'start' | 'stop' | 'delete' | 'duplicate' | 'edit' | 'create';

	const dispatch = createEventDispatcher();

	const triggerModal = () => {
		dispatch('showConfirmationModal');
	};

	const handleTaskAction = (state: states) => {
		switch (state) {
			case 'delete':
				dispatch('delete');
				break;
			case 'start':
				dispatch('start');
				break;
			case 'stop':
				dispatch('stop');
				break;
			case 'duplicate':
				dispatch('duplicate');
				break;
			case 'edit':
				dispatch('edit');
				break;
			case 'create':
				dispatch('create');
				break;
		}
	};

	const saveSettings = (settingKey: settings, value: string) => {
		dispatch('saveSettings', { name: settingKey, value: value });

		maxActiveTaskCount = '';
		maxStartingTaskCount = '';
	};
</script>

<div class="container">
	<div class="button-row">
		<div class="button-group left-button-group">
			<Button
				variant="primary"
				onclick={() => handleTaskAction('create')}
				size="md"
				icon={faPlus}
				resizable={false}
				style="button">Create Tasks</Button
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
		<div class="button-group">
			<Button
				variant="primary"
				alternate={true}
				onclick={() => handleTaskAction('start')}
				isLoading={$isLoading.start}
				size="md"
				icon={faPlay}
				resizable={false}
				outline="outline"
				style="button">Start {buttonTextCount} Tasks</Button
			>

			<Button
				variant="danger"
				alternate={true}
				onclick={() => handleTaskAction('stop')}
				isLoading={$isLoading.stop}
				size="md"
				icon={faStop}
				resizable={false}
				outline="outline"
				style="button">Stop {buttonTextCount} Tasks</Button
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

			<Button
				variant="default"
				size="md"
				icon={faCopy}
				onclick={() => handleTaskAction('duplicate')}
				resizable={false}
				style="button">Duplicate {buttonTextCount} Tasks</Button
			>
		</div>
	</div>
</div>

<style>
	.container {
		margin: 10px 0 2px 0;
	}
	.button-row {
		display: flex;
		justify-content: space-between;
		margin: 2px 0;
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
</style>
