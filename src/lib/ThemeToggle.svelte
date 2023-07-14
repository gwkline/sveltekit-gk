<script lang="ts">
	import { faCircleHalfStroke } from '@fortawesome/free-solid-svg-icons';
	import { enhance } from '$app/forms';
	import { page } from '$app/stores';
	import Fa from 'svelte-fa';
</script>

<form
	method="POST"
	use:enhance={({ action }) => {
		const theme = document.documentElement.getAttribute('color-theme');

		if (theme === 'dark') {
			document.documentElement.setAttribute('color-theme', 'light');
		} else {
			document.documentElement.setAttribute('color-theme', 'dark');
		}
	}}
>
	<div class="container">
		<button formaction="/?/setTheme&redirectTo={$page.url.pathname}">
			<Fa icon={faCircleHalfStroke} />
		</button>
	</div>
</form>

<style>
	button {
		height: 40px;
		width: 40px;
		border-radius: 100%;
		border: none;
		color: var(--background);
		background: var(--off-black);
	}
	div {
		z-index: 100;
		position: fixed;
		right: 10px;
		bottom: 10px;
	}
</style>
