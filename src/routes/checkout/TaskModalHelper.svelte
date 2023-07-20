<script lang="ts">
	import Modal from '$lib/Modal.svelte';
	import SizePresetModal from './SizePresetModal.svelte';
	import LaunchesModal from './LaunchesModal.svelte';
	import CreateTasksModal from './CreateTasksModal.svelte';
	import type { LaunchType } from '../../types';

	export let showModal: boolean = false;
	export let checkedCheckoutTasks: number[] = [];
	export let closeModal: () => void = () => {
		showModal = false;
		isDuplicating = false;
		isEditing = false;
	};
	export let isEditing = false;
	export let isDuplicating = false;

	enum ModalType {
		None = 'None',
		Size = 'Size',
		Launches = 'Launches',
		CreateTasks = 'CreateTasks'
	}

	let currentModal: ModalType = ModalType.CreateTasks;

	const closeAllModals = () => closeModal();
	const returnToCreateTasksModal = () => (currentModal = ModalType.CreateTasks);

	let sku = '';
	let preferredSizeInput = '';
	let randomSizeInput = '';

	const handleSizeSelected = (event: CustomEvent) => {
		preferredSizeInput = event.detail;
		randomSizeInput = event.detail;
		currentModal = ModalType.CreateTasks;
	};

	const handleProductSelected = (event: CustomEvent) => {
		let launch = event.detail as LaunchType;
		sku = launch.style_code;
		currentModal = ModalType.CreateTasks;
	};
</script>

<Modal on:close={closeModal}>
	<div slot="modal" class="modal-body">
		{#if currentModal === ModalType.Size}
			<SizePresetModal closeModal={returnToCreateTasksModal} on:sizeSelected={handleSizeSelected} />
		{:else if currentModal === ModalType.Launches}
			<LaunchesModal
				closeModal={returnToCreateTasksModal}
				on:productSelected={handleProductSelected}
			/>
		{:else if currentModal === ModalType.CreateTasks}
			<CreateTasksModal
				{checkedCheckoutTasks}
				closeModal={closeAllModals}
				{sku}
				{preferredSizeInput}
				{randomSizeInput}
				bind:currentModal
				bind:isEditing
				bind:isDuplicating
			/>
		{/if}
	</div>
</Modal>

<style>
	.modal-body {
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		width: 100%;
	}
</style>
