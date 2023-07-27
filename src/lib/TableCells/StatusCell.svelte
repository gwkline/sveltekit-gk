<script lang="ts">
	import Fa from 'svelte-fa';
	import { stateColors, stateIconMapping } from '../../helpers';
	import type { ActivityState, CheckoutState } from '../../types';

	export let value: string;
	export let state: CheckoutState | ActivityState;
	export let page: string;

	const getColor = (state: CheckoutState | ActivityState) => {
		if (page === 'activity' && state === 'Complete') {
			return 'var(--success-green)';
		} else {
			return stateColors[state];
		}
	};
</script>

<div class="status-content">
	<div class="state-color-icon" style="background-color: {getColor(state)};">
		<Fa icon={stateIconMapping[state]} color="var(--white)" size="md" />
	</div>
	<p>{value}</p>
</div>

<style>
	p {
		flex-wrap: wrap;
		text-overflow: ellipsis;
		white-space: normal;
		display: -webkit-box;
		-webkit-line-clamp: 2;
		-webkit-box-orient: vertical;
	}
	.status-content {
		display: flex;
		align-items: center;
		justify-content: start;
		gap: 5px;
	}

	.state-color-icon {
		display: flex;
		flex-grow: 0;
		flex-shrink: 0;
		align-items: center;
		justify-content: center;
		width: 25px;
		height: 25px;
		border-radius: 5px;
		box-sizing: border-box;
		outline: 0.15em solid #fafafa8f;
	}

	@media (max-width: 900px) {
		.status-content > p {
			display: none;
		}
	}
</style>
