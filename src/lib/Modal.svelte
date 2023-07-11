<script lang="ts">
	import { createEventDispatcher, onDestroy } from 'svelte';

	const dispatch = createEventDispatcher<{ close: void }>();
	const close = () => dispatch('close');

	let modal: HTMLElement;

	const handle_keydown = (e: KeyboardEvent) => {
		if (e.key === 'Escape') {
			close();
			return;
		}

		if (e.key === 'Tab') {
			// trap focus
			const nodes = modal.querySelectorAll('*');
			const tabbable = Array.from(nodes).filter((n) => (n as HTMLElement).tabIndex >= 0);

			let index = tabbable.indexOf(document.activeElement as HTMLElement);
			if (index === -1 && e.shiftKey) index = 0;

			index += tabbable.length + (e.shiftKey ? -1 : 1);
			index %= tabbable.length;

			(tabbable[index] as HTMLElement).focus();
			e.preventDefault();
		}
	};

	const stopPropagation = (e: MouseEvent | KeyboardEvent) => {
		e.stopPropagation();
	};
</script>

<svelte:window on:keydown={handle_keydown} />

<!-- Added `on:click` and `on:keypress` event listeners -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
<div class="modal-background" on:click={close} on:keypress={close}>
	<!-- Stop propagation of the click event here -->
	<!-- svelte-ignore a11y-click-events-have-key-events -->
	<!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
	<div class="modal" role="dialog" aria-modal="true" bind:this={modal} on:click={stopPropagation}>
		<div class="frame">
			<slot name="modal" />
		</div>
	</div>
</div>

<style>
	.modal-background {
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background: rgba(65, 65, 65, 0.568);
		z-index: 3;
	}

	.modal {
		position: absolute;
		left: 50%;
		top: 400px;
		transform: translate(-50%, -50%);
		z-index: 4;

		display: flex;
		flex-direction: column;
		justify-content: left;
		align-items: center;
		padding: 16px;

		/* background */

		background: var(--background);
		border: 2px solid rgba(0, 0, 0, 0.1);
		border-radius: 8px;

		/* Inside auto layout */

		flex: none;
		order: 0;
		flex-grow: 0;
	}

	.frame {
		/* Auto layout */

		display: flex;
		flex-direction: column;
		align-items: flex-start;
		padding: 10px;
		gap: 16px;

		/* Inside auto layout */
		width: 100%;
		flex: none;
		order: 1;
		flex-grow: 0;
	}
</style>
