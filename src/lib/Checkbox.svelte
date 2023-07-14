<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	export let option: string = '';
	export let style: string = '';
	export let id: number | null = null;
	export let checked: boolean = false;
	export let disabled = false;

	const dispatch = createEventDispatcher<{
		click: { id: number | null };
		change: { checked: boolean };
	}>();

	const handleClick = () => {
		dispatch('click', { id: id });
	};

	const handleChange = () => {
		dispatch('change', { checked: checked });
	};
</script>

<ul>
	<li>
		<input
			{style}
			id={option}
			type="checkbox"
			bind:checked
			on:click|stopPropagation={handleClick}
			on:change={handleChange}
			class={option}
			{disabled}
		/>
	</li>
</ul>

<style>
	@supports (-webkit-appearance: none) or (-moz-appearance: none) {
		input[type='checkbox'] {
			--active: var(--primary);
			--active-inner: var(--white);
			--border: var(--light-gray-3);
			--border-hover: var(--gray);
			--background: var(--background);
			--disabled: var(--light-gray-3);
			--disabled-inner: var(--gray);
			-webkit-appearance: none;
			-moz-appearance: none;
			appearance: none;
			height: 20px;
			outline: none;
			display: inline-block;
			vertical-align: top;
			position: relative;
			margin: 0;
			cursor: pointer;
			border: 2px solid var(--bc, var(--border));
			background: var(--b, var(--background));
		}

		@supports (-webkit-appearance: none) or (-moz-appearance: none) {
			input[type='checkbox'].mini {
				height: 10px;
				width: 10px;
				border-radius: 2px;
			}
			input[type='checkbox'].mini:after {
				width: 1.5px;
				height: 3.5px;
				left: 1.5px;
				top: 0px;
			}
		}
		input[type='checkbox']:after {
			content: '';
			display: block;
			position: absolute;
			transition: transform var(--d-t, 0.3s) var(--d-t-e, ease), opacity var(--d-o, 0.2s);
		}
		input[type='checkbox']:checked {
			--b: var(--active);
			--bc: var(--active);
			--d-o: 0.3s;
			--d-t: 0.6s;
			--d-t-e: cubic-bezier(0.2, 0.85, 0.32, 1.2);
		}
		input[type='checkbox']:checked:hover {
			--bc: var(--primary-hover);
		}
		input[type='checkbox']:disabled {
			--b: var(--disabled);
			cursor: not-allowed;
			opacity: 0.4;
		}
		input[type='checkbox']:disabled:checked {
			--b: var(--disabled-inner);
			--bc: var(--border);
		}
		input[type='checkbox']:disabled + label {
			cursor: not-allowed;
		}
		input[type='checkbox']:hover:not(:checked):not(:disabled) {
			--bc: var(--border-hover);
		}

		input[type='checkbox'] {
			width: 20px;
		}
		input[type='checkbox']:after {
			opacity: var(--o, 0);
		}
		input[type='checkbox']:checked {
			--o: 1;
		}
		input[type='checkbox'] + label {
			font-size: 14px;
			line-height: 21px;
			font-family: inherit;
			font-weight: 400;
			color: var(--off-black);
			display: inline-block;
			vertical-align: top;
			cursor: pointer;
			margin-left: 4px;
		}

		input[type='checkbox'] {
			border-radius: 4px;
		}

		input[type='checkbox']:after {
			width: 3px;
			height: 7px;
			border: 2px solid var(--active-inner);
			border-top: 0;
			border-left: 0;
			left: 6px;
			top: 3px;
			transform: rotate(var(--r, 20deg));
		}
		input[type='checkbox']:checked {
			--r: 40deg;
		}
	}
	ul {
		padding: 0;
		list-style: none;
	}
	ul li {
		position: relative;
	}
</style>
