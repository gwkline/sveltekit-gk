<script lang="ts">
	import Button from '$lib/Button.svelte';
	import { faPause, faPen, faPlay, faTrash } from '@fortawesome/free-solid-svg-icons';
	import { createEventDispatcher } from 'svelte';
	import type { State } from '../../types';

	export let itemId: number;
	export let state: State;
	const dispatch = createEventDispatcher();

	const handleEdit = (event: MouseEvent) => {
		event.stopPropagation();
		dispatch('edit', itemId);
	};

	const handleDelete = (event: MouseEvent) => {
		event.stopPropagation();
		dispatch('delete', itemId);
	};

	const handleStop = (event: MouseEvent) => {
		event.stopPropagation();
		dispatch('stop', itemId);
	};

	const handleStart = (event: MouseEvent) => {
		event.stopPropagation();
		dispatch('start', itemId);
	};
</script>

<div class="button-group">
	{#if state === 'Ready'}
		<Button icon={faPlay} onclick={handleStart} />
	{:else}
		<Button icon={faPause} onclick={handleStop} />
	{/if}
	<Button icon={faPen} onclick={handleEdit} />
	<Button icon={faTrash} onclick={handleDelete} />
</div>

<style>
	.button-group {
		display: flex;
		flex-wrap: wrap;
		justify-content: flex-end;
		margin-right: 10px;
	}
</style>
