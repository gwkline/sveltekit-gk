<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import Modal from '$lib/Modal.svelte';
	import Button from './Button.svelte';
	import { faX } from '@fortawesome/free-solid-svg-icons';
	import { isLoading } from '../datastore';

	export let message = '';
	export let showModal: boolean = false;
	export let closeModal: () => void = () => {
		showModal = false;
	};

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
		<div
			style="display: flex; flex-direction: row; justify-content: space-between; height: 20px; background: inherit"
		>
			<h5 style="margin-top: 0px; margin-bottom: 10px;">Confirmation</h5>
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
		<p>{message}</p>
		<div class="button-row">
			<Button onclick={cancelAction} outline="noOutline" shadow={false}>Cancel</Button>
			<Button variant="danger" onclick={confirmAction} isLoading={$isLoading['confirmation']}
				>Yes, I'm sure</Button
			>
		</div>
	</div>
</Modal>

<style>
	.button-row {
		display: flex;
		flex-direction: row;
		justify-content: end;
		gap: 10px;
		align-items: center;
	}
	.modal-body {
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		width: 100%;
	}
	p {
		font-family: Roboto;
		font-size: 14px;
		font-style: normal;
		font-weight: 400;
		line-height: 16px;
		width: 367px;
	}

	h5 {
		font-family: Roboto;
		font-size: 17px;
		font-style: normal;
		font-weight: 600;
		line-height: 20px;
	}
</style>
