<script lang="ts">
	import Tooltip from '$lib/Tooltip.svelte';
	import { faCreditCard } from '@fortawesome/free-solid-svg-icons';
	import Fa from 'svelte-fa';
	import { privacy } from '../../datastore';

	export let profileName: string;
	export let profileTags = '';
</script>

<div class="username {$privacy ? 'blur' : ''}">
	<span>{profileName}</span>
	<span class="bottom-text">{profileTags}</span>
</div>

<style>
	.username {
		display: flex;
		flex-direction: column;
	}
	.blur {
		filter: blur(4px);
	}
	.bottom-text {
		display: block;
		font-size: 11px;
		color: #888;
	}
</style>
