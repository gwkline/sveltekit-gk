<script lang="ts">
	import {
		verboseTasks,
		filteredTasks,
		selectedTags,
		selectedState,
		searchValue,
		sortState
	} from '../datastore';
	import type { HeaderConfigType, Task } from '../types';

	export let size = 'lg';
	export let headerConfig: HeaderConfigType<Task>;

	let clearSearchValue = () => {
		searchValue.set('');
	};

	let timeout: number;
	function handleInput(e: Event): void {
		const target = e.target as HTMLInputElement;
		const value = target.value;
		clearTimeout(timeout);
		timeout = setTimeout(() => {
			searchValue.set(value);
		}, 300);
	}

	$: {
		let filtered = $verboseTasks.filter((task) => {
			// Keyword Search
			let keywordMatch = true;
			if ($searchValue !== '') {
				keywordMatch = JSON.stringify(task).toLowerCase().includes($searchValue.toLowerCase());
			}

			// Tag Filtering
			let tagMatch;
			if ($selectedTags.includes('No Tags')) {
				tagMatch =
					task.tags.length === 0 ||
					$selectedTags.some((tag) => task.tags.map((tagObj) => tagObj.name).includes(tag));
			} else {
				tagMatch =
					$selectedTags.length === 0 ||
					$selectedTags.some((tag) => task.tags.map((tagObj) => tagObj.name).includes(tag));
			}

			// State Filtering
			let stateMatch = !$selectedState || task.state === $selectedState;
			return keywordMatch && tagMatch && stateMatch;
		});

		filteredTasks.set(filtered);
	}
</script>

<link
	rel="stylesheet"
	href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.2.0/css/all.min.css"
/>
<div class="container">
	<input type="text" placeholder="Search" on:input={handleInput} class={size} id="input1" />
	<i class="fa fa-magnifying-glass fa-sm left {size}" />
	{#if $searchValue}
		<button on:click={clearSearchValue} class="right {size}" id="cleartext">
			<i class="fa fa-circle-xmark fa-md right" />
		</button>
	{/if}
</div>

<style>
	input {
		color: var(--off-black);
		background-color: var(--light-gray-1);
		outline: 1px solid var(--light-gray-4);
		background: var(--background);
		resize: none;
		border: none;
		padding: 10px 32px;
		box-sizing: border-box;
		font-family: inherit;
		font-style: normal;
		font-weight: 400;
		font-size: 14px;
		border-radius: 6px;
	}

	input.sm {
		width: 180px;
		height: 28px;
	}

	input.md {
		width: 180px;
		height: 32px;
	}

	input.lg {
		width: 180px;
		height: 40px;
	}

	.container {
		color: var(--off-black);
		position: relative;
	}

	input:focus {
		outline: 1px solid var(--primary);
		box-shadow: 0px 0px 0px 2px rgba(98, 91, 246, 0.32);
	}

	i.left {
		left: 12px;
		position: absolute;
		color: var(--off-black);
	}

	button.right {
		right: 0px;
		position: absolute;
		color: var(--gray);
	}

	.container i.right:hover {
		color: var(--off-black);
	}

	i.sm {
		top: 14px;
	}

	i.md {
		top: 16px;
	}

	i.lg {
		top: 20px;
	}

	button {
		width: auto;
		height: auto;
		position: absolute;
		display: inline-flex;
		border: none;
		justify-content: center;
		align-items: center;
		text-align: center;
		background: #00000000;
		color: var(--off-black);
	}

	button.sm {
		top: 6.5px;
	}

	button.md {
		top: 8px;
	}

	button.lg {
		top: 12px;
	}
</style>
