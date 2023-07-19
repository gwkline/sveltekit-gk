<script lang="ts">
	import Fa from 'svelte-fa';
	import Checkbox from './Checkbox.svelte';
	import Button from './Button.svelte';
	import {
		faPlay,
		faPen,
		faTrash,
		faPause,
		faClover,
		faHourglassHalf,
		faRunning,
		faTrophy,
		faX,
		faClock
	} from '@fortawesome/free-solid-svg-icons';
	import { stateColors } from '../datastore';
	import type { State, TableRowType, Task, VerboseTask } from '../types';
	import { createEventDispatcher } from 'svelte';

	export let index: number | null;
	export let row: TableRowType;
	export let itemId: number;
	export let checked = false;
	export let thisTask: VerboseTask | undefined;

	let size = '';
	let state: State;
	let profileName: string;
	let profileTags = '';

	const dispatch = createEventDispatcher();

	const stateIconMapping = {
		Ready: faPause,
		Queued: faClock,
		Starting: faHourglassHalf,
		Running: faRunning,
		Waiting: faClock,
		Error: faX,
		Entered: faClover,
		Winning: faTrophy
	};

	interface BrowserLogos {
		[key: string]: string;
	}

	const browsers: BrowserLogos = {
		Brave: 'https://seeklogo.com/images/B/brave-logo-F5E1D99D9E-seeklogo.com.png',
		Chrome:
			'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e1/Google_Chrome_icon_%28February_2022%29.svg/2048px-Google_Chrome_icon_%28February_2022%29.svg.png',
		Edge: 'https://upload.wikimedia.org/wikipedia/commons/7/7e/Microsoft_Edge_logo_%282019%29.png'
	};

	const handleClick = () => {
		dispatch('checked', itemId);
	};

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

	$: {
		state = thisTask?.state || 'Ready';
		size = thisTask?.product?.size || '';
		profileName = thisTask?.account?.profile?.name || '';
		profileTags = thisTask?.account?.profile?.tags?.map((item) => item.name).join(', ') || '';
	}
</script>

<tr on:click|stopPropagation={handleClick} class={checked ? 'active' : ''}>
	<td class="Count">
		<div class="count-content">
			<div style="width: 10px; text-align: right; font-size:12px;">{index}</div>
			<div class="checkbox">
				<Checkbox bind:checked on:change={handleClick} />
			</div>
		</div>
	</td>

	{#each Object.entries(row) as [column, value]}
		<td class={column}>
			{#if column === 'Browser'}
				{#if value in browsers}
					<img width="20px" alt={value} src={browsers[value]} />
				{/if}
			{:else if column === 'Status'}
				<div class="status-content">
					<div class="state-color-icon" style="background-color: {stateColors[state]};">
						<Fa icon={stateIconMapping[state]} color="var(--white)" size="md" />
					</div>
					<p>{value}</p>
				</div>
			{:else if column === 'SKU'}
				<div>
					<span>{value}</span>
					{#if size}
						<span class="sizeValue">Size {size}</span>
					{/if}
				</div>
			{:else if column === 'Account'}
				<div>
					<span>{value.split('@')[0]}</span>
					{#if size}
						<span class="sizeValue">{'@' + value.split('@')[1]}</span>
					{/if}
				</div>
			{:else if column === 'Proxy'}
				<div>
					<span>{value.split(':')[0]}</span>
					{#if size}
						<span class="sizeValue">{value.split(':')[2] + ':' + value.split(':')[3]}</span>
					{/if}
				</div>
			{:else if column === 'Profile'}
				<div>
					<span>{profileName}</span>
					{#if size}
						<span class="sizeValue">{profileTags}</span>
					{/if}
				</div>
			{:else}
				{value}
			{/if}
		</td>
	{/each}

	<td>
		<div class="button-group">
			{#if state === 'Ready'}
				<Button icon={faPlay} onclick={handleStart} />
			{:else}
				<Button icon={faPause} onclick={handleStop} />
			{/if}
			<Button icon={faPen} onclick={handleEdit} />
			<Button icon={faTrash} onclick={handleDelete} />
		</div>
	</td>
</tr>

<style>
	tr {
		height: 46px;
		border-bottom: 1px solid var(--light-gray-3);
		align-items: center;
		vertical-align: middle;
	}

	.status-content {
		display: flex;
		align-items: center;
		justify-content: start;
		gap: 5px;
	}

	.profile-content {
		display: flex;
		justify-content: space-between;
	}

	.state-color-icon {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 30px;
		height: 30px;
		border-radius: 5px;
		box-sizing: border-box;
	}

	.button-group {
		display: flex;
		flex-wrap: wrap;
		justify-content: flex-end;
		margin-right: 10px;
	}

	@media (max-width: 600px) {
		.button-group {
			flex-direction: column;
		}
	}

	@media (max-width: 900px) {
		.status-content > p {
			display: none;
		}
	}

	tr.active,
	tr:hover {
		background-color: var(--light-gray-2);
	}

	.sizeValue {
		display: block;
		font-size: 11px;
		color: #888;
	}

	td {
		padding: 3px 2px 3px 7px;
		vertical-align: middle;
		font-size: 13px;
		white-space: nowrap;
		overflow: hidden;
		border: none;
	}

	.checkbox {
		padding-left: 23.5px;
	}

	.count-content {
		display: flex;
		align-items: center;
		justify-content: start;
	}

	.SKU {
		max-width: 30px;
	}
	.Size,
	.Browser {
		max-width: 0;
	}
	.Account {
		max-width: 40px;
	}
	.Proxy {
		max-width: 40px;
	}
	.Status {
		padding: 3px 0;
		color: var(--off-black);
	}

	.statusBubble {
		display: inline-block;
		border-radius: 100px;
		padding: 5px;
		font-size: 12px;
		text-align: center;
	}

	td img {
		vertical-align: middle;
	}
</style>
