import type { Handle } from '@sveltejs/kit';

export const handle = (async ({ event, resolve }) => {
	let theme: string | null = null;

	const newTheme = event.url.searchParams.get('theme');
	const cookieTheme = event.cookies.get('color-theme');

	if (newTheme) {
		theme = newTheme;
	} else if (cookieTheme) {
		theme = cookieTheme;
	}

	if (theme) {
		return await resolve(event, {
			transformPageChunk: ({ html }) => html.replace('color-theme=""', `color-theme="${theme}"`)
		});
	}

	return await resolve(event);
}) satisfies Handle;
