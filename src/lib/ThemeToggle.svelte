<script lang="ts">
	import { faCircleHalfStroke } from '@fortawesome/free-solid-svg-icons';
	import { colorTheme } from '../datastore';
	import Button from './Button.svelte';
	import { browser } from '$app/environment';
	let icon = faCircleHalfStroke;

	export let toggle = () => {
		if (browser) {
			if ($colorTheme === 'light') {
				// light theme has been selected
				document.body.removeAttribute('color-theme');
				$colorTheme = 'dark';
				// save theme selection
			} else {
				document.body.setAttribute('color-theme', 'light');
				$colorTheme = 'light';
				// reset theme selection
			}
		}
	};

	const initTheme = () => {
		$colorTheme === 'light'
			? document.body.setAttribute('color-theme', 'light')
			: document.body.removeAttribute('color-theme');
	};

	if (browser) {
		initTheme();
	}
</script>

<div class="container">
	<Button
		onclick={toggle}
		variant={'default alternate'}
		status={'active'}
		size={'lg'}
		outline={'outline'}
		{icon}
		shape={'circle'}
	/>
</div>

<style>
	div {
		z-index: 100;
		position: fixed;
		right: 10px;
		bottom: 10px;
	}
</style>
