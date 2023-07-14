<script lang="ts">
	import Button from '$lib/Button.svelte';
	import Input from '$lib/Input.svelte';
	import Radio from '$lib/Radio.svelte';
	import { faArrowLeft, faPencil, faPlus, faTrash } from '@fortawesome/free-solid-svg-icons';
	import { sizePresets } from '../../datastore';
	import { createEventDispatcher } from 'svelte';

	export let closeModal: () => void;

	let addingNewPreset = false;
	let editingPresetName: string | null = null;
	let newPresetName = '';
	let newPresetSizes = '';

	let selectedSizeType: SizeType = 'mens';
	let radioOptions: RadioOptionsType[] = [
		{ label: "Men's", value: 'mens' },
		{ label: "Women's", value: 'womens' },
		{ label: 'Youth', value: 'youth' },
		{ label: 'Preschool', value: 'preschool' },
		{ label: 'Toddler', value: 'toddler' }
	];

	type SizeType = 'mens' | 'womens' | 'youth' | 'preschool' | 'toddler';
	type RadioOptionsType = {
		label: string;
		value: SizeType;
	};

	const dispatch = createEventDispatcher();
	const selectPreset = (category: SizeType, preset: string) => {
		let sizes: string[] = $sizePresets[category][preset];

		dispatch('sizeSelected', sizes.join(','));
	};

	const handleEditPreset = (presetName: string, event: MouseEvent) => {
		event.stopPropagation();
		newPresetName = presetName;
		newPresetSizes = $sizePresets[selectedSizeType][presetName].join(',');
		editingPresetName = presetName;
		addingNewPreset = true;
	};

	const handleDeletePreset = (presetName: string, event: MouseEvent) => {
		event.stopPropagation();
		sizePresets.update((currentPresets) => {
			delete currentPresets[selectedSizeType][presetName];
			return currentPresets;
		});
	};

	//Todo: Error state
	const handleSaveNewPreset = () => {
		if (selectedSizeType === 'mens' && !newPresetSizes.match(/^[0-9,\.]*$/)) {
			return;
		} else if (selectedSizeType === 'womens' && !newPresetSizes.match(/^[0-9,\.]*$/)) {
			return;
		} else if (selectedSizeType === 'youth' && !newPresetSizes.match(/^[0-9,\.Y]*$/)) {
			return;
		} else if (selectedSizeType === 'preschool' && !newPresetSizes.match(/^[0-9,\.CY]*$/)) {
			return;
		} else if (selectedSizeType === 'toddler' && !newPresetSizes.match(/^[0-9,\.C]*$/)) {
			return;
		}

		let sizes = newPresetSizes.split(',');
		if (!selectedSizeType || !newPresetName || !sizes) {
			addingNewPreset = false;
			return;
		}

		sizePresets.update((currentPresets) => {
			if (editingPresetName && editingPresetName !== newPresetName) {
				delete currentPresets[selectedSizeType][editingPresetName];
			}
			if (!currentPresets[selectedSizeType]) {
				currentPresets[selectedSizeType] = {};
			}
			currentPresets[selectedSizeType][newPresetName] = sizes;
			return currentPresets;
		});

		editingPresetName = null;
		addingNewPreset = false;
	};
</script>

<div class="title-row">
	<Button
		style="margin-bottom: 20px;"
		icon={faArrowLeft}
		onclick={() => {
			closeModal();
		}}>Back</Button
	>
	<h5 style="margin-bottom: 20px;">Size Presets</h5>
</div>
<div class="presets-container">
	<div>
		<div class="radio-container">
			<Radio
				bind:options={radioOptions}
				bind:selectedValue={selectedSizeType}
				orientation="horizontal"
			/>
		</div>

		<div class="new-preset">
			<div class="new-preset-row">
				{#if addingNewPreset}
					<div class="row">
						<Input placeholder="Preset Name" bind:value={newPresetName} style="width: 120px" />
						<Input placeholder="Sizes" bind:value={newPresetSizes} style="width: 240px;" />
					</div>
					<div class="row button-row">
						<Button
							style="margin-left: 5px;"
							onclick={() => {
								addingNewPreset = false;
							}}>Cancel</Button
						>
						<Button onclick={handleSaveNewPreset}>Save</Button>
					</div>
				{:else}
					<h6>
						{radioOptions.find((option) => option.value === selectedSizeType)?.label ||
							'Unknown Size Option'}
					</h6>
					<Button
						icon={faPlus}
						onclick={() => {
							addingNewPreset = true;
						}}>New Preset</Button
					>
				{/if}
			</div>
		</div>
	</div>

	<div class="preset-options">
		{#each Object.keys($sizePresets[selectedSizeType]) as preset (preset)}
			<button class="preset" on:click={() => selectPreset(selectedSizeType, preset)}>
				<div class="preset-title">
					<p>{preset}</p>
				</div>
				<p class="preset-body">{$sizePresets[selectedSizeType][preset].join(', ')}</p>
				<div>
					<Button icon={faPencil} size="sm" onclick={(e) => handleEditPreset(preset, e)} />
					<Button icon={faTrash} size="sm" onclick={(e) => handleDeletePreset(preset, e)} />
				</div>
			</button>
		{/each}
	</div>
</div>

<style>
	.radio-container {
		margin-left: auto;
		display: flex;
		flex-direction: row;
		align-items: center;
		justify-content: center;
		margin: 20px 0 10px 0;
	}

	.preset-options {
		height: 350px;
		overflow-y: scroll;
		padding: 0 10px;
	}

	.preset-title {
		width: 200px;
		justify-content: start;
		display: flex;
		align-items: center;
	}

	.preset-body {
		width: 300px;
	}
	.new-preset {
		display: flex;
		flex-direction: column;
		align-items: center; /* Vertically center items */
		justify-content: space-between; /* Horizontally center items */
		margin: 10px 0;
	}

	.row {
		flex: 1;
		display: flex;
		justify-content: space-between;
		align-items: center;
		justify-content: start;
	}

	.new-preset > div {
		width: 100%;
		display: flex;
		align-items: center; /* Vertically center items */
		justify-content: space-between; /* Horizontally center items */
	}

	.new-preset-row {
		display: flex;
		flex-direction: row;
		justify-content: start;
		align-content: center;
		height: 50px;
	}

	.presets-container {
		max-height: 500px;
		width: 100%;
	}
	.preset {
		display: flex;
		width: 100%;
		justify-content: space-between;
		background-color: inherit;
		cursor: pointer;
		color: var(--off-black);
		padding: 10px;
		border: none;
		outline: 1px solid var(--light-gray-2);
		border-radius: 20px;
		margin: 5px 0;
		align-items: center;
	}
	.preset:hover {
		background-color: var(--light-gray-1);
	}

	.title-row {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}
	h5 {
		margin: 0;
	}

	h6 {
		margin: 20px 0;
	}
</style>
