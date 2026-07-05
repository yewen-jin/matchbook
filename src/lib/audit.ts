import type { AuditEntry } from './types';

// In-memory for the life of the server process — fine for a live demo,
// resets on redeploy/cold start. No database in scope for this hackathon.
const log: AuditEntry[] = [];

export function recordAudit(
	action: AuditEntry['action'],
	summary: string,
	detail?: unknown,
): AuditEntry {
	const entry: AuditEntry = {
		id: crypto.randomUUID(),
		timestamp: new Date().toISOString(),
		action,
		summary,
		detail,
	};
	log.unshift(entry);
	return entry;
}

export function getAuditLog(): AuditEntry[] {
	return log;
}
