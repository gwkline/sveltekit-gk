<script lang="ts">
	import { faCreditCard } from '@fortawesome/free-solid-svg-icons';
	import Fa from 'svelte-fa';

	export let value: string;

	$: cardType = () => {
		return;
	};
</script>

<div class="container">
	<Fa icon={cardType} color="var(--light-gray-4)" />
	<div class="username">
		<span>{value}</span>
		<span class="bottom-text">{value}</span>
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
	.bottom-text {
		display: block;
		font-size: 11px;
		color: #888;
	}
</style>
