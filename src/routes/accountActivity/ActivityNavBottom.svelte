<script lang="ts">
	import Button from '$lib/Button.svelte';
	import { isLoading } from '../../datastore';
	import { faPlay, faStop, faTrash } from '@fortawesome/free-solid-svg-icons';
	import { createEventDispatcher } from 'svelte';
	import Dropdown from '$lib/Dropdown.svelte';
	import type { ActivityMode, Schedule } from '../../types';

	export let buttonTextCount: string;
	export let schedules: Schedule[] = [];

	let maxStartingActivityTaskCount: string;
	let modeValue: ActivityMode | '';
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

	let scheduleNames: string[] = [];
	$: scheduleNames = ['None', ...schedules.map((schedule) => schedule.name)];
</script>

<div class="container">
	<div class="button-row push-to-end"></div>
	<div class="button-row">
		<div class="button-group left-button-group">
			<Dropdown
				id="accountOps"
				style="width: 160px; height: 32px; margin-right: 10px;"
				options={Object.values(valueTitleMap)}
				bind:value={modeValue}
				on:change={() => {
					handleTaskAction('editMode');
					modeValue = '';
				}}
				overlay={true}
				size="lg"
				title={`Run ${buttonTextCount} Account Ops`}
			/>
			<Button
				variant="danger"
				onclick={() => handleTaskAction('delete')}
				isLoading={$isLoading.delete}
				size="md"
				icon={faTrash}
				resizable={false}
				style="button">Clear {buttonTextCount} Sessions</Button
			>
		</div>
		<div class="button-group">
			<Button
				variant="primary"
				onclick={() => handleTaskAction('start')}
				isLoading={$isLoading.start}
				size="md"
				icon={faPlay}
				resizable={false}
				alternate={true}
				outline="outline"
				style="button">Start {buttonTextCount} Tasks</Button
			>

			<Button
				variant="danger"
				onclick={() => handleTaskAction('stop')}
				isLoading={$isLoading.stop}
				size="md"
				icon={faStop}
				resizable={false}
				alternate={true}
				outline="outline"
				style="button">Stop {buttonTextCount} Tasks</Button
			>
		</div>
		<div class="button-group right-button-group">
			<Dropdown
				id="activityMode"
				style="width: 160px; height: 32px; margin-right: 10px;"
				options={Object.values(valueTitleMap)}
				bind:value={modeValue}
				on:change={() => {
					handleTaskAction('editMode');
					modeValue = '';
				}}
				overlay={true}
				size="lg"
				title={`Set ${buttonTextCount} Modes`}
			/>

			<Dropdown
				id="scheduleDropdown"
				style="width: 160px; height: 32px; margin-right: 10px;"
				options={scheduleNames}
				bind:value={scheduleValue}
				on:change={() => {
					handleTaskAction('editSchedule');
					scheduleValue = '';
				}}
				overlay={true}
				title={`Set ${buttonTextCount} Schedules`}
				size="lg"
			/>
		</div>
	</div>
</div>

<style>
	.container {
		align-items: center;
	}
	.button-row.push-to-end {
		justify-content: end;
	}
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
</style>
