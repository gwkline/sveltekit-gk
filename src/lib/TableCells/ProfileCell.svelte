<script lang="ts">
	export let profileName: string;
	export let profileTags = '';
</script>

<div>
	<span>{profileName}</span>
	<span class="sizeValue">{profileTags}</span>
</div>

<style>
	.sizeValue {
		display: block;
		font-size: 11px;
		color: #888;
	}
</style>
