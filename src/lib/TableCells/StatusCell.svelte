<script lang="ts">
	import Fa from 'svelte-fa';
	import {
		faPause,
		faClover,
		faHourglassHalf,
		faRunning,
		faTrophy,
		faX,
		faClock,
		faCheck
	} from '@fortawesome/free-solid-svg-icons';
	import { stateColors } from '../../datastore';
	import type { ActivityState, CheckoutState } from '../../types';

	export let value: string;
	export let state: CheckoutState | ActivityState;

	const stateIconMapping = {
		Ready: faPause,
		Queued: faClock,
		Starting: faHourglassHalf,
		Running: faRunning,
		Waiting: faClock,
		Error: faX,
		Entered: faClover,
		Winning: faTrophy,
		Complete: faCheck
	};
</script>

<div class="status-content">
	<div class="state-color-icon" style="background-color: {stateColors[state]};">
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
		width: 30px;
		height: 30px;
		border-radius: 5px;
		box-sizing: border-box;
	}

	@media (max-width: 900px) {
		.status-content > p {
			display: none;
		}
	}
</style>
