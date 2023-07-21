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
		dispatch('edit', { id: itemId });
	};

	const handleDelete = (event: MouseEvent) => {
		event.stopPropagation();
		dispatch('delete', { id: itemId });
	};

	const handleStop = (event: MouseEvent) => {
		event.stopPropagation();
		dispatch('stop', { id: itemId });
	};

	const handleStart = (event: MouseEvent) => {
		event.stopPropagation();
		dispatch('start', { id: itemId });
	};
</script>

<div class="button-group">
	{#if state === 'Ready' || state === 'Complete' || state === 'Error'}
		<Button icon={faPlay} onclick={handleStart} isLoading={$isLoading[`start${itemId}`]} />
	{:else}
		<Button icon={faPause} onclick={handleStop} isLoading={$isLoading[`stop${itemId}`]} />
	{/if}
	{#if showEdit}
		<Button icon={faPen} onclick={handleEdit} />
		<Button icon={faTrash} onclick={handleDelete} isLoading={$isLoading[`delete${itemId}`]} />
	{/if}
</div>

<style>
	.button-group {
		display: flex;
		flex-wrap: wrap;
		justify-content: flex-end;
		margin-right: 10px;
	}
</style>
