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
</script>

<div class="status-content">
	<div class="state-color-icon" style="background-color: {getColor(state)};">
		<Fa icon={stateIconMapping[state]} color="var(--off-black)" size="md" />
		<span class="text">{value}</span>
	</div>
</div>

<style>
	.text {
		flex-grow: 1;
		text-align: left;
		color: var(--off-black);
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
		gap: 15px;
		border-radius: 5px;
		box-sizing: border-box;
		outline: 0.15em solid #fafafa8f;
	}

	@media (max-width: 900px) {
		.status-content > .state-color-icon > .text {
			display: none;
		}
	}
</style>
