<script lang="ts">
	import {
		faCog,
		faGlobe,
		faPen,
		faPlay,
		faStop,
		faTrash
	} from '@fortawesome/free-solid-svg-icons';
	import { createEventDispatcher } from 'svelte';
	import type { ActivityState, CheckoutState } from '../../types';
	import { isLoading } from '../../datastore';
	import Fa from 'svelte-fa';

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

	const handleFocus = (event: MouseEvent) => {
		event.stopPropagation();
		dispatch('focus', { id: itemId });
	};

	const handleStart = (event: MouseEvent) => {
		event.stopPropagation();
		dispatch('start', { id: itemId });
	};
</script>

<div class="btn-group" role="group" aria-label="Action group">
	{#if state === 'Ready' || state === 'Complete' || state === 'Error'}
		<button type="button" class="btn" on:click|stopPropagation={handleStart}
			>{#if $isLoading[`start${itemId}`]}
				<Fa icon={faCog} spin></Fa>
			{:else}
				<Fa icon={faPlay}></Fa>
			{/if}</button
		>
	{:else}
		<button type="button" class="btn" on:click|stopPropagation={handleStop}
			>{#if $isLoading[`stop${itemId}`]}
				<Fa icon={faCog} spin></Fa>
			{:else}
				<Fa icon={faStop}></Fa>
			{/if}</button
		>
		<button type="button" class="btn" on:click|stopPropagation={handleFocus}
			>{#if $isLoading[`focus${itemId}`]}
				<Fa icon={faCog} spin></Fa>
			{:else}
				<Fa icon={faGlobe}></Fa>
			{/if}</button
		>
	{/if}

	{#if showEdit}
		<div class="divider"></div>

		<button type="button" class="btn" on:click|stopPropagation={handleEdit}>
			<Fa icon={faPen}></Fa>
		</button>
		<div class="divider"></div>

		<button type="button" class="btn" on:click|stopPropagation={handleDelete}>
			{#if $isLoading[`delete${itemId}`]}
				<Fa icon={faCog} spin></Fa>
			{:else}
				<Fa icon={faTrash}></Fa>
			{/if}
		</button>
	{/if}
</div>

<style>
	.btn-group {
		display: flex;
		justify-content: space-between;
		border: 1px solid var(--light-gray-4, #e0e0e0);
		align-items: center;
		width: fit-content;
		border-radius: 6px;
		overflow: hidden;
	}
	.btn {
		background: inherit;
		color: var(--off-black);
		padding: 0.375rem 0.75rem;
		border: none;
		margin: 0;
		cursor: pointer;
	}
	.btn:hover {
		background: var(--light-gray-4, #f2f2f2);
	}
	.btn:active {
		-webkit-box-shadow: inset 0px 0px 5px #b6b6b6;
		-moz-box-shadow: inset 0px 0px 5px #b6b6b6;
		box-shadow: inset 0px 0px 5px #b6b6b6;
		outline: none;
	}

	.divider {
		width: 1.5px;
		background-color: var(--light-gray-3); /* You can change this to a light gray like #ccc */
		height: 15px; /* Change this line */
		margin: 0;
	}
</style>
