<script lang="ts">
	import Fa from 'svelte-fa';
	import {
		faPause,
		faClover,
		faHourglassHalf,
		faRunning,
		faTrophy,
		faX,
		faClock
	} from '@fortawesome/free-solid-svg-icons';
	import { stateColors } from '../../datastore';
	import type { State } from '../../types';

	export let value: string;
	export let state: State;

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
</script>

<div class="status-content">
	<div class="state-color-icon" style="background-color: {stateColors[state]};">
		<Fa icon={stateIconMapping[state]} color="var(--white)" size="md" />
	</div>
	<p>{value}</p>
</div>

<style>
	.status-content {
		display: flex;
		align-items: center;
		justify-content: start;
		gap: 5px;
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

	@media (max-width: 900px) {
		.status-content > p {
			display: none;
		}
	}
</style>
