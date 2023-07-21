<script lang="ts">
	import Button from '$lib/Button.svelte';
	import { faPause, faPen, faPlay, faTrash } from '@fortawesome/free-solid-svg-icons';
	import { createEventDispatcher } from 'svelte';
	import type { ActivityState, CheckoutState } from '../../types';
	import { isLoading } from '../../datastore';

	export let itemId: number;
	export let state: CheckoutState | ActivityState;
	export let page: string;

	let showEdit = page == 'activity' ? false : true;
	const dispatch = createEventDispatcher();

	const handleEdit = (event: MouseEvent) => {
		event.stopPropagation();
		dispatch('edit', itemId);
	};

	const handleDelete = (event: MouseEvent) => {
		event.stopPropagation();
		dispatch('deleteIndiv', itemId);
	};

	const handleStop = (event: MouseEvent) => {
		event.stopPropagation();
		dispatch('stopIndiv', itemId);
	};

	const handleStart = (event: MouseEvent) => {
		event.stopPropagation();
		dispatch('startIndiv', itemId);
	};
</script>

<div class="button-group">
	{#if state === 'Ready' || state === 'Complete' || state === 'Error'}
		<Button icon={faPlay} onclick={handleStart} isLoading={$isLoading.startIndiv} />
	{:else}
		<Button icon={faPause} onclick={handleStop} isLoading={$isLoading.stopIndiv} />
	{/if}
	{#if showEdit}
		<Button icon={faPen} onclick={handleEdit} />
	{/if}
	<Button icon={faTrash} onclick={handleDelete} isLoading={$isLoading.deleteIndiv} />
</div>

<style>
	.button-group {
		display: flex;
		flex-wrap: wrap;
		justify-content: flex-end;
		margin-right: 10px;
	}
</style>
