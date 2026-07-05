# Tasks — Xero Hackathon (Conversation→Invoice Agent)

**De-risk rule:** aim for the agent (write-actions: creating contacts + invoices). **Checkpoint: 21:34 BST (4 Jul 2026).** If writes aren't reliably working against the sandbox by then, fall back to the **drafting assistant** — same extraction, reasoning and questions; the human copies the draft into Xero. Build the read/extract path first so the fallback always exists.

**Stretch gate:** the chase skill (Stretch 1) only starts if the core loop is demo-solid. If that's not true by tomorrow morning, stretches are cut and become roadmap lines.

## Active

### Phase 0 — Setup (first 60–90 min) ✅ complete
- [x] **Xero credentials** - demo company + app on developer.xero.com → Client ID/Secret (see README-KICKOFF.md for the exact steps)
- [x] **Wire up Xero MCP Server** - confirm it connects; list its live tools; note exact tool names in ARCHITECTURE.md
- [x] **Repo + scaffolding** - SvelteKit shell; commit docs + mock-data/; first atomic commit
- [x] **Seed Caslean's world** - create 3 contacts + 2 existing invoices from mock-data/ via MCP (the API learning goal in action)
- [x] **Smoke test** - read a seeded invoice back end-to-end
- [x] **Set the checkpoint time** at the top of this file

### Phase 1 — Extract path (the fallback floor) ✅ complete
- [x] **Paste box + extraction** - conversation text → structured JSON (client, date, line items, terms) with per-field provenance
- [x] **Validate the contract** - schema check before anything downstream trusts it (Zod schema in `src/lib/types.ts`)
- [x] **Test against all 5 mock conversations** - including the vague one (must produce questions, not guesses) — all 5 pass

### Phase 2 — Resolve + propose (the agent brain) ✅ complete
- [x] **Contact resolution** - fuzzy match extracted client against Xero Contacts; unknown → propose creation (`src/lib/xero/contacts.ts`)
- [x] **Duplicate check** - same client + date + amount vs recent invoices → flag, never double-invoice (`src/lib/xero/invoices.ts`)
- [x] **Proposal view** - contact match (or new-contact proposal) + duplicate warnings shown after extraction

### Phase 3 — Write-actions (the agent proper) ✅ complete
- [x] **Create contact** (gated) - for new clients (`createContact` in `src/lib/xero/contacts.ts`)
- [x] **Create invoice** (gated) - the headline write (`createInvoice`, account 200/OUTPUT2, computed due date)
- [x] **Verify** - re-read via API; show invoice number + status; before/after (`getInvoice`)
- [x] **History note** - append extraction reasoning to the invoice in Xero (`addInvoiceHistoryNote`)

**Verified live 5 Jul 2026:** full extract→resolve→approve loop tested against the Demo Company sandbox (both a throwaway contact/invoice and the real Velvet Room happy path) — correct VAT total, correct computed due date, history note landed, re-read confirms. Test invoices cleaned up afterwards.

### Phase 4 — Trust layer (the 20%, and the fear-killer) ⟵ active
- [x] **Approval gate** - no write without one-tap sign-off; questions block proposals until answered (enforced server-side, not just UI — verified by direct POST bypass test)
- [x] **Audit log** - source text, extraction, reasoning, decisions, Xero IDs — visible in the app (`src/lib/audit.ts` + `/audit` route)
- [~] **Edge cases pass** - vague rate ✅, duplicate ✅, multi-item ✅, transcript noise ✅ (all verified live through extract→resolve→approve). **Unknown client is not yet covered by an actual mock-data file** — all 5 conversations use pre-seeded contacts (Velvet Room/Halliday/Brightside). Only tested synthetically with a made-up name so far. Need a decision: add a 6th mock conversation, or accept the synthetic test as sufficient.

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
