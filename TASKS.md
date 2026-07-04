# Tasks — Xero Hackathon (Conversation→Invoice Agent)

**De-risk rule:** aim for the agent (write-actions: creating contacts + invoices). **Checkpoint: 21:34 BST (4 Jul 2026).** If writes aren't reliably working against the sandbox by then, fall back to the **drafting assistant** — same extraction, reasoning and questions; the human copies the draft into Xero. Build the read/extract path first so the fallback always exists.

**Stretch gate:** the chase skill (Stretch 1) only starts if the core loop is demo-solid. If that's not true by tomorrow morning, stretches are cut and become roadmap lines.

## Active

### Phase 0 — Setup (first 60–90 min)
- [ ] **Xero credentials** - demo company + app on developer.xero.com → Client ID/Secret (see README-KICKOFF.md for the exact steps)
- [ ] **Wire up Xero MCP Server** - confirm it connects; list its live tools; note exact tool names in ARCHITECTURE.md
- [ ] **Repo + scaffolding** - SvelteKit shell; commit docs + mock-data/; first atomic commit
- [ ] **Seed Caslean's world** - create 3 contacts + 2 existing invoices from mock-data/ via MCP (the API learning goal in action)
- [ ] **Smoke test** - read a seeded invoice back end-to-end
- [ ] **Set the checkpoint time** at the top of this file

### Phase 1 — Extract path (the fallback floor)
- [ ] **Paste box + extraction** - conversation text → structured JSON (client, date, line items, terms) with per-field provenance
- [ ] **Validate the contract** - schema check before anything downstream trusts it
- [ ] **Test against all 5 mock conversations** - including the vague one (must produce questions, not guesses)

### Phase 2 — Resolve + propose (the agent brain)
- [ ] **Contact resolution** - fuzzy match extracted client against Xero Contacts; unknown → propose creation
- [ ] **Duplicate check** - same client + date + amount vs recent invoices → flag, never double-invoice
- [ ] **Proposal view** - the draft invoice as a diff of what will be written, with reasoning + open questions

### Phase 3 — Write-actions (the agent proper) ⟵ checkpoint gates here
- [ ] **Create contact** (gated) - for new clients
- [ ] **Create invoice** (gated) - the headline write
- [ ] **Verify** - re-read via API; show invoice number + status; before/after
- [ ] **History note** - append extraction reasoning to the invoice in Xero

### Phase 4 — Trust layer (the 20%, and the fear-killer)
- [ ] **Approval gate** - no write without one-tap sign-off; questions block proposals until answered
- [ ] **Audit log** - source text, extraction, reasoning, decisions, Xero IDs — visible in the app
- [ ] **Edge cases pass** - vague rate, duplicate, unknown client, multi-item, transcript noise (all in mock data)

### Phase 5 — Demo & submission
- [ ] **2-min demo script** - see PITCH.md; rehearse start-to-finish
- [ ] **Record backup clip** - in case the live API flakes
- [ ] **Submit** - repo link, description (draft in PITCH.md), whatever the form requires

## Stretch (strict order; each gated on the one before)
- [ ] **Stretch 1 — chase skill** - list overdue invoices, draft British-English nudges, gated send, note in History (reuses the approval skeleton)
- [ ] **Stretch 2 — inbound email** - Postmark/Mailgun forwarding address → webhook → same pipeline

## Waiting On
- [ ] Confirm exact submission requirements + deadline from organisers

## Someday (roadmap lines in the pitch, zero build)
- [ ] Zoom/Meet transcript auto-ingestion (transcripts already work via paste)
- [ ] Per-stream income summary (music / Depop / modelling via tracking categories)
- [ ] Tax-prep breakdown by stream + client
- [ ] Compliance sentinel (filing deadlines via Companies House API)

## Done
- [x] Choose idea (conversation→invoice agent) + persona (Caslean) + scope ladder
- [x] Docs written; mock conversations + sandbox seed data generated (mock-data/)
