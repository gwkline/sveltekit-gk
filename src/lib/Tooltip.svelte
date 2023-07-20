<script lang="ts">
	export let text = '';
</script>

<div class="tooltip"><slot /><span class="tooltip-text">{text}</span></div>

<style>
	.tooltip {
		position: relative;
		display: inline-block;
	}

	/* Tooltip text */
	.tooltip .tooltip-text {
		visibility: hidden;
		width: 120px;
		background-color: black;
		color: #fff;
		text-align: center;
		padding: 5px 0;
		border-radius: 6px;
		position: absolute;
		overflow: show !important;
	}

	.tooltip:hover .tooltip-text {
		visibility: visible;
	}
</style>
