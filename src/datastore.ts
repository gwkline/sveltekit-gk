import { browser } from '$app/environment';
import { writable } from 'svelte/store';
import type { Writable } from 'svelte/store';
import type { Settings, Task, Account, Schedule, SizePresets, SortState, State } from './types';
import { seedAccounts, seedSettings, seedTasks } from './seedData';

// Create a store that syncs with localStorage
const persistentStore = <T>(key: string, startValue: T): Writable<T> => {
	let initialValue = startValue;

	if (browser) {
		// We're in the browser
		const storedValue = localStorage.getItem(key);
		initialValue = storedValue === null ? startValue : JSON.parse(storedValue);
	}

	const store = writable<T>(initialValue);

	store.subscribe(($value) => {
		if (browser) {
			// We're in the browser
			localStorage.setItem(key, JSON.stringify($value));
		}
	});

	return store;
};

export const editSku = writable(false);
export const editPreferredSizeInput = writable(false);
export const editRandomSizeInput = writable(false);
export const editScheduleDropdown = writable(false);
export const editBrowserType = writable(false);
export const editRetryMode = writable(false);
export const editRetryNonWinner = writable(false);
export const editRetryDeclines = writable(false);
export const editExperimentalMode = writable(false);

export const isLoading = writable<Record<string, boolean>>({});
export const sidebarCollapsed = persistentStore('sidebarCollapsed', true);

export const shiftPressed = persistentStore('shiftPressed', false);
export const showTags = persistentStore('showTags', false);
export const accessDenied = persistentStore('accessDenied', false);
export const networkError = persistentStore('networkError', false);

export const searchValue = persistentStore('searchValue', '');
export const selectedTags = persistentStore<string[]>('selectedTags', []);
export const selectedState = persistentStore<State | ''>('selectedState', '');
export const sortState = persistentStore<SortState>('sortState', {
	column: null,
	direction: 0 // 0 = not sorted, 1 = ascending, -1 = descending
});

export const settings = persistentStore<Settings>('settings', seedSettings);
export const accounts = persistentStore<Account[]>('accounts', seedAccounts);
export const verboseTasks = persistentStore<Task[]>('verboseTasks', seedTasks);
export const filteredTasks = persistentStore<Task[]>('filteredTasks', []);
export const schedules = persistentStore<Schedule[]>('schedules', []);
export const sizePresets = persistentStore<SizePresets>('sizePresets', {
	mens: {
		"Weighted w/ 6's (20)": [
			'6',
			'6.5',
			'7',
			'7.5',
			'8',
			'8.5',
			'9',
			'9',
			'9.5',
			'9.5',
			'10',
			'10',
			'10',
			'10.5',
			'10.5',
			'11',
			'11',
			'11.5',
			'12',
			'13'
		],
		'Weighted 6-14 (20)': [
			'6',
			'6.5',
			'7',
			'7.5',
			'8',
			'8.5',
			'9',
			'9',
			'9.5',
			'9.5',
			'10',
			'10',
			'10.5',
			'10.5',
			'11',
			'11',
			'11.5',
			'12',
			'13',
			'14'
		],
		'Weighted 8-13 (20)': [
			'8',
			'8.5',
			'9',
			'9',
			'9.5',
			'9.5',
			'9.5',
			'10',
			'10',
			'10',
			'10.5',
			'10.5',
			'11',
			'11',
			'11',
			'11.5',
			'11.5',
			'12',
			'12',
			'13'
		],
		'Weighted 8-12 (15)': [
			'8',
			'8.5',
			'9',
			'9',
			'9.5',
			'9.5',
			'10',
			'10',
			'10',
			'10.5',
			'10.5',
			'11',
			'11',
			'11.5',
			'12'
		],
		'Weighted 4-14 (20)': [
			'4',
			'4.5',
			'5',
			'5.5',
			'6',
			'6.5',
			'7',
			'7.5',
			'8',
			'8.5',
			'9',
			'9.5',
			'10',
			'10.5',
			'11',
			'11.5',
			'12',
			'12.5',
			'13',
			'14'
		],
		'Weighted 6-12 (20)': [
			'6',
			'6.5',
			'7',
			'7.5',
			'8',
			'8',
			'8.5',
			'8.5',
			'9',
			'9',
			'9.5',
			'9.5',
			'10',
			'10',
			'10',
			'10.5',
			'10.5',
			'11',
			'11.5',
			'12'
		],
		'Max Cop Weighted (10)': ['8', '8.5', '9', '9.5', '10', '10', '10.5', '11', '12', '13'],
		'Max Cop Weighted (5)': ['8', '9', '10', '11', '12'],
		'Max Cop Weighted w/ 13 (5)': ['9', '10', '11', '12', '13']
	},
	womens: {
		'Max Cop': [
			'5',
			'5.5',
			'6',
			'6.5',
			'7',
			'7.5',
			'8',
			'8.5',
			'9',
			'9.5',
			'10',
			'10.5',
			'11',
			'11.5',
			'12'
		],
		"Max Cop (Men's Style)": [
			'5',
			'5.5',
			'6',
			'6.5',
			'7',
			'7.5',
			'8',
			'8.5',
			'9',
			'9.5',
			'9.5',
			'10',
			'10',
			'10.5',
			'11',
			'11',
			'11.5',
			'12',
			'13',
			'14'
		],
		'Weighted 5.5-11 (20)': [
			'5.5',
			'6',
			'6',
			'6.5',
			'6.5',
			'7',
			'7',
			'7',
			'7.5',
			'7.5',
			'7.5',
			'8',
			'8',
			'8',
			'9',
			'9',
			'9.5',
			'9.5',
			'10',
			'11'
		],
		'Weighted 5.5-10 (10)': ['5.5', '6', '6.5', '7', '7.5', '8', '8.5', '9', '9.5', '10']
	},
	youth: { 'Max Cop (10)': ['5Y', '5.5Y', '6Y', '6Y', '6.5Y', '6.5Y', '6.5Y', '7Y', '7Y', '7Y'] },
	preschool: {
		'Max Cop': [
			'10.5C',
			'11C',
			'11.5C',
			'12C',
			'12.5C',
			'13C',
			'13.5C',
			'1Y',
			'1.5Y',
			'2Y',
			'2.5Y',
			'3Y'
		]
	},
	toddler: { 'Max Cop (10)': ['1C', '2C', '3C', '4C', '5C', '6C', '7C', '8C', '9C', '10C'] }
});

export const checkedCheckoutTasks = persistentStore<number[]>('checkedCheckoutTasks', []);
export const checkedAllCheckoutTasks = persistentStore('checkedAllCheckoutTasks', false);
export const lastCheckedCheckoutTasks = persistentStore<number | null>(
	'lastCheckedCheckoutTasks',
	null
);
export const secondLastCheckedCheckoutTasks = persistentStore<number | null>(
	'secondLastCheckedCheckoutTasks',
	null
);

export const checkoutSettings = persistentStore('checkoutSettings', {
	browserType: 'Default',
	retryMode: 'Requeue',
	retryNonWinner: false,
	retryDeclines: false,
	experimentalMode: false,
	useAccountTags: false,
	specifyAccountsByAccountTag: false,
	specifyAccountsByProfileTag: false
});

// Define color mapping
export const stateColors = {
	Ready: 'var(--light-gray-2)',
	Queued: 'var(--warning-yellow)',
	Starting: 'var(--primary-hover)',
	Running: 'var(--primary)',
	Waiting: 'purple',
	Error: 'var(--danger-red)',
	Entered: 'var(--success-green)',
	Winning: '#00801a'
};

export const validAccessToken = persistentStore('validAccessToken', false);
export const accessTokenExpiration = persistentStore('accessTokenExpiration', -1);
