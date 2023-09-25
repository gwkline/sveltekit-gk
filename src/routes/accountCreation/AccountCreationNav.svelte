<script lang="ts">
	import Search from '$lib/Search.svelte';
	import Input from '$lib/Input.svelte';
	import Toggle from '$lib/Toggle.svelte';
	import { showTags } from '../../datastore';
	import { createEventDispatcher } from 'svelte';

	export let searchValue: string = '';
	export let maxStartingTasks: string;

	let maxActiveTaskCount: string;
	let maxStartingTaskCount: string;

	type settings = 'max_active_tasks' | 'max_starting_tasks';

	const dispatch = createEventDispatcher();

	const saveSettings = (settingKey: settings, value: string) => {
		dispatch('saveSettings', { name: settingKey, value: value });

		maxActiveTaskCount = '';
		maxStartingTaskCount = '';
	};
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
			<div>
				<Input
					placeholder="Max Starting Tasks: {maxStartingTasks}"
					style="width: 175px;"
					variant="transparent"
					bind:value={maxStartingTaskCount}
					on:blur={() => saveSettings('max_starting_tasks', maxStartingTaskCount)}
				/>
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
		flex-wrap: wrap;
		justify-content: space-evenly;
		align-items: center;
		padding: 5px 0px;
	}

	.button-group.left-button-group {
		justify-content: start;
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

	.input-group {
		display: flex;
		align-items: center;
		margin-right: 10px;
		justify-content: space-around;
	}
</style>
