<script lang="ts">
	import Dropdown from '$lib/Dropdown.svelte';
	import { createEventDispatcher } from 'svelte';
	import type { ActivityMode } from '../../types';

	export let mode: ActivityMode;
	let value: string;

	const valueTitleMap: Record<ActivityMode, string> = {
		login: 'Login/EA',
		bp: 'BP Solve',
		stories: 'Stories',
		browse: 'Autobrowse',
		passwordreset: 'Password Reset',
		addverifiednumber: 'SMS Verify',
		manual: 'Manual'
	};

	const titleValueMap: Record<string, ActivityMode> = {
		'Login/EA': 'login',
		'BP Solve': 'bp',
		Stories: 'stories',
		Autobrowse: 'browse',
		'Password Reset': 'passwordreset',
		'SMS Verify': 'addverifiednumber',
		Manual: 'manual'
	};

	const dispatch = createEventDispatcher();
	const handleChange = () => {
		dispatch('changeActivityMode', titleValueMap[value]);
	};

	$: value = valueTitleMap[mode];
</script>

<div class="container">
	<Dropdown
		id="activityMode"
		style="width: 100px"
		options={Object.values(valueTitleMap)}
		bind:value
		size="lg"
		on:change={handleChange}
	/>
</div>

<style>
	.container {
		display: flex;
		justify-content: start;
		align-items: center;
	}
</style>
