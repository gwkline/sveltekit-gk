<script lang="ts">
	import {
		faFlag,
		faHourglassHalf,
		faRunning,
		faTrophy,
		faX,
		faPlay,
		faClock,
		faListOl
	} from '@fortawesome/free-solid-svg-icons';
	import { stateColors, verboseTasks, selectedState } from '../../datastore';
	import Fa from 'svelte-fa';
	import type { State, Task } from '../../types';

	// Array of states in the desired order
	const stateOrder: State[] = [
		'Ready',
		'Queued',
		'Starting',
		'Running',
		'Waiting',
		'Error',
		'Entered',
		'Winning'
	];

	const capitalizeFirstLetter = (str: string) => str.charAt(0).toUpperCase() + str.slice(1);

	$: orderedTasks = $verboseTasks
		.slice()
		.sort((a, b) => stateOrder.indexOf(a.state) - stateOrder.indexOf(b.state));

	const countTasksByState = (tasks: Task[]): [State, number][] => {
		const counts = {
			Ready: 0,
			Queued: 0,
			Starting: 0,
			Running: 0,
			Waiting: 0,
			Error: 0,
			Entered: 0,
			Winning: 0
		};
		tasks.forEach((task) => {
			counts[task.state]++;
		});
		return Object.entries(counts) as [State, number][]; // Convert object to an array of [key, value] pairs
	};

	const stateIconMapping = {
		Ready: faPlay,
		Queued: faListOl,
		Starting: faHourglassHalf,
		Running: faRunning,
		Waiting: faClock,
		Error: faX,
		Entered: faFlag,
		Winning: faTrophy
	};

	// Function to select state
	const selectState = (state: State) => {
		if ($selectedState === state) {
			selectedState.set(''); // Deselect state
		} else {
			selectedState.set(state);
		}
	};
</script>

<div class="state-info">
	{#each countTasksByState(orderedTasks) as [state, count] (state)}
		<button
			class={`state-item ${state === $selectedState ? 'selected' : ''}`}
			on:click={() => selectState(state)}
		>
			<div
				class="state-color-icon"
				style="background-color: {state == 'Ready' ? 'var(--light-gray-1)' : stateColors[state]};"
			>
				<Fa icon={stateIconMapping[state]} class="fa-icon" color="var(--white)" size="xs" />
			</div>
			<span class="state-name">{capitalizeFirstLetter(state) + ':'}</span>
			<span class="state-count">{count}</span>
		</button>
	{/each}
</div>

<div class="status-bar">
	{#each orderedTasks as task}
		<div
			class="status-section"
			style="background-color: {stateColors[task['state']]};"
			title={capitalizeFirstLetter(task['state'])}
		/>
	{/each}
</div>

<style>
	.status-bar {
		display: flex;
		width: 100%;
		height: 20px;
		background-color: var(--light-gray-1);
		border-radius: 5px;
		min-height: 20px; /* Added min-height */
		flex-shrink: 0; /* Prevents shrinking */
		margin: 10px 0px;
	}

	.status-section {
		flex-grow: 1;
		text-align: center;
		border-radius: 10px;
	}

	.state-info {
		display: flex; /* Changed from grid to flex */
		flex-wrap: wrap; /* Wrap items to the next line if they run out of space */
		justify-content: space-between; /* Aligns the items to the start of the container */
		align-items: start; /* Aligns the items vertically to the start of the container */
		margin: 10px 0px;
		height: 30px;
	}

	.state-item {
		display: flex;
		align-items: center;
		width: 105px;
		margin: 3px 0px;
		transition: border 0.3s ease; /* Added transition for smoother border change */
		background-color: inherit;
		border: none;
		color: var(--off-black);
	}

	.state-item.selected {
		border: 1px solid var(--light-gray-4);
		border-radius: 5px; /* Optional: To round the border edges */
		padding: 3px;
	}

	.state-color-icon {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 20px;
		height: 20px;
		border-radius: 5px;
		margin-right: 10px;
		padding: 3px;
	}

	.state-name {
		margin-right: 5px;
		font-size: small;
	}

	.state-count {
		font-weight: bold;
		font-size: small;
	}
</style>
