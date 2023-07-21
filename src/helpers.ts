import axios, { AxiosError, type AxiosResponse } from 'axios';
import type {
	Account,
	Settings,
	ShortAccount,
	SortState,
	Task,
	WhopMembershipType,
	SettingsKeys
} from './types';
import { goto } from '$app/navigation';
import { browser } from '$app/environment';
import {
	validAccessToken,
	accessTokenExpiration,
	accessDenied,
	networkError,
	settings,
	verboseTasks,
	schedules,
	verboseActivityTasks,
	accounts
} from './datastore';
import { get } from 'svelte/store';
import {
	faPause,
	faClock,
	faHourglassHalf,
	faRunning,
	faX,
	faClover,
	faTrophy,
	faCheck
} from '@fortawesome/free-solid-svg-icons';

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
		if (get(validAccessToken) == false || get(accessTokenExpiration) < Date.now()) {
			return Promise.resolve();
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
			accessDenied.set(false);
			networkError.set(false);
			if (callback) {
				callback(response);
			}
			return response;
		})
		.catch((error: AxiosError) => {
			if (error.message === 'Request failed with status code 403') {
				accessDenied.set(true);
			} else if (error.message === 'Network Error') {
				networkError.set(true);
			}
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

export const stateColors = {
	Ready: 'var(--light-gray-3)',
	Queued: 'var(--warning-yellow)',
	Starting: 'var(--primary-hover)',
	Running: 'var(--primary)',
	Waiting: 'purple',
	Error: 'var(--danger-red)',
	Entered: 'var(--success-green)',
	Complete: 'var(--danger-red-hover)',
	Winning: '#00801a'
};

export const stateIconMapping = {
	Ready: faPause,
	Queued: faClock,
	Starting: faHourglassHalf,
	Running: faRunning,
	Waiting: faClock,
	Error: faX,
	Entered: faClover,
	Winning: faTrophy,
	Complete: faCheck
};

export const updateSortState = (e: CustomEvent, currentState: SortState) => {
	let newDirection: 0 | 1 | -1 = 1;
	let newColumn: string | null = e.detail;
	if (currentState.column === e.detail) {
		// Click on same column
		if (currentState.direction === 1) {
			// Change direction if currently ascending
			newDirection = -1;
		} else if (currentState.direction === -1) {
			// Remove sorting if currently descending
			newDirection = 0;
			newColumn = null;
		}
	}
	return { column: newColumn, direction: newDirection };
};

export const updateSelectedTags = (e: CustomEvent, selectedTags: string[]) => {
	const tag: string | string[] = e.detail;
	if (typeof tag === 'string') {
		// if the tag is already selected, remove it from selectedTags
		// otherwise, add it to selectedTags
		const index = selectedTags.indexOf(tag);
		if (index > -1) {
			return selectedTags.filter((t) => t !== tag);
		} else {
			return [...selectedTags, tag];
		}
	} else {
		// user wants to select all tags or no tags
		return tag;
	}
};

export const saveSettings = (settingKey: SettingsKeys, value: string) => {
	settings.update((currentSettings) => {
		let newSettings = currentSettings as Settings;

		newSettings[settingKey] = value ? parseInt(value) : newSettings[settingKey];
		return newSettings;
	});

	const url = 'http://127.0.0.1:23432/settings';
	const method = 'put';

	return makeRequest(method, url, get(settings));
};

export const getSettings = () => {
	makeRequest('get', 'http://127.0.0.1:23432/settings', null, (response) => {
		settings.set(response.data);
	});
};

export const getCheckoutTasks = () => {
	makeRequest('get', 'http://127.0.0.1:23432/tasks?type=checkout', null, (response) => {
		let data = response.data;
		let cleanedData = data.map((task: Task) => {
			task['account'] = cleanAccount(task.account as Account);
			return task;
		});
		verboseTasks.set(cleanedData);
	});
};

export const getSchedules = () => {
	makeRequest('get', 'http://127.0.0.1:23432/schedules', null, (response) => {
		schedules.set(response.data);
	});
};

export const getActivityTasks = () => {
	makeRequest('get', 'http://127.0.0.1:23432/accounts/activity', null, (response) => {
		let data = response.data;
		let cleanedData = data.map((task: Task) => {
			task['account'] = cleanAccount(task.account as Account);
			return task;
		});
		verboseActivityTasks.set(cleanedData);
	});
};

export const getAccounts = () => {
	makeRequest('get', 'http://127.0.0.1:23432/accounts', null, (response) => {
		let rawAccounts: Account[] = response.data;
		let cleanedAccounts = rawAccounts.map((account) => {
			return cleanAccount(account as Account);
		});

		accounts.set(cleanedAccounts);
	});
};

const cleanAccount = (account: Account): ShortAccount => {
	return {
		id: account['id'],
		username: account['username'],
		proxy: account['proxy'],
		tags: account['tags'],
		use_account_name: account['use_account_name'],
		metadata: {
			logged_in: account.metadata?.logged_in ? account.metadata?.logged_in : false
		},
		profile: {
			id: account['profile']['id'],
			name: account['profile']['name'],
			tags: account['profile']['tags'],
			payment: {
				id: account['profile']['payment']['id'],
				tags: account['profile']['payment']['tags'],
				card_name: account['profile']['payment']['card_name'],
				card_type: account['profile']['payment']['card_type']
			}
		}
	};
};

export const removeTags = (
	objects: (Account | ShortAccount | Task)[],
	tags: string[],
	url: string
) => {
	let objectsToUpdate: (Account | ShortAccount | Task)[] = [];

	objects = objects.map((object) => {
		const initialTagsLength = object.tags.length;
		object.tags = object.tags.filter((t) => !tags.includes(t.name));

		if (object.tags.length !== initialTagsLength) {
			objectsToUpdate.push(object);
		}

		return object;
	});

	if (objectsToUpdate.length > 0) {
		makeRequest('put', url, objectsToUpdate);
	}

	return objects;
};

export const addTag = (
	objects: (Account | ShortAccount | Task)[],
	selectedTags: string[],
	newTag: string,
	url: string
) => {
	let objectsToUpdate: (Account | ShortAccount | Task)[] = [];

	objects = objects.map((object) => {
		let objectHasSelectedTag = object.tags.some((t) => selectedTags.includes(t.name));

		// If the "No Tags" tag is being edited and the object has no tags
		if (selectedTags.includes('No Tags') && object.tags.length === 0) {
			// Add the new tag
			object.tags.push({ name: newTag });

			// Add the object to the objectsToUpdate array
			objectsToUpdate.push(object);
		}
		// If the object has a selected tag
		else if (objectHasSelectedTag) {
			// Update the name of the tag
			object.tags = object.tags.map((t) =>
				selectedTags.includes(t.name) ? { ...t, name: newTag } : t
			);

			// Add the object to the objectsToUpdate array
			objectsToUpdate.push(object);
		}

		return object;
	});

	if (objectsToUpdate.length > 0) {
		makeRequest('put', url, objectsToUpdate);
	}

	return objects;
};
