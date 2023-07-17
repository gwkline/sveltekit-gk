<div class="home">
	<h1>Welcome to Keyplank</h1>
	<p>
		This is an experimental UI design for automated retail software. While this is meant to be
		hooked up to the backend of a bot, I've added some seed data so you can get a feel for how the
		components are designed.
	</p>
	<p>
		The current implementation is built on Sveltekit with Typescript. If you're interested in seeing
		how this was built, you can check out the source code here:
		<a href="https://github.com/gwkline/sveltekit-gk" target="_blank" rel="noopener noreferrer"
			>https://github.com/gwkline/sveltekit-gk</a
		>. This was done without a designer, and with almost zero prior knowledge of Svelte/Sveltekit,
		so I'd love to hear if you have any feedback or input. Feel free to reach out on Discord: gkline
	</p>
	<p>To get started, head over to the main <a href="/checkout">Checkout Tasks</a> page</p>
</div>

<style>
	.home {
		padding: 1em;
		max-width: 900px;
		margin: 0 auto;
	}

	h1 {
		color: var(--off-black);
		font-size: 2em;
		text-align: center;
		margin-bottom: 1em;
	}

	p {
		color: var(--gray);
		font-size: 1.2em;
		line-height: 1.5;
		margin-bottom: 1em;
	}

	a {
		color: #0077cc;
	}
</style>
