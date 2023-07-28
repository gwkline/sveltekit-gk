<script lang="ts">
	import Search from '$lib/Search.svelte';
	import Button from '$lib/Button.svelte';
	import { isLoading } from '../../datastore';
	import { faPen } from '@fortawesome/free-solid-svg-icons';
	import { createEventDispatcher } from 'svelte';
	import type { ActivityMode } from '../../types';

	export let searchValue: string = '';
	export let buttonTextCount: string;

	let modeValue: ActivityMode;
	let scheduleValue: string;

	const titleValueMap: Record<string, ActivityMode> = {
		'Login/EA': 'login',
		'BP Solve': 'bp',
		Stories: 'stories',
		Autobrowse: 'browse',
		'Password Reset': 'passwordreset',
		'SMS Verify': 'addverifiednumber',
		Manual: 'manual'
	};

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
</script>

<div class="container">
	<div class="button-row">
		<div class="button-group left-button-group">
			<Search size="md" on:searchValue value={searchValue} />
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
					style="button">Edit {buttonTextCount} Proxy Lists</Button
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
</style>
