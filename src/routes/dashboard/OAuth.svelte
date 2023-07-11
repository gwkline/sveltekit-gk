<script lang="ts">
	import { onMount } from 'svelte';

	let CLIENT_ID = 'rHqFkSnE6NU1_KUgXOKGexO2Xm8_OE3q_pDu8VCS_Mg';
	let CLIENT_SECRET = 'p9CPo1coX4_x0h38kYL5HKYqyvw3xdExymOOPGdngpI';
	let REDIRECT_URI = 'https://svelte-gk.herokuapp.com/callback/auth';

	async function getCode() {
		console.log(window.location.href.split('code=')[1]);
		let response = await fetch('https://data.whop.com/oauth/token', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				code: window.location.href.split('code=')[1],
				client_id: CLIENT_ID,
				client_secret: CLIENT_SECRET,
				grant_type: 'authorization_code'
			})
		});

		let parsed_response = await response.json();
		let access_token = parsed_response.access_token;
		localStorage.setItem('access_token', access_token);
		location.replace(`/dashboard`);
	}

	let url = ``;

	onMount(() => (url = window.location.href));
	getCode();
</script>

<p>
	Redirecting, please click <a href="/dashboard">here</a> if you are not redirected.
</p>

<style>
</style>
