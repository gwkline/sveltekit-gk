<script lang="ts">
	import Fa from 'svelte-fa';
	import Button from '$lib/Button.svelte';
	import Input from '$lib/Input.svelte';
	import { faPencil, faCheck, faX } from '@fortawesome/free-solid-svg-icons';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { browser } from '$app/environment';
	import { enhance } from '$app/forms';
	import type { PageData } from './$types';
	import type { WhopMembershipType } from '../../types';

	export let data: PageData;

	let CLIENT_ID = data.clientId;
	let REDIRECT_URI = data.redirectUri;
	let isEditing: boolean[];
	let nicknameInput: string;
	let memberships: WhopMembershipType[] = [];
	let loggedIn = false;

	const handleNameChange = (mem_id: string, name: string, index: number) => {
		isEditing[index] = false;
		let membership = memberships.find((mem) => mem.id === mem_id);
		if (!membership) return;

		membership.metadata = { title: name };
	};

	function handleSubmit(memId: string, index: number) {
		handleNameChange(memId, nicknameInput, index);

		// submit the form
		const form = document.getElementById('nicknameForm') as HTMLFormElement;
		if (form) form.submit();
	}

	const findMemberships = async (): Promise<void> => {
		const response = await fetch('https://api.whop.com/api/v2/me/memberships', {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${localStorage.getItem('whopAccessToken')}`
			}
		});

		if (response.status !== 200) {
			localStorage.removeItem('whopAccessToken');

			const refreshToken = localStorage.getItem('whopRefreshToken');
			if (!refreshToken) return;
			localStorage.removeItem('whopRefreshToken');
			goto(`/dashboard?token=${refreshToken}`);
		}

		const parsed_response = await response.json();
		memberships = parsed_response.data;
	};

	// if we have an existing token, we can get memberships
	if (browser && localStorage.getItem('whopAccessToken')) {
		findMemberships();
	}

	// if they've just logged in, we can get memberships
	if (data.access_token && browser) {
		localStorage.setItem('whopAccessToken', data.access_token);
		localStorage.setItem('whopRefreshToken', data.refresh_token);

		findMemberships();
		goto('/dashboard');
	}

	// they're logged in if they have a token
	$: loggedIn = !!data.access_token || (browser && !!localStorage.getItem('whopAccessToken'));
	$: isEditing = new Array(memberships.length).fill(false);
</script>

<h1>Dashboard</h1>
<div style="margin-bottom: 50px">
	{#if memberships.length === 0 && loggedIn}
		<p>You have no memberships</p>
	{:else if loggedIn}
		<p>You have {memberships.length} membership{memberships.length > 1 ? 's' : ''}</p>
	{:else}
		<a href={`https://whop.com/oauth?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}`}>
			<button>Login with Whop</button>
		</a>
	{/if}
</div>

<div class="memberships-container">
	{#each memberships as mem, index}
		<div class="membership-row">
			<div class="column">
				<p><strong>Title:</strong> {mem.metadata.title || mem.id}</p>
				<p><strong>Key:</strong> {mem.license_key}</p>
				<p><strong>Status:</strong> {mem.status}</p>
				<p><strong>Valid:</strong> {mem.valid ? 'Yes' : 'No'}</p>
			</div>
			<div>
				{#if !isEditing[index]}
					<Button icon={faPencil} onclick={() => (isEditing[index] = true)}>Edit Name</Button>
				{/if}

				{#if isEditing[index]}
					<div class="form-container">
						<form
							method="post"
							class="form-container"
							id="nicknameForm"
							action="/dashboard?/setNickname&nickname={nicknameInput}&memId={mem.id}&redirectTo={$page
								.url.pathname}"
							use:enhance={({ action }) => {}}
							on:submit|preventDefault
						>
							<Input
								placeholder={'Key Nickname'}
								bind:value={nicknameInput}
								on:blur={() => {
									handleSubmit(mem.id, index);
								}}
							/>
						</form>
						<Button icon={faX} onclick={() => (isEditing[index] = false)} />
					</div>
				{/if}
			</div>
		</div>
	{/each}
</div>

<style>
	.memberships-container {
		overflow: scroll;
	}

	.form-container {
		display: flex;
		flex-direction: row;
		align-items: center;
		justify-content: space-between;
	}
	.membership-row {
		display: flex;
		flex-direction: row;
		align-items: center;
		justify-content: space-between;
		padding: 20px;
		background-color: var(--light-gray-1);
		border-radius: 10px;
		margin-bottom: 20px;
	}

	.membership-row p {
		margin: 0;
		padding: 0;
	}

	.column {
		display: flex;
		flex-direction: column;
		justify-content: center;
	}
</style>
