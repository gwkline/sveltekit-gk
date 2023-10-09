<script lang="ts">
	import Search from '$lib/Search.svelte';
	import Input from '$lib/Input.svelte';

	let sizes = ['sm', 'md', 'lg'];
	let variants = ['', 'valid', 'invalid', 'noOutline', 'disabled'];
</script>

<main>
	<row style="margin-bottom: 20px; margin-top: 50px">
		<Search size="sm" />

		<div style="margin-right: 20px;" />
		<Search size="md" />
		<div style="margin-right: 20px;" />
		<Search size="lg" />
	</row>
	<row style="margin-top: 0px;">
		<div style="margin-bottom: 20px">
			<column>
				{#each variants as variant}
					<row style="margin-top: 5px;">
						{#each sizes as size}
							<div style="margin-right: 20px; margin-top: 10px">
								<Input {variant} {size} placeholder="Search for..." />
							</div>
						{/each}
					</row>
				{/each}
			</column>
		</div>
	</row>
	<row>
		<row>
			<div style="margin-bottom: 20px">
				<row>
					{#each variants as variant}
						<row>
							<div style="margin-right: 20px; margin-top: 10px">
								<Input {variant} type="paragraph" placeholder="Search for..." />
							</div>
						</row>
					{/each}
				</row>
			</div>
		</row>
	</row>
</main>

<style>
	row {
		display: flex;
		flex-direction: row;
		align-items: center;
		justify-content: center;
	}

	column {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
	}
</style>
