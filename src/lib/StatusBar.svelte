<script lang="ts">
	import Fa from 'svelte-fa';
	import { stateColors, stateIconMapping } from '../helpers';
	import type {
		ActivityState,
		ActivityTask,
		CheckoutState,
		NacState,
		NacTask,
		Task
	} from '../types';
	import { createEventDispatcher } from 'svelte';

	export let tasks: Task[] | ActivityTask[] | NacTask[] = [];
	export let selectedState: CheckoutState | ActivityState | NacState | '' = '';
	export let page: 'activity' | 'checkout' | 'nac' = 'checkout';

	const dispatch = createEventDispatcher();
	// Array of states in the desired order
	const stateIsRelevant = (
		state: CheckoutState | ActivityState | NacState,
		page: 'checkout' | 'activity' | 'nac'
	): boolean => {
		const checkoutStates: CheckoutState[] = [
			'Ready',
			'Queued',
			'Starting',
			'Running',
			'Waiting',
			'Error',
			'AwaitingResults',
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
		const nacStates: NacState[] = ['Ready', 'Queued', 'Starting', 'Running', 'Error', 'Complete'];

		if (page === 'checkout') {
			return checkoutStates.includes(state as CheckoutState);
		} else if (page === 'activity') {
			return activityStates.includes(state as ActivityState);
		} else {
			return nacStates.includes(state as NacState);
		}
	};

	const stateOrder: (CheckoutState | ActivityState)[] = [
		'Queued',
		'Starting',
		'Running',
		'Waiting',
		'Error',
		'AwaitingResults',
		'Complete',
		'Winning',
		'Ready'
	].filter((state) => stateIsRelevant(state as CheckoutState | ActivityState | NacState, page)) as (
		| CheckoutState
		| ActivityState
		| NacState
	)[];

	const capitalizeFirstLetter = (str: string) => {
		if (str === 'AwaitingResults') {
			return 'Entered';
		}

		return str.charAt(0).toUpperCase() + str.slice(1);
	};

	type ActivityCounts = Record<ActivityState, number>;
	type CheckoutCounts = Record<CheckoutState, number>;
	type NacCounts = Record<NacState, number>;

	function isActivityCounts(counts: ActivityCounts | CheckoutCounts): counts is ActivityCounts {
		return (counts as ActivityCounts).Complete !== undefined;
	}

	const countTasksByState = (
		tasks: Task[] | ActivityTask[] | NacTask[]
	): [CheckoutState | ActivityState | NacState, number][] => {
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
		} else if (page === 'checkout') {
			counts = {
				Ready: 0,
				Queued: 0,
				Starting: 0,
				Running: 0,
				Waiting: 0,
				Error: 0,
				AwaitingResults: 0,
				Complete: 0,
				Winning: 0
			} as CheckoutCounts;
		} else {
			counts = {
				Ready: 0,
				Queued: 0,
				Starting: 0,
				Running: 0,
				Error: 0,
				Complete: 0
			} as NacCounts;
		}

		tasks.forEach((task) => {
			if (Object.prototype.hasOwnProperty.call(counts, task.state)) {
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
		if ((page === 'activity' || page === 'nac') && state === 'Complete') {
			return 'var(--success-green)';
		} else {
			return stateColors[state];
		}
	};

	const selectState = (state: CheckoutState | ActivityState | NacState) => {
		dispatch('selectedState', state);
	};
	$: orderedTasks = tasks
		.slice()
		.sort((a, b) => stateOrder.indexOf(a.state) - stateOrder.indexOf(b.state));

	const shadow = (state: CheckoutState | ActivityState | NacState) => {
		return `box-shadow:
			${getColor(state)} 0px 0px 0px 0px,
			${getColor(state)} 0px 1px 1px 0px,
			${getColor(state)} 0px 2px 5px 0px,
			${getColor(state)} 0px 2px 5px 0px !important;`;
	};
</script>

<div class="state-info">
	{#each countTasksByState(orderedTasks) as [state, count] (state)}
		<button
			class={`state-item shadow ${state === selectedState ? 'selected' : ''}`}
			style={`outline-color: ${getColor(state)}; ${state === selectedState ? shadow(state) : ''}}`}
			on:click={() => selectState(state)}
		>
			<div style="align-items: center; display: flex; flex-direction: row; gap: 7px;">
				<div class="state-color-icon" style="background-color: {getColor(state)};">
					<Fa icon={stateIconMapping[state]} color="var(--white)" size="md" />
				</div>
				<span class="state-name">{capitalizeFirstLetter(state)}</span>
			</div>
			<div class="divider"></div>
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
	.divider {
		width: 1px;
		background-color: var(--light-gray-4); /* You can change this to a light gray like #ccc */
		height: 25px; /* Change this line */
		margin: 0;
	}
	.status-bar {
		display: flex;
		width: 100%;
		height: 20px;
		border-radius: 5px;
		min-height: 20px;
		flex-shrink: 0;
		margin: 10px 0px;
		outline: 1px solid var(--light-gray-4);
		overflow: hidden;
	}

	.status-section {
		flex-grow: 1;
		text-align: center;
		transition: background-color 0.3s ease;
		outline: 1px solid var(--light-gray-3);
		outline: none;
	}

	.state-info {
		display: flex;
		flex-wrap: wrap;
		justify-content: space-evenly;
		align-items: start;
		margin-top: 20px;
	}

	/* .state-info {
		margin-top: 20px;
		display: grid;
		grid-gap: 1em;
		grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
	} */

	.state-item {
		display: flex;
		align-items: center;
		justify-content: space-evenly;
		margin: 3px 0px;
		background-color: inherit;
		color: var(--off-black);
		outline: 1px solid var(--light-gray-3);
		border: 1px solid transparent;
		padding: 5px;
		border-radius: 6px;
		cursor: pointer;
		gap: 10px;
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
		font-size: small;
	}

	.state-count {
		font-weight: bold;
		width: 25px;
	}

	.shadow {
		box-shadow:
			var(--shadow-1) 0px 0px 0px 0px,
			var(--shadow-2) 0px 1px 1px 0px,
			var(--shadow-3) 0px 0px 0px 1px,
			var(--shadow-4) 0px 2px 5px 0px;
		transition: all 0.15s ease;
	}

	.shadow:hover {
		box-shadow:
			var(--shadow-1) 0px 0px 0px 0px,
			var(--shadow-2) 0px 1px 1px 0px,
			var(--shadow-3) 0px 2px 5px 0px,
			var(--shadow-4) 0px 2px 5px 0px;
	}
</style>
