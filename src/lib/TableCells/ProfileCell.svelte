<script lang="ts">
	export let profileName: string;
	export let profileTags = '';
</script>

<div>
	<span>{profileName}</span>
	<span class="bottom-text">{profileTags}</span>
</div>

<style>
	.bottom-text {
		display: block;
		font-size: 11px;
		color: #888;
	}
</style>
