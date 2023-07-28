<script lang="ts">
	type OrientationType = 'horizontal' | 'vertical';
	export let orientation: OrientationType = 'horizontal';
	export let options: Array<{ label: string; value: string }> = [];
	export let selectedValue: string;
</script>

<form class={orientation}>
	{#each options as option (option.label)}
		<label style="margin-bottom: 10px;">
			<input type="radio" bind:group={selectedValue} value={option.value} />
			<span>{option.label}</span>
		</label>
	{/each}
</form>

<style>
	form.horizontal,
	form.vertical {
		display: flex;
		flex-wrap: wrap;
	}

	.horizontal {
		flex-direction: row;
	}

	.vertical {
		flex-direction: column;
	}

	span {
		font-family: inherit;
	}

	label {
		display: flex;
		font-family: inherit;
		cursor: pointer;
		position: relative;
		overflow: hidden;
		color: var(--off-black);
	}
	label input {
		position: absolute;
		left: -9999px;
	}
	label input:checked + span {
		background-color: var(--light-gray-2);
	}
	label input:checked + span:before {
		box-shadow: inset 0 0 0 0.4375em var(--primary);
	}
	label span {
		display: flex;
		align-items: center;
		padding: 0.3em 0.75em 0.3em 0.3em;
		border-radius: 99em;
		transition: 0.25s ease;
	}
	label span:hover {
		background-color: var(--light-gray-2);
	}
	label span:before {
		display: flex;
		flex-shrink: 0;
		content: '';
		width: 1.3em;
		height: 1.3em;
		border-radius: 50%;
		margin-right: 0.375em;
		transition: 0.25s ease;
		box-shadow: inset 0 0 0 0.125em var(--light-gray-3);
	}
</style>
