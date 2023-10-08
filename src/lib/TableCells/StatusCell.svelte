<script lang="ts">
	import Fa from 'svelte-fa';
	import { stateColors, stateIconMapping } from '../../helpers';
	import type { ActivityState, CheckoutState, NacState } from '../../types';

	export let value: string;
	export let state: CheckoutState | ActivityState | NacState;
	export let page: string;

	const getColor = (state: CheckoutState | ActivityState | NacState) => {
		if ((page === 'activity' || page === 'nac') && state === 'Complete') {
			return 'var(--success-green)';
		} else {
			return stateColors[state];
		}
	};

	const darkColors = (state: CheckoutState | ActivityState | NacState) => {
		let x = {
			Ready: 'var(--off-black)',
			Queued: 'var(--warning-yellow-contrast)',
			Starting: 'var(--primary-contrast)',
			Running: 'var(--primary-contrast)',
			Waiting: 'var(--primary-contrast)',
			Error: 'var(--danger-red-contrast)',
			AwaitingResults: 'var(--primary-contrast)',
			Complete: 'var(--danger-red-contrast)',
			Winning: 'var(--success-green-contrast)'
		};

		if (page === 'activity' || page === 'nac') {
			x['Complete'] = 'var(--success-green-contrast)';
		}

		return x[state];
	};
</script>

<div class="status-content">
	<div class="state-color-icon" style="background-color: {getColor(state)};">
		<Fa icon={stateIconMapping[state]} color={darkColors(state)} size="md" />
		<span class="text" style={`color: ${darkColors(state)};`}>{value}</span>
	</div>
</div>

<style>
	.text {
		flex-grow: 1;
		text-align: left;
		color: var(--white);
	}
	.status-content {
		display: flex;
		align-items: center;
		justify-content: start;
		min-width: 150px;
		gap: 15px;
	}

	.state-color-icon {
		display: flex;
		align-items: center;
		justify-content: space-between; /* changed to space-between */
		width: auto; /* changed from fixed width */
		padding: 0 10px; /* added padding */
		height: 25px;
		gap: 10px;
		border-radius: 5px;
		box-sizing: border-box;
		outline: 0.15em solid inherit;
	}

	@media (max-width: 900px) {
		.status-content > .state-color-icon > .text {
			display: none;
		}

		.status-content {
			min-width: 0px;
		}
	}
</style>
