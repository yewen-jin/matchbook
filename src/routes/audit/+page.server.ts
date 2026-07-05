import type { PageServerLoad } from './$types';
import { getAuditLog } from '$lib/audit';

export const load: PageServerLoad = async () => {
	return { entries: getAuditLog() };
};
