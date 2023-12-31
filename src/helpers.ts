import type {
	Account,
	Settings,
	ShortAccount,
	SortState,
	Task,
	WhopMembershipType,
	SettingsKeys,
	Profile,
	Payment,
	Win,
	NacTask,
	Tag,
	TableRowType,
	HeaderConfigType
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
	accounts,
	payments,
	proxy_lists,
	wins,
	profiles,
	verboseNacTasks,
	server
} from './datastore';
import { get } from 'svelte/store';
import {
	faPause,
	faClock,
	faHourglassHalf,
	faRunning,
	faX,
	faTicket,
	faTrophy,
	faCheck
} from '@fortawesome/free-solid-svg-icons';

export const makeRequest = async (
	method: string,
	url: string,
	data: object | null = null,
	fetchFunc: (
		input: RequestInfo | URL,
		init?: RequestInit | undefined
	) => Promise<Response> = fetch,
	callback: (response: Response) => void = (response) => {
		if (!response.ok) {
			console.log('Request Error:', response.status, response.statusText);
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

	return fetchFunc(url, {
		method: method,
		headers: { ...defaultHeaders, ...headers },
		body: data ? JSON.stringify(data) : null
	})
		.then((response) => {
			accessDenied.set(false);
			networkError.set(false);

			if (callback) {
				callback(response);
			}

			return response;
		})
		.catch((error) => {
			if (error.name === 'AbortError') {
				console.log('Request aborted');
			} else if (error.name === 'TypeError' && error.message === 'Failed to fetch') {
				networkError.set(true);
			} else if (error.name === 'TypeError') {
				console.log('Request Error:', error.message);
			} else {
				console.log('Unexpected Error:', error);
			}

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
	AwaitingResults: 'var(--success-green)',
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
	AwaitingResults: faTicket,
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
		const newSettings = currentSettings as Settings;

		newSettings[settingKey] = value ? parseInt(value) : newSettings[settingKey];
		return newSettings;
	});

	const url = 'http://127.0.0.1:23432/settings';
	const method = 'put';

	return makeRequest(method, url, get(settings));
};

type FetchType = (input: RequestInfo | URL, init?: RequestInit | undefined) => Promise<Response>;
export const getSettings = async (fetch: FetchType) => {
	makeRequest('get', 'http://127.0.0.1:23432/settings', null, fetch, async (response) => {
		settings.set(await response.json());
	});
};

export const getServer = async (fetch: FetchType) => {
	makeRequest('get', 'http://127.0.0.1:23432/server', null, fetch, async (response) => {
		server.set(await response.json());
	});
};

export const getCheckoutTasks = async (fetch: FetchType) => {
	makeRequest(
		'get',
		'http://127.0.0.1:23432/tasks?type=checkout',
		null,
		fetch,
		async (response) => {
			const data = await response.json();
			const cleanedData = data.map((task: Task) => {
				task['account'] = cleanAccount(task.account as Account);
				return task;
			});
			verboseTasks.set(cleanedData);
		}
	);
};

export const getSchedules = async (fetch: FetchType) => {
	makeRequest('get', 'http://127.0.0.1:23432/schedules', null, fetch, async (response) => {
		schedules.set(await response.json());
	});
};

export const getActivityTasks = async (fetch: FetchType) => {
	makeRequest('get', 'http://127.0.0.1:23432/accounts/activity', null, fetch, async (response) => {
		const data = await response.json();
		const cleanedData = data.map((task: Task) => {
			task['account'] = cleanAccount(task.account as Account);
			return task;
		});
		verboseActivityTasks.set(cleanedData);
	});
};

export const getNACTasks = async (fetch: FetchType) => {
	makeRequest(
		'get',
		'http://127.0.0.1:23432/tasks?type=nike_account_creation',
		null,
		fetch,
		async (response) => {
			const data = await response.json();
			const cleanedData = data.map((task: NacTask) => {
				task.proxy_list = {
					id: task.proxy_list.id,
					name: task.proxy_list.name,
					previous_wins: task.proxy_list.previous_wins,
					archived: task.proxy_list.archived
				};

				task['account'] = {} as Account;
				return task;
			});
			verboseNacTasks.set(cleanedData);
		}
	);
};

export const getAccounts = async (fetch: FetchType) => {
	makeRequest('get', 'http://127.0.0.1:23432/accounts', null, fetch, async (response) => {
		const rawAccounts: Account[] = await response.json();
		const cleanedAccounts = rawAccounts.map((account) => {
			return cleanAccount(account as Account);
		});

		accounts.set(cleanedAccounts);
	});
};

export const getProfiles = async (fetch: FetchType) => {
	makeRequest('get', 'http://127.0.0.1:23432/profiles', null, fetch, async (response) => {
		const body = await response.json();
		const profs = body.map((profile: Profile) => {
			if (profile.tags === undefined) {
				profile.tags = [];
			}

			return profile;
		});
		profiles.set(profs);
	});
};

export const getPayments = async (fetch: FetchType) => {
	makeRequest('get', 'http://127.0.0.1:23432/payments', null, fetch, async (response) => {
		const body = await response.json();
		payments.set(
			body.map((payment: Payment) => {
				if (payment.tags === null) {
					payment.tags = [];
				}
				return payment;
			})
		);
	});
};

export const getProxies = async (fetch: FetchType) => {
	makeRequest('get', 'http://127.0.0.1:23432/proxy_lists', null, fetch, async (response) => {
		proxy_lists.set(await response.json());
	});
};

export const getWins = async (fetch: FetchType) => {
	makeRequest('get', 'http://127.0.0.1:23432/wins', null, fetch, async (response) => {
		const body = await response.json();
		let cleanedWins: Win[] = body.map((win: Win) => {
			if (win.tags === null) {
				win.tags = [];
			}
			return win;
		});
		cleanedWins = cleanedWins.sort((a, b) => b.checkout_date.localeCompare(a.checkout_date));

		wins.set(cleanedWins);
	});
};

export const cleanAccount = (account: Account): ShortAccount => {
	return {
		id: account.id,
		profile_id: account.profile_id,
		proxy_list_id: account.proxy_list_id,
		proxy: account.proxy,
		profile: {
			id: account.profile.id,
			name: account.profile.name,
			tags: account.profile.tags,
			payment: {
				id: account.profile.payment.id,
				tags: account.profile.payment.tags,
				card_name: account.profile.payment.card_name,
				card_type: account.profile.payment.card_type
			}
		},
		proxy_list: {
			id: account.proxy_list.id,
			name: account.proxy_list.name,
			previous_wins: account.proxy_list.previous_wins,
			archived: account.proxy_list.archived
		},
		username: account.username,
		password: account.password,
		email: account.email,
		email_password: account.email_password,
		email_type: account.email_type,
		email_provider: account.email_provider,
		login_after_reset: account.login_after_reset,
		send_reset_only: account.send_reset_only,
		email_login_only: account.email_login_only,
		user_provided_password: account.user_provided_password,
		type: account.type,
		updated_at: account.updated_at,
		created_at: account.created_at,
		creation_method: account.creation_method,
		metadata: {
			logged_in: account.metadata?.logged_in ? account.metadata?.logged_in : false
		},
		tags: account.tags,
		previous_wins: account.previous_wins,
		use_account_name: account.use_account_name,
		archived: account.archived,
		status: account.status,
		analytics_properties: account.analytics_properties
	};
};

type HasTag = Account | ShortAccount | Task | Profile | Payment | Win | NacTask;
export const removeTags = (objects: HasTag[], tags: string[], url: string) => {
	const objectsToUpdate: HasTag[] = [];

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

export const addTag = (objects: HasTag[], selectedTags: string[], newTag: string, url: string) => {
	const objectsToUpdate: HasTag[] = [];

	objects = objects.map((object) => {
		const objectHasSelectedTag = object.tags.some((t) => selectedTags.includes(t.name));
		const objectAlreadyHasNewTag = object.tags.some((t) => t.name === newTag);

		if (selectedTags.includes('No Tags') && object.tags.length === 0) {
			if (!objectAlreadyHasNewTag) {
				object.tags.push({ name: newTag });
				objectsToUpdate.push(object);
			}
		} else if (objectHasSelectedTag && !objectAlreadyHasNewTag) {
			object.tags = object.tags.map((t) =>
				selectedTags.includes(t.name) ? { ...t, name: newTag } : t
			);
			objectsToUpdate.push(object);
		}

		return object;
	});

	if (objectsToUpdate.length > 0) {
		makeRequest('put', url, objectsToUpdate);
	}

	return objects;
};

export const cleanDate = (dateString: string) => {
	const date = new Date(dateString);
	return (
		(date.getMonth() + 1).toString().padStart(2, '0') +
		'/' +
		date.getDate().toString().padStart(2, '0') +
		'/' +
		date.getFullYear()
	);
};

export function createAddAdditionalTag<HasTag>(
	updateStore: (updater: (items: HasTag[]) => HasTag[]) => void,
	apiEndpoint: string,
	getSelectedTags: () => string[],
	setSelectedTags: (newTags: string[]) => void,
	getTags: (item: HasTag) => Tag[] = (item) => item.tags
) {
	return (e: CustomEvent) => {
		const newTagText = e.detail;
		const updatedItems: HasTag[] = [];
		const selectedTags = getSelectedTags();

		updateStore((items) => {
			return items.map((item) => {
				const tags = getTags(item);
				const itemHasSelectedTag = tags.some((t: Tag) => selectedTags.includes(t.name));

				if (selectedTags.includes('No Tags') && tags.length === 0) {
					tags.push({ name: newTagText });
					updatedItems.push(item);
				}

				if (itemHasSelectedTag) {
					tags.push({ name: newTagText });
					updatedItems.push(item);
				}

				return item;
			});
		});

		if (updatedItems.length > 0) {
			makeRequest('put', apiEndpoint, updatedItems);
		}
		setSelectedTags([]);
	};
}

export function createHandleChecked(
	getTasks: () => HasTag[],
	getCheckedItemIds: () => number[],
	setCheckedItemIds: (ids: number[]) => void,
	getLastChecked: () => number | null,
	setLastChecked: (id: number | null) => void,
	getSecondLastChecked: () => number | null,
	setSecondLastChecked: (id: number | null) => void,
	getShiftPressed: () => boolean
) {
	return (e: CustomEvent) => {
		const itemId: number = e.detail;

		setSecondLastChecked(getLastChecked());
		setLastChecked(itemId);

		const checkedItemIds = getCheckedItemIds();
		if (checkedItemIds.includes(itemId)) {
			checkedItemIds.splice(checkedItemIds.indexOf(itemId), 1);
		} else {
			checkedItemIds.push(itemId);
		}
		setCheckedItemIds(checkedItemIds);

		if (getShiftPressed() && getLastChecked() === itemId && getSecondLastChecked() !== null) {
			const start = Math.min(getLastChecked() as number, getSecondLastChecked()!);
			const end = Math.max(getLastChecked() as number, getSecondLastChecked()!);
			const tasks = getTasks();

			for (let i = start + 1; i < end; i++) {
				const taskWithThisId = tasks.find((task) => task.id === i);
				if (taskWithThisId && !checkedItemIds.includes(taskWithThisId.id)) {
					checkedItemIds.push(i);
				}
			}
			setCheckedItemIds(checkedItemIds);
		}
	};
}
export function createTableLogic<HasTag>(
	getDataSource: () => HasTag[],
	getSearchValue: () => string,
	getSelectedTags: () => string[],
	getSelectedState: () => string | null,
	setFilteredTasks: (tasks: HasTag[]) => void,
	getHeaderConfig: () => HeaderConfigType<HasTag>,
	setTableIds: (ids: number[]) => void,
	getTableIds: () => number[],
	getSortState: () => SortState,
	setTableData: (data: TableRowType<HasTag>[]) => void,
	setCheckedItemIds: (ids: number[]) => void,
	getCheckedItemIds: () => number[],
	filterState: boolean = false
) {
	const filtered = getDataSource().filter((task) => {
		// Keyword Search
		let keywordMatch = true;
		if (getSearchValue() !== '') {
			keywordMatch = JSON.stringify(task).toLowerCase().includes(getSearchValue().toLowerCase());
		}

		// Tag Filtering
		let tagMatch;
		if (getSelectedTags().includes('No Tags')) {
			tagMatch =
				task.tags.length === 0 ||
				getSelectedTags().some((tag) => task.tags.map((tagObj: Tag) => tagObj.name).includes(tag));
		} else {
			tagMatch =
				getSelectedTags().length === 0 ||
				getSelectedTags().some((tag) => task.tags.map((tagObj: Tag) => tagObj.name).includes(tag));
		}

		if (filterState) {
			// CheckoutState Filtering
			const stateMatch = !getSelectedState() || task.state === getSelectedState();
			return keywordMatch && tagMatch && stateMatch;
		} else {
			return keywordMatch && tagMatch;
		}
	});

	setFilteredTasks(filtered);

	const headers = Object.keys(getHeaderConfig());
	setTableIds([]);

	let tableDataShortenedTemp = filtered.map((row, index) => {
		const rowObject: TableRowType<HasTag> = {
			index: index + 1,
			itemId: row.id,
			thisItem: row
		};
		for (const header of headers) {
			rowObject[header] = getHeaderConfig()[header](row);
		}
		const newIds = [...getTableIds(), row.id];
		setTableIds(newIds);
		return rowObject;
	});

	if (typeof getSortState().column === 'string') {
		// Get the getter function for the sort column
		const getSortValue = getHeaderConfig()[getSortState().column as string];
		const indices = tableDataShortenedTemp.map((_, index) => index); // Initialize indices array

		indices.sort((aIndex, bIndex) => {
			// Use the getter function to extract the sort value
			const aValue = getSortValue(filtered[aIndex]).toLowerCase();
			const bValue = getSortValue(filtered[bIndex]).toLowerCase();

			if (aValue < bValue) {
				return getSortState().direction === 1 ? -1 : 1;
			}
			if (aValue > bValue) {
				return getSortState().direction === 1 ? 1 : -1;
			}
			return 0;
		});

		// Sort the tableDataShortenedTemp array and the tableIds array according to the sorted indices
		tableDataShortenedTemp = indices.map((index) => tableDataShortenedTemp[index]);
		setTableIds(indices.map((index) => getTableIds()[index]));
	}

	setTableData(tableDataShortenedTemp);
	setCheckedItemIds(getCheckedItemIds().filter((item) => getTableIds().includes(item)));
}

export function computeTagCounts<HasTag>(
	getItems: () => HasTag[],
	getTags: (item: HasTag) => { name: string }[],
	setAllTags: (tags: string[]) => void,
	setTagsCount: (count: { tag: string; count: number }[]) => void
) {
	const allTags = getItems()
		.map(getTags)
		.flat()
		.map((tag) => {
			return tag.name;
		})
		.filter((tag) => tag);

	const uniqueTags = [...new Set(allTags)];

	const tagsCount = uniqueTags.map((tag) => {
		return {
			tag: tag,
			count: allTags.filter((t) => t === tag).length
		};
	});

	const noTagsCount = getItems().filter((item) => getTags(item).length === 0).length;

	if (noTagsCount > 0) {
		tagsCount.unshift({ tag: 'No Tags', count: noTagsCount });
	}

	setAllTags(allTags);
	setTagsCount(tagsCount);
}

export function computeTotalSelectedTasks<HasTag>(
	getItems: () => HasTag[],
	getSelectedTags: () => string[],
	getTags: (item: HasTag) => { name: string }[]
): number {
	const selectedTasks = new Set<number>();

	if (getSelectedTags().length > 0) {
		getItems().forEach((item) => {
			const itemTags = getTags(item).map((t) => t.name);

			if (getSelectedTags().some((tag) => itemTags.includes(tag))) {
				selectedTasks.add(item.id);
			}

			if (getSelectedTags().includes('No Tags') && getTags(item).length === 0) {
				selectedTasks.add(item.id);
			}
		});
	}

	return selectedTasks.size;
}

export function computeButtonTextCount(
	getCheckedItemIds: () => number[],
	getFilteredTasks: () => HasTag[],
	getShiftPressed: () => boolean
): string {
	const items = getCheckedItemIds();
	const visibleItems = getFilteredTasks().map((task: HasTag) => task.id); // Replace 'any' with the appropriate type
	const overlap = items.filter((item) => visibleItems.includes(item));

	if (getShiftPressed() || overlap.length == 0 || overlap.length == visibleItems.length) {
		return `All`;
	} else {
		return `(${overlap.length})`;
	}
}
