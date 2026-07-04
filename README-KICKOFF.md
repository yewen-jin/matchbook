# Kickoff — read me first

**Product:** conversation→invoice agent for creatives (see CLAUDE.md). **Plan:** TASKS.md. **Design:** ARCHITECTURE.md. **Demo:** PITCH.md. **Data:** mock-data/.

## Getting Xero sandbox credentials (Phase 0, step 1)

1. **Demo Company:** sign up free at xero.com → in My Xero, add the **Demo Company (UK)** — pre-populated books, resets periodically, safe to write to.
2. **Developer app:** log in at **developer.xero.com** → **My Apps** → **New app**. Name it, give any company URL, and set redirect URI to `http://localhost:5173/callback` (adjust port later if needed). This gives you a **Client ID**; then **Generate a secret** on the app's Configuration page → **Client Secret**.
3. **Auth mode:** which flow you use depends on the Xero MCP Server — check github.com/XeroAPI/xero-mcp-server README first (it documents whether it wants a Custom Connection client-credentials pair or a standard OAuth authorisation-code flow, and the exact env var names). **Verify, don't assume** — availability of Custom Connections varies by account/region.
4. **Secrets hygiene:** credentials live in `.env` (already in .gitignore once repo exists). Never commit them, never paste the Client Secret into chat/docs.

## First Claude Code session prompt

> Read CLAUDE.md, TASKS.md and ARCHITECTURE.md. Work Phase 0 in TASKS.md, one task at a time: confirm the Xero MCP server connects and list its live tool names, then scaffold the SvelteKit shell, seed mock-data/ into the sandbox via MCP, and smoke-test reading an invoice back. Set the checkpoint time at the top of TASKS.md. Atomic commit after each working slice. Ask before any write to Xero.

## mock-data/ map

- `conversations/01–05` — demo inputs (paste these): clean email, agency DM (multi-item), Zoom transcript, vague DM (must trigger questions), duplicate re-confirmation.
- `contacts.csv`, `invoices.csv` — seed these INTO the sandbox via MCP in Phase 0 (contacts for resolution/dedupe; one deliberately overdue invoice for the chase stretch).
- `README.md` — expected agent behaviour per conversation (this is the demo script in data form).
- `bank-statement.csv` — **obsolete**, left over from the reconciliation pivot; ignore or delete.
