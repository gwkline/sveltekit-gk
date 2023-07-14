import {
	WHOP_CLIENT_ID,
	WHOP_CLIENT_SECRET,
	WHOP_API_KEY,
	WHOP_REDIRECT_URI
} from '$env/static/private';
import type { Actions, PageServerLoad } from './$types';

export const actions: Actions = {
	setNickname: async ({ url }) => {
		const nickname = url.searchParams.get('nickname');
		const memId = url.searchParams.get('memId');

		const response = await fetch(`https://api.whop.com/api/v2/memberships/${memId}`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${WHOP_API_KEY}`
			},
			body: JSON.stringify({
				metadata: {
					title: nickname
				}
			})
		});

		if (response.status !== 201) {
			console.log(await response.json());
		}
	}
};

export const load: PageServerLoad = async ({ url }) => {
	try {
		if (url.searchParams.has('code')) {
			return {
				...(await getAccessToken(url.searchParams.get('code') as string)),
				clientId: WHOP_CLIENT_ID,
				redirectUri: WHOP_REDIRECT_URI
			};
		}
		if (url.searchParams.has('token')) {
			return {
				...(await refreshAccessToken(url.searchParams.get('token') as string)),
				clientId: WHOP_CLIENT_ID,
				redirectUri: WHOP_REDIRECT_URI
			};
		}
		return {
			clientId: WHOP_CLIENT_ID,
			redirectUri: WHOP_REDIRECT_URI
		};
	} catch (e) {
		return {
			clientId: WHOP_CLIENT_ID,
			redirectUri: WHOP_REDIRECT_URI
		};
	}
};

type AccessTokenResponse = {
	access_token: string;
	refresh_token: string;
	expires_in: number;
	created_at: number;
};

const getAccessToken = async (code: string): Promise<AccessTokenResponse> => {
	const response = await fetch('https://data.whop.com/oauth/token', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({
			code: code,
			client_id: WHOP_CLIENT_ID,
			client_secret: WHOP_CLIENT_SECRET,
			redirect_uri: WHOP_REDIRECT_URI,
			scope: 'biz_25E4zkWg9jtDbW',
			grant_type: 'authorization_code'
		})
	});
	return await response.json();
};

const refreshAccessToken = async (refresh_token: string): Promise<AccessTokenResponse> => {
	const response = await fetch('https://data.whop.com/oauth/token', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({
			refresh_token: refresh_token,
			client_id: WHOP_CLIENT_ID,
			client_secret: WHOP_CLIENT_SECRET,
			redirect_uri: WHOP_REDIRECT_URI,
			scope: 'biz_25E4zkWg9jtDbW',
			grant_type: 'refresh_token'
		})
	});
	return await response.json();
};
