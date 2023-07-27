<script lang="ts">
	import Tooltip from '$lib/Tooltip.svelte';
	import {
		faAdjust,
		faArchive,
		faHourglass,
		faStar,
		type IconDefinition
	} from '@fortawesome/free-solid-svg-icons';
	import Fa from 'svelte-fa';

	export let value: string;

	function isWithinMonths(dateStr: string, numMonths: number): boolean {
		const date = new Date(dateStr);
		const currentDate = new Date();

		const monthsDiff =
			(currentDate.getFullYear() - date.getFullYear()) * 12 +
			(currentDate.getMonth() - date.getMonth());

		return monthsDiff <= numMonths;
	}

	let icon: IconDefinition;
	$: {
		if (isWithinMonths(value, 3)) {
			icon = faStar;
		} else if (isWithinMonths(value, 6)) {
			icon = faAdjust;
		} else {
			icon = faHourglass;
		}
	}
</script>

<div class="container">
	<Tooltip text="Checkout will use account first/last name">
		<Fa {icon} color="var(--light-gray-4)" />
	</Tooltip>
	<div class="username">
		<span>{value}</span>
	</div>
</div>

<style>
	.container {
		display: flex;
		flex-direction: row;
		align-items: center;
	}
	.username {
		display: flex;
		flex-direction: column;
		margin-left: 10px;
	}
</style>
