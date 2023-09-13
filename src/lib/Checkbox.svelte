<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	export let option: string = '';
	export let style: string = '';
	export let checked: boolean = false;
	export let disabled = false;
	export let mini = false;
	export let shadow = true;

	const dispatch = createEventDispatcher<{
		click: { id: number | null };
		change: { checked: boolean };
	}>();

	const handleChange = () => {
		dispatch('change', { checked: checked });
	};

	const generateClassString = () => {
		let classString = '';
		if (mini) {
			classString += 'mini';
		}
		if (shadow) {
			classString += ' shadow';
		}
		return classString;
	};
</script>

<ul>
	<li>
		<input
			{style}
			id={option}
			type="checkbox"
			bind:checked
			on:click|stopPropagation
			on:change={handleChange}
			class={generateClassString()}
			{disabled}
		/>
	</li>
</ul>

<style>
	@supports (-webkit-appearance: none) or (-moz-appearance: none) {
		input {
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
			outline: 1px solid var(--bc, var(--light-gray-3));
			background: var(--b, var(--background));
		}

		input:after {
			content: '';
			display: block;
			position: absolute;
			transition:
				transform var(--d-t, 0.3s) var(--d-t-e, ease),
				opacity var(--d-o, 0.2s);
		}

		input.mini {
			height: 10px;
			width: 10px;
			border-radius: 2px;
		}
		input.mini:after {
			width: 1.5px;
			height: 3.5px;
			left: 3px;
			top: 1.5px;
		}

		input:checked {
			--b: var(--primary);
			--bc: var(--primary);
			--d-o: 0.3s;
			--d-t: 0.6s;
			--d-t-e: cubic-bezier(0.2, 0.85, 0.32, 1.2);
		}
		input:checked:hover {
			--bc: var(--off-black);
		}
		input:disabled {
			--b: var(--light-gray-3);
			cursor: not-allowed;
			opacity: 0.4;
		}
		input:disabled:checked {
			--b: var(--gray);
			--bc: var(--light-gray-3);
		}
		input:disabled + label {
			cursor: not-allowed;
		}
		input:hover:not(:checked):not(:disabled) {
			--bc: var(--gray);
		}

		input {
			width: 20px;
		}
		input:after {
			opacity: var(--o, 0);
		}
		input:checked {
			--o: 1;
		}
		input + label {
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

		input {
			border-radius: 4px;
		}

		input:after {
			width: 3px;
			height: 7px;
			border: 2px solid var(--white);
			border-top: 0;
			border-left: 0;
			left: 7px;
			top: 5px;
			transform: rotate(var(--r, 20deg));
		}
		input:checked {
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

	.shadow {
		box-shadow:
			var(--shadow-1) 0px 0px 0px 0px,
			var(--shadow-1) 0px 0px 0px 0px,
			var(--shadow-2) 0px 1px 1px 0px,
			var(--shadow-3) 0px 0px 0px 1px,
			var(--shadow-1) 0px 0px 0px 0px,
			var(--shadow-1) 0px 0px 0px 0px,
			var(--shadow-4) 0px 2px 5px 0px;
		transition: all 0.15s ease;
	}

	.shadow:hover {
		box-shadow:
			var(--shadow-1) 0px 0px 0px 0px,
			var(--shadow-1) 0px 0px 0px 0px,
			var(--shadow-2) 0px 1px 1px 0px,
			var(--shadow-4) 0px 2px 5px 0px,
			var(--shadow-4) 0px 2px 5px 0px;
	}
</style>
