<script lang="ts">
	import Button from '$lib/Button.svelte';
	import { isLoading } from '../../datastore';
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
				style="button">Create</Button
			>

			<Button
				variant="danger"
				onclick={triggerModal}
				isLoading={$isLoading.delete}
				size="md"
				icon={faTrash}
				resizable={false}
				style="button">Delete {buttonTextCount}</Button
			>
		</div>
		<div class="button-group">
			<Button
				variant="primary"
				shadow={false}
				alternate={true}
				onclick={() => handleTaskAction('start')}
				isLoading={$isLoading.start}
				size="md"
				icon={faPlay}
				resizable={false}
				style="button">Start {buttonTextCount}</Button
			>

			<Button
				variant="danger"
				alternate={true}
				onclick={() => handleTaskAction('stop')}
				isLoading={$isLoading.stop}
				shadow={false}
				size="md"
				icon={faStop}
				resizable={false}
				style="button">Stop {buttonTextCount}</Button
			>
		</div>
		<div class="button-group right-button-group">
			<Button
				variant="default"
				size="md"
				icon={faPen}
				onclick={() => handleTaskAction('edit')}
				resizable={false}
				style="button">Edit {buttonTextCount}</Button
			>

			<Button
				variant="default"
				size="md"
				icon={faCopy}
				onclick={() => handleTaskAction('duplicate')}
				resizable={false}
				style="button">Duplicate {buttonTextCount}</Button
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
		gap: 10px;
	}

	.button-group.left-button-group {
		justify-content: start;
	}

	.button-group.right-button-group {
		justify-content: end;
	}
</style>
