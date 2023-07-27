<script lang="ts">
	import Search from '$lib/Search.svelte';
	import Button from '$lib/Button.svelte';
	import Input from '$lib/Input.svelte';
	import Toggle from '$lib/Toggle.svelte';
	import { isLoading, showTags } from '../../datastore';
	import { faPlay, faStop, faPen, faTrash } from '@fortawesome/free-solid-svg-icons';
	import { createEventDispatcher } from 'svelte';
	import Dropdown from '$lib/Dropdown.svelte';
	import type { ActivityMode, Schedule } from '../../types';

	export let searchValue: string = '';
	export let buttonTextCount: string;
	export let schedules: Schedule[] = [];

	let maxStartingActivityTaskCount: string;
	let modeValue: ActivityMode;
	let scheduleValue: string;

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

	type settings = 'max_starting_activity_tasks';
	type states = 'start' | 'stop' | 'delete' | 'duplicate' | 'editSchedule' | 'editMode' | 'create';

	const dispatch = createEventDispatcher();

	const handleTaskAction = (state: states) => {
		switch (state) {
			case 'start':
				dispatch('start');
				break;
			case 'stop':
				dispatch('stop');
				break;
			case 'editMode':
				dispatch('editActivity', { mode: titleValueMap[modeValue] });
				break;
			case 'editSchedule':
				dispatch('editSchedule', { scheduleName: scheduleValue });
				break;
			case 'delete':
				dispatch('delete');
				break;
		}
	};

	const saveSettings = (settingKey: settings, value: string) => {
		dispatch('saveSettings', { name: settingKey, value: value });

		maxStartingActivityTaskCount = '';
	};

	let scheduleNames: string[] = [];
	$: scheduleNames = ['None', ...schedules.map((schedule) => schedule.name)];
</script>

<div class="container">
	<div class="button-row">
		<div class="button-group left-button-group">
			<Search size="md" on:searchValue value={searchValue} />
			<div class="toggle-container">
				<Toggle bind:checked={$showTags} />
				<span class="toggle-label">Show tags</span>
			</div>
		</div>
		<div class="button-group right-button-group">
			<div class="button-group">
				<Button
					variant="default"
					size="md"
					icon={faPen}
					isLoading={$isLoading.changeActivityMode}
					onclick={() => handleTaskAction('editMode')}
					resizable={false}
					style="button">Edit {buttonTextCount} Payments</Button
				>
			</div>
		</div>
	</div>
</div>

<style>
	.button-row {
		display: flex;
		justify-content: space-between;
		margin: 2px 0;
	}

	.button-group {
		display: flex;
		flex-wrap: nowrap;
		justify-content: space-evenly;
		align-items: center;
		padding: 5px 0px;
	}

	.button-group.left-button-group {
		justify-content: start;
		flex-wrap: wrap;
	}

	.button-group.right-button-group {
		justify-content: end;
	}

	.toggle-container {
		display: flex;
		align-items: center;
		margin-left: 20px;
	}

	.toggle-label {
		margin-left: 10px;
		white-space: nowrap;
		font-size: 14px;
	}
</style>
