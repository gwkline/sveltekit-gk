<script lang="ts">
	export let variant = '';
	export let checked = false;
	export let style = '';
</script>

<div class="container" {style}>
	<label class="switch shadow">
		<input type="checkbox" class="" bind:checked {...$$props} />
		<span class="slider round {variant}" />
	</label>
</div>

<style>
	/* The switch - the box around the slider */
	.switch {
		position: relative;
		display: inline-block;
		width: 44px;
		height: 24px;
	}

	/* Hide default HTML checkbox */
	.switch input {
		opacity: 0;
		width: 0;
		height: 0;
	}

	/* The slider */
	.slider {
		position: absolute;
		cursor: pointer;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background-color: var(--light-gray-3);
		outline: 1px solid var(--light-gray-3);
		box-shadow:
			var(--shadow-1) 0px 0px 0px 0px,
			var(--shadow-2) 0px 1px 1px 0px,
			var(--shadow-3) 0px 0px 0px 1px,
			var(--shadow-4) 0px 2px 5px 0px;
		transition: all 0.15s ease;
	}

	.slider:hover {
		outline: 1px solid var(--off-black);
		box-shadow:
			var(--shadow-1) 0px 0px 0px 0px,
			var(--shadow-2) 0px 1px 1px 0px,
			var(--shadow-3) 0px 2px 5px 0px,
			var(--shadow-4) 0px 2px 5px 0px;
	}

	.slider:before {
		position: absolute;
		content: '';
		height: 18px;
		width: 18px;
		left: 3px;
		bottom: 3px;
		background-color: white;
		-webkit-transition: 0.4s;
		transition: 0.4s;
		outline: 1px solid var(--white);
	}

	.slider:before:hover {
		outline: 1px solid var(--off-black);
	}

	input:checked + .slider {
		background-color: var(--primary);
	}

	input:checked + .slider.success {
		background-color: var(--success-green);
	}

	input:checked + .slider:before {
		-webkit-transform: translateX(20px);
		-ms-transform: translateX(20px);
		transform: translateX(20px);
	}

	/* Rounded sliders */
	.slider.round {
		border-radius: 41px;
	}

	.slider.round:before {
		border-radius: 50%;
	}
</style>
