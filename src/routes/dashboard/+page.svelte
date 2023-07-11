<script lang="ts">
	import Button from '../../lib/Button.svelte';
	import Input from '../../lib/Input.svelte';
	import { faPencil, faCheck, faX, faRefresh } from '@fortawesome/free-solid-svg-icons';

	let API_KEY = 'gdGWSukT21BUgfp3aRj5O6czZ801PRweea5-oBT5DrQ';
	let CLIENT_ID = 'rHqFkSnE6NU1_KUgXOKGexO2Xm8_OE3q_pDu8VCS_Mg';
	let REDIRECT_URI = 'https://svelte-gk.herokuapp.com/callback/auth';
	let access_token = localStorage.getItem('access_token');

	const findMemberships = async () => {
		try {
			let response = await fetch('https://api.whop.com/api/v2/me/memberships', {
				method: 'GET',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${access_token}`
				}
			});
			let parsed_response = await response.json();
			memberships = parsed_response.data;
			console.log(memberships);
		} catch {
			memberships = [];
		}
	};

	const handleNameChange = async (mem_id, name, index) => {
		showModal[index] = false;

		let metadata = memberships.find((element) => element.id === mem_id).metadata;
		metadata.title = name;
		try {
			await fetch(`https://api.whop.com/api/v2/memberships/${mem_id}`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${API_KEY}`
				},
				body: JSON.stringify({
					metadata
				})
			});
			memberships = memberships;
			value = '';
		} catch {
			console.log('error');
		}
	};

	let showModal = false;
	let memberships = [];
	let value;
	$: memberships, (showModal = new Array(memberships.length).fill(false));
	$: value;
</script>

<h1>Dashboard</h1>
<row style="margin-bottom: 50px">
	<a href={`https://whop.com/oauth?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}`}>
		<Button variant="primary">Login with Whop</Button>
	</a>

	<Button onclick={findMemberships()} icon={faRefresh} />
</row>

{#each memberships as mem, index}
	<row style="margin-bottom: 50px">
		<div class="column" style="margin-right: 50px">
			<p>
				Key: {mem.metadata.title || mem.id}
			</p>
			<div>
				<Input placeholder={mem.license_key} size={'lg'} />
			</div>
		</div>
		<div>
			{mem.valid}
		</div>
		<div>
			<row>
				{#if !showModal[index]}
					<Button icon={faPencil} onclick={() => (showModal[index] = true)}>Edit Name</Button>
				{/if}

				{#if showModal[index]}
					<Input placeholder={'Key Nickname'} bind:value />
					<Button icon={faCheck} onclick={() => handleNameChange(mem.id, value, index)} />
					<Button icon={faX} onclick={() => (showModal[index] = false)} />
				{/if}
			</row>
		</div>
		<div>
			<Button icon={faPencil}>Edit Name</Button>
		</div>
		<div />
	</row>
{/each}

<style>
	row {
		display: flex;
		flex-direction: row;
		align-items: center;
		justify-content: left;
		height: 50px;
	}

	.column {
		display: flex;
		flex-direction: column;
		align-items: left;
		justify-content: center;
	}
</style>
