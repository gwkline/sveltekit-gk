import axios, { AxiosError, type AxiosResponse } from 'axios';
import type { WhopMembershipType } from './types';
import { goto } from '$app/navigation';
import { browser } from '$app/environment';
import { validAccessToken, accessTokenExpiration } from './datastore';
import { get } from 'svelte/store';

export const makeRequest = (
	method: string,
	url: string,
	data: object | null = null,
	callback: (response: AxiosResponse) => void = (response) => {
		if (response.status > 399) {
			console.log('Request Error:', response.status, response.data);
		}
	},
	headers = {}
) => {
	const defaultHeaders = {
		accept: '*/*',
		'accept-language': 'en-US,en;q=0.9',
		'content-type': 'text/plain;charset=UTF-8'
	};

	if (browser) {
		if (get(validAccessToken) == false || get(accessTokenExpiration) < Date.now() / 1000) {
			console.log('Access token missing or expired, skipping request: ', url);
			return Promise.resolve();
		} else {
			console.log('Access token valid, making request: ', url);
		}
	}

	return axios
		.request({
			method: method,
			url: url,
			headers: { ...defaultHeaders, ...headers },
			data: data
		})
		.then((response) => {
			if (callback) {
				callback(response);
			}
			return response;
		})
		.catch((error: AxiosError) => {
			console.log('Request Error:', error.message, error.name, error.code);
			return error;
		});
};

export const findMemberships = async (): Promise<WhopMembershipType[]> => {
	const token = localStorage.getItem('whopAccessToken');
	if (!token) {
		return [];
	}

	const response = await fetch('https://api.whop.com/api/v2/me/memberships', {
		method: 'GET',
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${token}`
		}
	});

	if (response.status !== 200) {
		localStorage.removeItem('whopAccessToken');
		const refreshToken = localStorage.getItem('whopRefreshToken');
		if (!refreshToken) {
			return [];
		}
		localStorage.removeItem('whopRefreshToken');
		goto(`/dashboard?token=${refreshToken}`);
	}

	const parsed_response = await response.json();
	return parsed_response.data as WhopMembershipType[];
};
