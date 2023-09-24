<script lang="ts">
	import { createEventDispatcher } from 'svelte';

	const dispatch = createEventDispatcher<{ close: void }>();
	const close = () => {
		dispatch('close');
	};

	let modal: HTMLElement;

	const handleKeydown = (e: KeyboardEvent) => {
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
</script>

<svelte:window on:keydown={handleKeydown} />

<div class="modal-background">
	<button class="background-button" aria-label="Close modal" on:click={close} />
	<div class="modal" role="dialog" aria-modal="true" bind:this={modal}>
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
		z-index: 4;
	}

	.background-button {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		border: none;
		background: transparent;
		z-index: 5;
	}

	.modal {
		position: absolute;
		left: 50%;
		top: 50%;
		transform: translate(-50%, -50%);
		z-index: 6;
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		padding: 16px;
		background: var(--background);
		border: 2px solid rgba(0, 0, 0, 0.1);
		border-radius: 8px;

		flex: none;
		order: 0;
		flex-grow: 0;
	}

	.frame {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		width: 100%;
		flex: none;
		order: 1;
		flex-grow: 0;
	}
</style>
