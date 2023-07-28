<script lang="ts">
	import Search from '$lib/Search.svelte';
	import Button from '$lib/Button.svelte';
	import { isLoading } from '../../datastore';
	import { faPen } from '@fortawesome/free-solid-svg-icons';

	export let searchValue: string = '';
	export let buttonTextCount: string;
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
					resizable={false}
					style="button">Edit {buttonTextCount} Schedules</Button
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
