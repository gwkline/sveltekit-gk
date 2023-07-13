<script lang="ts">
	import Fa from 'svelte-fa';
	import {
		faTimes,
		faTrash,
		faPenToSquare,
		faCheck,
		faPlus,
		faSave
	} from '@fortawesome/free-solid-svg-icons';
	import { verboseTasks, selectedTags, checkedCheckoutTasks } from '../datastore';
	import { makeRequest } from '../helpers';
	import { onMount, onDestroy } from 'svelte';
	import Button from './Button.svelte';
	import type { Task } from '../types';

	let allTags: string[];
	let tagsCount: { tag: string; count: number }[];
	let isEditing = false;
	let editedText = '';
	let isAddingTag = false;
	let newTagText = '';
	let totalSelectedTasks = 0;

	onMount(() => {
		window.addEventListener('keydown', handleKeydown as EventListener);
	});

	onDestroy(() => {
		window.removeEventListener('keydown', handleKeydown);
	});

	if (typeof window !== 'undefined') {
		// Listen for mouse click events outside of the tag to stop editing
		window.addEventListener('mousedown', (event: MouseEvent) => {
			const target = event.target as HTMLElement;
			if (isEditing && !target?.classList?.contains('tag-edit-input') && !isAddingTag) {
				saveEditedTags();
			}
		});
	}

	const selectTag = (tag: string) => {
		isAddingTag = false;

		// if the tag is already selected, remove it from selectedTags
		// otherwise, add it to selectedTags
		const index = $selectedTags.indexOf(tag);
		if (index > -1) {
			selectedTags.set($selectedTags.filter((t) => t !== tag));
		} else {
			selectedTags.set([...$selectedTags, tag]);
		}
	};
	const selectAllTags = () => {
		selectedTags.set(tagsCount.map((t) => t.tag)); // Selects all tags
	};
	const clearAll = () => {
		selectedTags.set([]); // Clears all selected tags
	};
	const removeTag = (tag: string) => {
		let tasksToUpdate: Task[] = [];

		verboseTasks.update((tasks) => {
			return tasks.map((task) => {
				// check if task contains the tag
				let taskHasTag = task.tags.some((t) => t.name === tag);

				if (taskHasTag) {
					// remove the tag from this task
					task.tags = task.tags.filter((t) => t.name !== tag);

					// add task to array of tasks to update
					tasksToUpdate.push(task);
				}

				// return the potentially modified task
				return task;
			});
		});

		if (tasksToUpdate.length > 0) {
			makeRequest('put', 'http://127.0.0.1:23432/tasks?type=checkout', tasksToUpdate, () => {});
		}
	};
	const removeTaskWithTag = (tag: string) => {
		let taskIdsToRemove: number[] = [];

		verboseTasks.update((tasks) => {
			return tasks.filter((task) => {
				let taskHasTag = task.tags.some((t) => t.name === tag);
				let removingNoTags = $selectedTags.includes('No Tags') && task.tags.length === 0;

				if (taskHasTag || removingNoTags) {
					// add task id to array of task ids to remove
					taskIdsToRemove.push(task.id);
					// filter out this task
					return false;
				}

				// keep this task in the array
				return true;
			});
		});

		if (taskIdsToRemove.length > 0) {
			makeRequest(
				'delete',
				'http://127.0.0.1:23432/tasks?type=checkout',
				taskIdsToRemove,
				() => {}
			);
		}
	};
	const deleteSelectedTags = () => {
		$selectedTags.forEach((tag) => removeTag(tag));
		selectedTags.set([]); // Clear selection after deleting
	};
	const deleteSelectedTasks = () => {
		$selectedTags.forEach((tag) => removeTaskWithTag(tag));
		selectedTags.set([]); // Clear selection after deleting
	};
	const saveEditedTags = () => {
		// Do not proceed with the function if the editedText is empty
		if (editedText.trim() === '') return;

		let updatedTasks: Task[] = [];
		verboseTasks.update((tasks) => {
			return tasks.map((task) => {
				let taskHasSelectedTag = task.tags.some((t) => $selectedTags.includes(t.name));

				// If the "No Tags" tag is being edited and the task has no tags
				if ($selectedTags.includes('No Tags') && task.tags.length === 0) {
					// Add the new tag
					task.tags.push({ name: editedText });

					// Add the task to the updatedTasks array
					updatedTasks.push(task);
				}
				// If the task has a selected tag
				else if (taskHasSelectedTag) {
					// Update the name of the tag
					task.tags = task.tags.map((t) =>
						$selectedTags.includes(t.name) ? { ...t, name: editedText } : t
					);

					// Add the task to the updatedTasks array
					updatedTasks.push(task);
				}

				return task;
			});
		});

		if (updatedTasks.length > 0) {
			makeRequest('put', 'http://127.0.0.1:23432/tasks?type=checkout', updatedTasks, () => {});
		}

		editedText = '';
		isEditing = false;
		selectedTags.set([]);
	};
	const editTags = () => {
		editedText = '';
		isEditing = true;
	};
	const handleKeydown = (event: KeyboardEvent) => {
		if (isEditing) {
			if (event.key === 'Enter') {
				saveEditedTags();
			} else if (event.key === 'Backspace') {
				// Remove the last character from editedText
				editedText = editedText.slice(0, -1);
			} else if (!['Shift', 'Control', 'Alt', 'Meta'].includes(event.key)) {
				// Only change text if the key is not Shift, Control, Alt or Meta (you can add other non-character keys here)
				editedText += event.key;
			}
		}
	};
	const addAdditionalTag = () => {
		// Do not proceed with the function if the newTagText is empty
		if (newTagText.trim() === '') {
			return;
		}

		let updatedTasks: Task[] = [];
		verboseTasks.update((tasks) => {
			return tasks.map((task) => {
				let taskHasSelectedTag = task.tags.some((t) => $selectedTags.includes(t.name));

				// If the "No Tags" tag is selected and the task has no tags
				if ($selectedTags.includes('No Tags') && task.tags.length === 0) {
					task.tags.push({ name: newTagText });
					updatedTasks.push(task);
				}

				// If the task has a selected tag
				if (taskHasSelectedTag) {
					// Add the new tag to the task
					task.tags.push({ name: newTagText });

					// Add the task to the updatedTasks array
					updatedTasks.push(task);
				}

				return task;
			});
		});

		if (updatedTasks.length > 0) {
			makeRequest('put', 'http://127.0.0.1:23432/tasks?type=checkout', updatedTasks, () => {});
		}

		newTagText = '';
		isAddingTag = false;
		selectedTags.set([]);
	};

	type AddOrEdit = 'add' | 'edit';
	type AddOrEditState = AddOrEdit | null;
	let addOrEdit: AddOrEditState = null;
	const startAddingTag = (setState: AddOrEdit) => {
		if (isAddingTag && setState) {
			addOrEdit = null;
			isAddingTag = false;
			newTagText = ''; // Clear the newTagText
		} else {
			addOrEdit = setState;
			newTagText = '';
			isAddingTag = true;
		}
	};
	const addTagToTasks = () => {
		//Do not proceed with the function if the newTagText is empty
		if (newTagText.trim() === '') {
			return;
		}
		let updatedTasks: Task[] = [];
		verboseTasks.update((tasks) => {
			return tasks.map((task) => {
				if ($checkedCheckoutTasks.includes(task.id)) {
					task.tags.push({ name: newTagText });
					updatedTasks.push(task);
				}
				return task;
			});
		});
		if (updatedTasks.length > 0) {
			makeRequest('put', 'http://127.0.0.1:23432/tasks?type=checkout', updatedTasks, () => {});
		}
		newTagText = '';
		isAddingTag = false;
	};
	$: {
		allTags = $verboseTasks
			.map((task) => task.tags)
			.flat()
			.map((tag) => tag.name)
			.filter((tag) => tag);

		let uniqueTags = [...new Set(allTags)];

		tagsCount = uniqueTags.map((tag) => {
			return {
				tag: tag,
				count: allTags.filter((t) => t === tag).length
			};
		});

		// Count the number of accounts without any tags
		let noTagsCount = $verboseTasks.filter((account) => account.tags.length === 0).length;

		// Add a "No Tags" tag if there are any accounts without tags
		if (noTagsCount > 0) {
			tagsCount.unshift({ tag: 'No Tags', count: noTagsCount });
		}
	}
	$: {
		// Get all tasks with selected tags, but don't count a task more than once
		const selectedTasks = new Set();
		if ($selectedTags.length > 0) {
			$verboseTasks.forEach((task) => {
				const taskTags = task.tags.map((t) => t.name);
				if ($selectedTags.some((tag) => taskTags.includes(tag))) {
					selectedTasks.add(task.id);
				}

				// If the "No Tags" tag is selected, add tasks that have no tags
				if ($selectedTags.includes('No Tags') && task.tags.length === 0) {
					selectedTasks.add(task.id);
				}
			});
		}
		totalSelectedTasks = selectedTasks.size;
	}

	const selectInput = (event: { target: any }) => {
		const input = event.target;
		if ('select' in input) {
			input.select();
		}
	};

	const saveInput = (event: { target: any }) => {
		const input = event.target;
		newTagText = input.value;
	};
</script>

<div class="container-wrapper">
	<div class="selection-info">
		<p class="count-info">
			{$selectedTags.length}
			{$selectedTags.length === 1 ? 'tag' : 'tags'} selected ({totalSelectedTasks}
			total tasks)
		</p>
		<button class="clear-all" on:click={selectAllTags}>
			<Fa icon={faCheck} size="sm" />
			Select all tags
		</button>
		{#if $checkedCheckoutTasks.length > 0}
			<div class="input-wrapper">
				{#if isAddingTag && addOrEdit === 'add'}
					<div class={isAddingTag ? 'input-container' : 'input-container hidden'}>
						<input
							type="text"
							class="tag-add-input"
							value={newTagText}
							on:input={saveInput}
							on:keydown={(e) => e.key === 'Enter' && addTagToTasks()}
							on:blur={addTagToTasks}
							on:focus|stopPropagation={selectInput}
						/>
						<Button
							icon={faSave}
							size="xs"
							variant="primary"
							onclick={() => {
								addTagToTasks();
							}}
						/>
						<Button
							icon={faTimes}
							size="xs"
							variant="danger"
							onclick={() => {
								isAddingTag = false;
							}}
						/>
					</div>
				{:else}
					<button
						class="clear-all"
						on:click={() => {
							startAddingTag('add');
						}}
					>
						<Fa icon={faPlus} size="sm" />
						Add tags to selected tasks
					</button>
				{/if}
			</div>
		{/if}

		{#if $selectedTags.length > 0}
			<button class="clear-all" on:click={clearAll}>
				<Fa icon={faTimes} size="sm" />
				Clear selections
			</button>
			<button class="clear-all" on:click={editTags}>
				<Fa icon={faPenToSquare} size="sm" />
				Edit selected
			</button>
			<button class="clear-all" on:click={deleteSelectedTags}>
				<Fa icon={faTrash} size="sm" />
				Delete selected tags
			</button>
			<button class="clear-all" on:click={deleteSelectedTasks}>
				<Fa icon={faTrash} size="sm" />
				Delete selected tasks
			</button>
			<div class="input-wrapper">
				{#if isAddingTag && addOrEdit === 'edit'}
					<div class={isAddingTag ? 'input-container' : 'input-container hidden'}>
						<input
							type="text"
							class="tag-add-input"
							value={newTagText}
							on:input={saveInput}
							on:keydown={(e) => e.key === 'Enter' && addAdditionalTag()}
							on:blur={addAdditionalTag}
							on:focus|stopPropagation={selectInput}
						/>
						<Button
							icon={faSave}
							size="xs"
							variant="primary"
							onclick={() => {
								addAdditionalTag();
							}}
						/>
						<Button
							icon={faTimes}
							size="xs"
							variant="danger"
							onclick={() => {
								isAddingTag = false;
							}}
						/>
					</div>
				{:else}
					<button
						class="clear-all"
						on:click={() => {
							startAddingTag('edit');
						}}
					>
						<Fa icon={faPlus} size="sm" />
						Add additional tags
					</button>
				{/if}
			</div>
		{/if}
	</div>

	<div class="tag-container">
		{#each tagsCount as { tag, count }}
			<button
				class="tag"
				class:selected={$selectedTags.includes(tag)}
				on:click|stopPropagation={() => selectTag(tag)}
			>
				{#if $selectedTags.includes(tag) && isEditing}
					<input
						type="text"
						class="tag-edit-input"
						value={editedText}
						on:keydown|preventDefault={(e) => {
							e.key === 'Enter' && saveEditedTags();
						}}
						on:blur={saveEditedTags}
						on:focus|stopPropagation={selectInput}
					/>
				{:else}
					<div class="tag-text">
						{tag}
						<span class="tag-count">({count})</span>
					</div>
				{/if}
			</button>
		{/each}
	</div>
</div>

<style>
	.count-info {
		font-size: 12px;
		margin-right: 1rem;
	}
	.input-wrapper {
		display: flex;
		align-items: center;
	}
	.hidden {
		visibility: hidden;
	}
	.input-container {
		display: flex;
		align-items: center;
	}
	.tag-add-input {
		border: 1px solid var(--light-gray-4);
		background-color: inherit;
		color: inherit;
		font-size: inherit;
		width: auto;
		outline: none;
		height: 10px;
		margin: 0px 10px;
		border-radius: 10px;
		padding: 5px 10px;
	}
	.clear-all {
		cursor: pointer;
		border: none;
		margin-right: 1rem; /* Adds a bit of margin on the left to separate it from the selection info */
		font-size: 11px; /* adjust as needed */
		display: inline; /* Ensure it is displayed inline */
		background-color: inherit;
		color: var(--off-black);
	}

	.clear-all:hover {
		color: var(--primary);
		text-decoration: underline;
	}

	.tag-edit-input {
		border: none;
		background: transparent;
		color: inherit;
		font-size: inherit;
		width: 100%;
		outline: none;
	}
	/* Create generic style for all new action links */
	.selection-info > button {
		cursor: pointer;
		font-size: 11px;
		color: var(--off-black);
		display: inline;
	}

	/* Styling for hover state */
	.selection-info > button:hover {
		color: var(--primary);
		text-decoration: underline;
	}

	.tag-container {
		display: flex;
		flex-wrap: wrap;
	}
	.container-wrapper {
		position: relative; /* set the container wrapper as the reference point for absolute positioning */
		padding-bottom: 10px;
		display: flex;
		flex-direction: column;
	}

	.selection-info {
		position: relative; /* position the selection-info absolutely within the container wrapper */
		font-size: 12px;
		color: var(--off-black);
		display: flex;
		flex-wrap: wrap;
		white-space: nowrap;
		justify-content: start;

		align-items: center;
		padding: 10px 0px;
	}

	.tag.selected {
		outline: 2px solid var(--primary);
	}
	.tag {
		border: none;
		display: flex;
		align-items: center;
		padding: 0.5rem 0.7rem;
		margin: 0.5rem;
		border-radius: 0.75rem;
		background-color: var(--light-gray-1);
		outline: 1px solid var(--light-gray-4);
		color: var(--off-black);
		font-size: 12px;
		transition: transform 0.1s ease; /* transition the transform property */
	}

	.tag-text {
		display: flex;
		align-items: center;
		margin-right: 10px;
	}

	.tag-count {
		margin-left: 0.5rem;
		font-size: 10px;
		color: var(--light-gray-4);
	}

	.tag:hover {
		/* enlarge the tag when it's hovered over */
		transform: scale(1.05);
	}
</style>
