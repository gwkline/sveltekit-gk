<script lang="ts">
	import Fa from 'svelte-fa';
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
			<div class="state-color-icon" style="background-color: {stateColors[state]};">
				<Fa icon={stateIconMapping[state]} color="var(--white)" size="sm" />
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
		border-radius: 5px;
		min-height: 20px;
		flex-shrink: 0;
		margin: 10px 0px;
	}

	.status-section {
		flex-grow: 1;
		text-align: center;
	}

	.state-info {
		display: flex;
		flex-wrap: wrap;
		justify-content: space-evenly;
		align-items: start;
		margin: 10px 0px;
	}

	.state-item {
		display: flex;
		align-items: center;
		margin: 3px 0px;
		background-color: inherit;
		border: none;
		color: var(--off-black);
	}

	.state-item.selected {
		border: 1px solid var(--light-gray-4);
		border-radius: 5px;
		padding: 3px;
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

	.state-name,
	.state-count {
		margin-left: 10px;
		font-size: small;
	}

	.state-count {
		font-weight: bold;
	}
</style>
