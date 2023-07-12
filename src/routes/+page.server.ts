import { redirect } from '@sveltejs/kit';
import type { Actions } from './$types';

export const actions: Actions = {
	setTheme: async ({ url, cookies }) => {
		const theme = cookies.get('color-theme');
		const redirectTo = url.searchParams.get('redirectTo');

		let newTheme;
		if (theme === 'dark') {
			newTheme = 'light';
		} else {
			newTheme = 'dark';
		}

		cookies.set('color-theme', newTheme, {
			path: '/',
			maxAge: 60 * 60 * 24 * 365
		});

		throw redirect(303, redirectTo ?? '/');
	}
};
