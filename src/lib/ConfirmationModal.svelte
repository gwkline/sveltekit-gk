<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import Modal from '$lib/Modal.svelte';
	import Button from './Button.svelte';

	export let showModal: boolean = false;
	export let closeModal: () => void = () => {
		showModal = false;
	};

	export let message = '';
	const dispatch = createEventDispatcher();

	function confirmAction() {
		dispatch('confirm');
	}

	function cancelAction() {
		dispatch('cancel');
	}
</script>

<Modal on:close={closeModal}>
	<div slot="modal" class="modal-body">
		<h2>Confirmation</h2>
		<p>{message}</p>
		<div class="button-row">
			<Button onclick={cancelAction}>Cancel</Button>
			<Button variant="danger" onclick={confirmAction}>Yes, I'm sure</Button>
		</div>
	</div>
</Modal>

<style>
	.button-row {
		display: flex;
		flex-direction: row;
		justify-content: space-between;
		align-items: center;
	}
	.modal-body {
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		width: 100%;
	}
</style>
