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
	getServer,
	getSettings,
	getWins
} from '../helpers';
import type { LayoutLoad } from './$types';

export const load: LayoutLoad = async ({ fetch }) => {
	return {
		streamed: {
			x6: getCheckoutTasks(fetch),
			x4: getNACTasks(fetch),
			x2: getActivityTasks(fetch),
			x1: getSettings(fetch),
			x5: getAccounts(fetch),
			x7: getPayments(fetch),
			x8: getProfiles(fetch),
			x3: getSchedules(fetch),
			x9: getProxies(fetch),
			x10: getWins(fetch),
			x11: getSchedules(fetch),
			x12: getServer(fetch)
		}
	};
};

// async function sleep(ms: number) {
// 	return new Promise((resolve) => {
// 		setTimeout(resolve, ms);
// 	});
// }
