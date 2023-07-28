import { browser } from '$app/environment';
import { writable, type Writable } from 'svelte/store';
import type {
	Settings,
	Task,
	Schedule,
	SizePresets,
	ActivityTask,
	ShortAccount,
	Profile,
	Payment,
	ProxyList,
	Win
} from './types';
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

export const sidebarCollapsed = persistentStore('sidebarCollapsed', true);
export const showTags = persistentStore('showTags', false);

export const isLoading = writable<Record<string, boolean>>({});
export const shiftPressed = writable(false);
export const accessDenied = writable(false);
export const networkError = writable(false);

export const validAccessToken = persistentStore('validAccessToken', false);
export const accessTokenExpiration = persistentStore('accessTokenExpiration', -1);
export const settings = persistentStore<Settings>('settings', seedSettings);
export const accounts = persistentStore<ShortAccount[]>('accounts', seedAccounts);
export const payments = persistentStore<Payment[]>('payments', []);
export const proxy_lists = persistentStore<ProxyList[]>('proxy_lists', []);
export const wins = persistentStore<Win[]>('wins', []);
export const profiles = persistentStore<Profile[]>('profiles', []);
export const verboseTasks = persistentStore<Task[]>('verboseTasks', seedTasks);
export const verboseActivityTasks = persistentStore<ActivityTask[]>('verboseActivityTasks', []);
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
