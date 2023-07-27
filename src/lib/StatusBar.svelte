<script lang="ts">
	import Fa from 'svelte-fa';
	import { stateColors, stateIconMapping } from '../helpers';
	import type { ActivityState, ActivityTask, CheckoutState, Task } from '../types';
	import { createEventDispatcher } from 'svelte';

	export let tasks: Task[] | ActivityTask[] = [];
	export let selectedState: CheckoutState | ActivityState | '' = '';
	export let page: 'activity' | 'checkout' = 'checkout';

	const dispatch = createEventDispatcher();
	// Array of states in the desired order
	const stateIsRelevant = (
		state: CheckoutState | ActivityState,
		page: 'checkout' | 'activity'
	): boolean => {
		const checkoutStates: CheckoutState[] = [
			'Ready',
			'Queued',
			'Starting',
			'Running',
			'Waiting',
			'Error',
			'Entered',
			'Complete',
			'Winning'
		];
		const activityStates: ActivityState[] = [
			'Ready',
			'Queued',
			'Starting',
			'Running',
			'Error',
			'Complete'
		];

		if (page === 'checkout') {
			return checkoutStates.includes(state as CheckoutState);
		} else {
			return activityStates.includes(state as ActivityState);
		}
	};

	const stateOrder: (CheckoutState | ActivityState)[] = [
		'Ready',
		'Queued',
		'Starting',
		'Running',
		'Waiting',
		'Error',
		'Entered',
		'Complete',
		'Winning'
	].filter((state) => stateIsRelevant(state as CheckoutState | ActivityState, page)) as (
		| CheckoutState
		| ActivityState
	)[];

	const capitalizeFirstLetter = (str: string) => str.charAt(0).toUpperCase() + str.slice(1);

	type ActivityCounts = Record<ActivityState, number>;
	type CheckoutCounts = Record<CheckoutState, number>;

	function isActivityCounts(counts: ActivityCounts | CheckoutCounts): counts is ActivityCounts {
		return (counts as ActivityCounts).Complete !== undefined;
	}

	const countTasksByState = (
		tasks: Task[] | ActivityTask[]
	): [CheckoutState | ActivityState, number][] => {
		let counts: ActivityCounts | CheckoutCounts;

		if (page === 'activity') {
			counts = {
				Ready: 0,
				Queued: 0,
				Starting: 0,
				Running: 0,
				Error: 0,
				Complete: 0
			} as ActivityCounts;
		} else {
			counts = {
				Ready: 0,
				Queued: 0,
				Starting: 0,
				Running: 0,
				Waiting: 0,
				Error: 0,
				Entered: 0,
				Complete: 0,
				Winning: 0
			} as CheckoutCounts;
		}

		tasks.forEach((task) => {
			if (counts.hasOwnProperty(task.state)) {
				if (isActivityCounts(counts)) {
					counts[task.state as ActivityState]++;
				} else {
					counts[task.state as CheckoutState]++;
				}
			}
		});

		return Object.entries(counts) as [CheckoutState | ActivityState, number][];
	};

	const getColor = (state: CheckoutState | ActivityState) => {
		if (page === 'activity' && state === 'Complete') {
			return 'var(--success-green)';
		} else {
			return stateColors[state];
		}
	};

	const selectState = (state: CheckoutState | ActivityState) => {
		dispatch('selectedState', state);
	};
	$: orderedTasks = tasks
		.slice()
		.sort((a, b) => stateOrder.indexOf(a.state) - stateOrder.indexOf(b.state));
</script>

<div class="state-info">
	{#each countTasksByState(orderedTasks) as [state, count] (state)}
		<button
			class={`state-item ${state === selectedState ? 'selected' : ''}`}
			on:click={() => selectState(state)}
		>
			<div class="state-color-icon" style="background-color: {getColor(state)};">
				<Fa icon={stateIconMapping[state]} color="var(--white)" size="md" />
			</div>
			<span class="state-name">{capitalizeFirstLetter(state) + ':'}</span>
			<span class="state-count">{count}</span>
		</button>
	{/each}
</div>

<div class="status-bar">
	{#each orderedTasks as task}
		<!-- svelte-ignore a11y-no-static-element-interactions -->
		<!-- svelte-ignore a11y-click-events-have-key-events -->
		<div
			class="status-section"
			style="background-color: {getColor(task['state'])};"
			title={capitalizeFirstLetter(task['state'])}
			on:click={() => {
				selectState(task['state']);
			}}
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
		outline: 1px solid var(--light-gray-3);
		overflow: hidden;
	}

	.status-section {
		flex-grow: 1;
		text-align: center;
		transition: background-color 0.3s ease;
		border: none;
		outline: none;
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
		transition: border-color 0.3s ease;
	}

	.state-color-icon {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 30px;
		height: 30px;
		border-radius: 5px;
		box-sizing: border-box;
		transition: background-color 0.3s ease;
	}

	.state-name,
	.state-count {
		margin-left: 10px;
		font-size: small;
	}

	.state-count {
		font-weight: bold;
		width: 25px;
	}
</style>
