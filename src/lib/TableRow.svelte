<script lang="ts">
	import Checkbox from './Checkbox.svelte';
	import Button from './Button.svelte';
	import { makeRequest } from '../helpers';
	import type { State, TableRowType } from '../types';
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
	import Fa from 'svelte-fa';
	import {
		stateColors,
		verboseTasks,
		shiftPressed,
		checkedCheckoutTasks,
		lastCheckedCheckoutTasks,
		secondLastCheckedCheckoutTasks
	} from '../datastore';
	export let index: number | null;
	export let row: TableRowType;

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

	const checkForShift = () => {
		if (
			$shiftPressed &&
			$lastCheckedCheckoutTasks !== null &&
			$secondLastCheckedCheckoutTasks !== null
		) {
			let start = Math.min($lastCheckedCheckoutTasks, $secondLastCheckedCheckoutTasks);
			let end = Math.max($lastCheckedCheckoutTasks, $secondLastCheckedCheckoutTasks);

			for (let i = start + 1; i < end; i++) {
				if (!$checkedCheckoutTasks.includes(i)) {
					checkedCheckoutTasks.update((value) => {
						value.push(i);
						return value;
					});
				}
			}
		}
	};

	const handleClick = (passedIndex?: number) => {
		const currentIndex = typeof passedIndex !== 'undefined' ? passedIndex : index;

		$secondLastCheckedCheckoutTasks = $lastCheckedCheckoutTasks;
		$lastCheckedCheckoutTasks = currentIndex;

		checkedCheckoutTasks.update((value) => {
			if (checked && currentIndex) {
				value.splice(value.indexOf(currentIndex), 1);
			} else if (currentIndex) {
				value.push(currentIndex);
			}
			return value;
		});

		checkForShift();
	};

	const handleDispatch = (event: any) => {
		handleClick(event.detail.index);
	};

	let size = '';
	let taskId: number;
	let state: State;
	let profileName: string;
	let profileTags = '';
	$: {
		let thisTask = $verboseTasks.find((task) => task['account']['username'] === row['Account']);

		state = thisTask ? thisTask['state'] : 'Ready';
		size = thisTask ? thisTask['product']['size'] : '';
		taskId = thisTask ? thisTask['id'] : 0;
		profileName = thisTask ? thisTask['account']['profile']['name'] : '';
		profileTags = thisTask
			? thisTask['account']['profile']['tags'].map((item) => item.name).join(', ')
			: '';
	}

	let checked = false;
	$: {
		if (index !== null) {
			checked = $checkedCheckoutTasks.includes(index);
		}
	}

	const handleEdit = (event: MouseEvent) => {
		event.stopPropagation();
	};

	const handleDelete = (event: MouseEvent) => {
		event.stopPropagation();
		if (!taskId) return;
		makeRequest('delete', `http://127.0.0.1:23432/tasks?type=checkout`, [taskId], () => {
			// Update verboseTasks by filtering out the tasks that were deleted
			verboseTasks.update((tasks) => {
				return tasks.filter((task) => taskId != task.id);
			});

			// Reset checkedCheckoutTasks
			checkedCheckoutTasks.set([]);
		});
	};

	const handleStop = (event: MouseEvent) => {
		event.stopPropagation();
		if (taskId) {
			makeRequest('post', `http://127.0.0.1:23432/tasks/stop?type=undefined`, [taskId], () => {});
		}
	};

	const handleStart = (event: MouseEvent) => {
		event.stopPropagation();
		if (taskId) {
			makeRequest('post', `http://127.0.0.1:23432/tasks/start?type=undefined`, [taskId], () => {});
		}
	};
</script>

<tr on:click|stopPropagation={() => handleClick()} class={checked ? 'active' : ''}>
	<td class="Count">
		<div class="count-content">
			<div style="width: 10px; text-align: right; font-size:12px;">{index}</div>
			<div class="checkbox">
				<Checkbox {index} bind:checked on:change={handleDispatch} />
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
		gap: 5px; /* creates a gap between the icon and the text */
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
		flex-wrap: wrap; /* allows the buttons to wrap to next line */
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
