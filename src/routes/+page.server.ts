import type { PageServerLoad } from './$types';
import scheduleClient from '$src/server/schedule-client';

export const load = (async ({ setHeaders }) => {
	const weeks = await scheduleClient.get();
	setHeaders({
		'cache-control': 'public, max-age=300'
	});
	return { weeks };
}) satisfies PageServerLoad;
