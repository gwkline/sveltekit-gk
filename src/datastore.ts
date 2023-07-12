import { browser } from '$app/environment';
import { writable } from 'svelte/store';
import type { Writable } from 'svelte/store';
import type { Settings, Task, Account, Schedule } from './types';

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

export const isLoading = writable<Record<string, boolean>>({});
export const settings = persistentStore<Settings | Record<string, never>>('settings', {});
export const sidebarCollapsed = persistentStore('sidebarCollapsed', true);

export const shiftPressed = persistentStore('shiftPressed', false);
export const showTags = persistentStore('showTags', false);

export const searchValue = persistentStore('searchValue', '');
export const selectedTags = persistentStore<string[]>('selectedTags', []);
export const selectedState = persistentStore('selectedState', '');

export const accounts = persistentStore<Account[]>('accounts', []);
export const verboseTasks = persistentStore<Task[]>('verboseTasks', []);
export const filteredTasks = persistentStore<Task[]>('filteredTasks', []);

export const schedules = persistentStore<Schedule[]>('schedules', []);

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
