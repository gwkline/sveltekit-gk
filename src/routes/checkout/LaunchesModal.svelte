<script lang="ts">
	import Button from '$lib/Button.svelte';
	import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
	import { makeRequest } from '../../helpers';
	import type { LaunchType } from '../../types';
	import { createEventDispatcher } from 'svelte';
	import { isLoading } from '../../datastore';

	export let closeModal: () => void;

	let launches: LaunchType[] = [];

	isLoading.set({ launches: true });
	makeRequest('get', 'http://127.0.0.1:23432/nike/launches?region=US', null, (response) => {
		const seen = new Set();
		launches = response.data.filter((el: LaunchType) => {
			const duplicate = seen.has(el.product_id);
			seen.add(el.product_id);
			return !duplicate;
		});

		launches.sort((a: LaunchType, b: LaunchType) => {
			return Date.parse(a.release_time) - Date.parse(b.release_time);
		});
		isLoading.set({ launches: false });
	});

	const dispatch = createEventDispatcher();
	const selectProduct = (launch: LaunchType) => {
		dispatch('productSelected', launch);
	};

	const dateString = (date: string) => {
		let parsedDate = Date.parse(date);

		let full = new Date(parsedDate);
		let hours = full.getHours();
		let minutes = full.getMinutes();

		let amOrPm = hours >= 12 ? 'pm' : 'am';

		hours = hours % 12;

		return `${date.split(' ')[0]} - ${hours}:${minutes == 0 ? '00' : minutes} ${amOrPm}`;
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
	<h5 style="margin-bottom: 20px;">Upcoming Launches</h5>
</div>
{#if $isLoading['launches']}
	<p>Loading...</p>
{:else if launches.length === 0}
	<p>No upcoming launches</p>
{:else}
	<p>Click on a product to select it</p>
{/if}
<div class="products-container">
	{#each launches as launch (launch.product_id)}
		<button class="product" on:click={() => selectProduct(launch)}>
			<a href={launch.uri}>
				<img src={launch.image_url} alt={launch.name} />
			</a>
			<div class="product-info">
				<h5>{launch.name}</h5>
				<p>
					Style Code: {launch.style_code} - Available Sizes: {launch.allowed_sizes[0]}-{launch
						.allowed_sizes[launch.allowed_sizes.length - 1]}
				</p>
				<p>Release Date: {dateString(launch.release_time)}</p>
				<p />
			</div>
		</button>
	{/each}
</div>

<style>
	p {
		margin: 5px 0;
	}
	.product-info {
		display: flex;
		flex-direction: column;
		justify-content: center;
		margin-left: 20px;
		width: calc(100% - 100px);
	}

	.products-container {
		display: flex;
		flex-wrap: wrap;
		justify-content: space-between;
		overflow-y: auto;
		height: 500px;
		margin: 0 10px;
		padding: 10px;
	}

	.product {
		align-items: center;
		background-color: inherit;
		align-items: center;
		color: var(--off-black);
		margin-bottom: 10px;
		padding: 5px;
		display: flex;
		flex-direction: row;
		border-radius: 20px;
		width: 100%;
		height: 120px;
		border: none;
		outline: 1px solid var(--off-black);
	}

	.product img {
		width: 100px;
		height: auto;
		margin-right: 20px;
	}
	.title-row {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 20px;
	}

	h5 {
		margin: 10px 0;
	}
</style>
