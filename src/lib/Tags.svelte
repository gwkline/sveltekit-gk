<script lang="ts">
	import Fa from 'svelte-fa';
	import Button from './Button.svelte';
	import { browser } from '$app/environment';
	import {
		faTimes,
		faTrash,
		faPenToSquare,
		faCheck,
		faPlus,
		faSave
	} from '@fortawesome/free-solid-svg-icons';
	import { onMount, onDestroy, createEventDispatcher } from 'svelte';
	import { slide } from 'svelte/transition';
	import { cubicInOut } from 'svelte/easing';
	import Checkbox from './Checkbox.svelte';

	export let tagsCount: { tag: string; count: number }[] = [];
	export let selectedTags: string[] = [];
	export let checkedItems: number[] = [];

	type AddOrEdit = 'add' | 'edit';
	type AddOrEditState = AddOrEdit | null;
	let showDeleteTasks: boolean = true;
	let addOrEdit: AddOrEditState = null;
	let isEditing = false;
	let isAddingTag = false;
	let editedText = '';
	let newTagText = '';
	const dispatch = createEventDispatcher();

	onMount(() => {
		window.addEventListener('keydown', handleKeydown);

		if (browser) {
			// Listen for mouse click events outside of the tag to stop editing
			window.addEventListener('mousedown', (event: MouseEvent) => {
				const target = event.target as HTMLElement;
				if (isEditing && !target?.classList?.contains('tag-edit-input') && !isAddingTag) {
					saveEditedTags();
				}
			});
		}
	});

	onDestroy(() => {
		window.removeEventListener('keydown', handleKeydown);
		if (browser) {
			// Listen for mouse click events outside of the tag to stop editing
			window.removeEventListener('mousedown', (event: MouseEvent) => {
				const target = event.target as HTMLElement;
				if (isEditing && !target?.classList?.contains('tag-edit-input') && !isAddingTag) {
					saveEditedTags();
				}
			});
		}
	});

	const selectTag = (tag: string) => {
		isAddingTag = false;
		dispatch('selectTag', tag);
	};

	const deleteSelectedTags = () => {
		dispatch('deleteSelectedTags');
	};

	const deleteSelectedTasks = () => {
		dispatch('deleteSelectedTasks');
	};

	const deleteSelectedTasksTags = () => {
		dispatch('deleteSelectedTasksTags');
	};

	const saveEditedTags = () => {
		// Do not proceed with the function if the editedText is empty
		if (editedText.trim() === '') return;

		dispatch('updateTagNames', editedText);

		editedText = '';
		isEditing = false;
	};

	const editTags = () => {
		editedText = '';
		isEditing = true;
	};

	const addAdditionalTag = () => {
		// Do not proceed with the function if the newTagText is empty
		if (newTagText.trim() === '') {
			return;
		}

		dispatch('addAdditionalTag', newTagText);
		newTagText = '';
		isAddingTag = false;
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
		dispatch('addTagToTasks', newTagText);
		newTagText = '';
		isAddingTag = false;
	};
	const saveInput = (event: Event) => {
		const target = event.target as HTMLInputElement; // `target` is an HTMLInputElement
		newTagText = target.value;
	};

	let checkedAll = false;

	const toggleCheckAll = (origin: string) => {
		// Toggle and dispatch based on origin
		if (origin === 'tag') {
			checkedAll = !checkedAll;
		}
		if (checkedAll) {
			dispatch(
				'selectTag',
				tagsCount.map((t) => t.tag)
			);
		} else {
			dispatch('selectTag', []);
		}
	};
</script>

<div
	transition:slide={{ axis: 'y', duration: 1000, delay: 0, easing: cubicInOut }}
	class="container-wrapper"
>
	<div class="selection-info">
		{#if selectedTags.length > 0}
			<button class="clear-all" on:click={editTags}>
				<Fa icon={faPenToSquare} size="sm" />
				Edit selected
			</button>
			<button class="clear-all" on:click={deleteSelectedTags}>
				<Fa icon={faTrash} size="sm" />
				Delete selected tags
			</button>
			{#if showDeleteTasks}
				<button class="clear-all" on:click={deleteSelectedTasks}>
					<Fa icon={faTrash} size="sm" />
					Delete associated tasks
				</button>
			{/if}
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
						/>
						<Button
							icon={faSave}
							size="xs"
							shape="square"
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
						Add tags to selected tags
					</button>
				{/if}
			</div>
		{/if}
	</div>

	<div class="tag-container">
		<button
			class="tag"
			class:selected={checkedAll}
			on:click|stopPropagation={() => toggleCheckAll('tag')}
		>
			<Checkbox mini={true} bind:checked={checkedAll} on:change={() => toggleCheckAll('checkbox')}
			></Checkbox>
		</button>
		{#each tagsCount as { tag, count }}
			<button
				class="tag"
				class:selected={selectedTags.includes(tag)}
				on:click|stopPropagation={() => selectTag(tag)}
			>
				{#if selectedTags.includes(tag) && isEditing}
					<input
						type="text"
						class="tag-edit-input"
						value={editedText}
						on:keydown|preventDefault={(e) => {
							e.key === 'Enter' && saveEditedTags();
						}}
						on:blur={saveEditedTags}
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

	<div class="selection-info">
		{#if checkedItems.length > 0}
			<div class="input-wrapper">
				{#if isAddingTag && addOrEdit === 'add'}
					<div class={isAddingTag ? 'input-container' : 'input-container hidden'}>
						<!-- svelte-ignore a11y-autofocus -->
						<input
							type="text"
							class="tag-add-input"
							placeholder="e.g. 'fresh', '1/9 Handmade''"
							value={newTagText}
							autofocus={true}
							on:input={(e) => {
								saveInput(e);
							}}
							on:keydown={(e) => e.key === 'Enter' && addTagToTasks()}
							on:blur={addTagToTasks}
						/>
						<Button
							icon={faSave}
							size="xs"
							shape="square"
							variant="primary"
							onclick={() => {
								addTagToTasks();
							}}
						/>
						<Button
							icon={faTimes}
							size="xs"
							shape="square"
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
						Add tags to selected items
					</button>
				{/if}
				<button
					class="clear-all"
					on:click={() => {
						deleteSelectedTasksTags();
					}}
				>
					<Fa icon={faTrash} size="sm" />
					Remove tags from selected items
				</button>
			</div>
		{/if}
	</div>
</div>

<style>
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
		gap: 5px;
	}
	.tag-add-input {
		border: 1px solid var(--light-gray-4);
		background-color: inherit;
		color: inherit;
		font-size: inherit;
		width: auto;
		outline: none;
		height: 10px;
		border-radius: 10px;
		padding: 5px 10px;
	}
	.clear-all {
		cursor: pointer;
		border: none;
		font-size: 11px;
		display: inline;
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

	.selection-info > button {
		cursor: pointer;
		font-size: 11px;
		color: var(--off-black);
		display: inline;
	}

	.selection-info > button:hover {
		color: var(--primary);
		text-decoration: underline;
	}

	.tag-container {
		display: flex;
		flex-wrap: wrap;
	}
	.container-wrapper {
		position: relative;
		display: flex;
		flex-direction: column;
	}

	.selection-info {
		position: relative;
		font-size: 12px;
		color: var(--off-black);
		display: flex;
		flex-wrap: wrap;
		white-space: nowrap;
		justify-content: start;

		align-items: center;
		padding: 0px 0px;
	}

	.tag.selected {
		outline: 2px solid var(--primary);
	}
	.tag {
		border: none;
		display: flex;
		align-items: center;
		padding: 0.5rem 0.7rem;
		margin: 0.5rem 0.5rem 0.5rem 0;
		border-radius: 0.75rem;
		background-color: var(--light-gray-1);
		outline: 1px solid var(--light-gray-4);
		color: var(--off-black);
		font-size: 12px;
		transition: transform 0.1s ease;
		cursor: pointer;
	}

	.tag-text {
		display: flex;
		align-items: center;
		margin-right: 10px;
	}

	.tag-count {
		margin-left: 0.5rem;
		font-size: 10px;
		color: var(--gray);
	}

	.tag:hover {
		transform: scale(1.05);
	}
</style>
