export const ssr = false;
export const prerender = false;

import {
	getAccounts,
	getActivityTasks,
	getCheckoutTasks,
	getNACTasks,
	getPayments,
	getProfiles,
	getProxies,
	getSchedules,
	getSettings,
	getWins
} from '../helpers';
import type { LayoutLoad } from './$types';

export const load: LayoutLoad = async () => {
	return {
		x1: getSettings(),
		x2: getActivityTasks(),
		x3: getSchedules(),
		x4: getNACTasks(),
		x5: getAccounts(),
		x6: getCheckoutTasks(),
		x7: getPayments(),
		x8: getProfiles(),
		x9: getProxies(),
		x10: getWins(),
		x11: getSchedules()
	};
};

async function sleep(ms: number) {
	return new Promise((resolve) => {
		setTimeout(resolve, ms);
	});
}
