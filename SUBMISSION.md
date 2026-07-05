# Checkpoint 2 Submission — drafted answers

Confirmed form fields (received 5 Jul 2026) with copy-paste-ready answers. Fact-checked against the code: endpoints from `src/lib/xero/`, scopes from `.env`. No demo video — the description is written to *be* the demo, ending in a 60-second "try it yourself".

## Required fields

### Detailed explanation of your submission

**Matchbook — you got the gig, I'll do the paperwork.**

Meet Caslean: musician, Depop seller, model. Three income streams, and every booking arrives as human mess — a promoter's email, an agency DM, a call transcript. None of it becomes an invoice on time, because she's an artist, not an accounts department. Matchbook is the accounts department: an agent that turns booking conversations into correct Xero ledger entries, with a human hand on every irreversible action.

**The loop.** Paste the conversation. Claude extracts the deal — client, date, rate, line items, payment terms — with per-field provenance: every value is traced to the exact phrase it came from, validated against a strict Zod schema before anything downstream trusts it. The agent then resolves the client against Xero Contacts with fuzzy matching (exact / high / medium confidence, org-suffix and punctuation normalised), checks recent invoices for duplicates (same contact, ±3 days, same amount — it will never double-invoice a gig), and presents a proposal: exactly what it intends to write, and why. Nothing touches the ledger until Caslean taps approve. On approval it creates the contact if new, writes the draft invoice (correct UK VAT, due date computed from free-text terms like "14 days" or "end of month"), then **re-reads the invoice from Xero to verify it actually landed** — and writes its extraction reasoning into the invoice's history in Xero, so the audit trail lives in the ledger itself.

**The trust feature.** The agent asks, never guesses. Vague rate ("usual fee?"), ambiguous client, suspected duplicate — it raises a question instead of inventing financial data. That's the difference between an agent that talks and one you'd let near real money.

**Process.** Built solo in the hackathon window with Claude Code driving the Xero MCP Server as dev tooling: the sandbox was seeded, every field name and tax code verified live against the API (never assumed), and the write path tested end-to-end against the Demo Company before the UI hardened around it. Scope was run as a strict ladder — extraction fallback first, so a working product existed at every checkpoint.

**Try it in 60 seconds** (live link below): paste any booking-style message — e.g. *"Hey Cas! Confirming Friday 10th at the Velvet Room, 9pm set. £450 as discussed, payment within 14 days. – Marco"* — and watch it become an approved draft invoice in Xero, provenance and all. Then delete the rate from the message and paste again: it asks instead of guessing.

Roadmap: forwarded-email ingestion, overdue-invoice chasing through the same approve/audit skeleton, per-stream income and tax-prep breakdowns. Today she pastes; the paperwork was already done before she put her guitar down.

### How did your project utilise the Xero API?

Conversation-to-invoice automation. The core workflow is: unstructured booking text in → contact resolved against Xero Contacts (fuzzy match, or gated creation of a new contact) → duplicate check against recent Invoices for the same contact/date/amount → human approval → draft ACCREC invoice written to Xero with correct account code, UK VAT and computed due date → **write-back verification** by re-reading the invoice → the agent's extraction reasoning appended to the invoice's History in Xero, so the audit trail is part of the ledger record itself. Every Xero write is behind a one-tap approval gate.

### Which specific Xero API endpoints?

All against the Accounting API (`https://api.xero.com/api.xro/2.0`):

- `GET /Contacts` — list active contacts for fuzzy resolution
- `PUT /Contacts` — create a new contact (gated on approval)
- `GET /Invoices` — recent invoices for duplicate detection
- `PUT /Invoices` — create the draft ACCREC invoice (gated on approval)
- `GET /Invoices/{InvoiceID}` — re-read after writing to verify it landed
- `PUT /Invoices/{InvoiceID}/History` — append the agent's reasoning as a history note

Auth: `POST https://identity.xero.com/connect/token` (Custom Connection, client_credentials) and `GET https://api.xero.com/connections` for tenant discovery.

_(Xero's convention is `PUT` for creation on these endpoints — listed as the code actually calls them.)_

### Development platform

Claude Code (agentic pair-programming, with the Xero MCP Server wired in as live dev tooling for sandbox seeding and API verification). App: SvelteKit + TypeScript; extraction powered by the Claude API with schema-enforced structured output.

### OAuth 2.0 scopes

`accounting.contacts`, `accounting.invoices`, `accounting.settings` — deliberately minimal: the deployed app requests only what the workflow needs, via a Custom Connection (client_credentials, server-side only, no tokens in the browser).

### Track

**Productivity Powerhouse** (primary — the bounty the whole build targets). Also tick **Vibe Integrator** (built end-to-end with Claude Code + MCP). Skip Cash Flow Accelerator.

## Links

- **Code:** https://github.com/yewen-jin/matchbook
- **Live demo:** _(deployed URL)_
- **Demo video:** leave blank, or a raw unedited screen recording of one paste-to-invoice loop if time allows
- **Presentation:** demo deck PDF (matchbook-demo-deck.pdf) or https://github.com/yewen-jin/matchbook/blob/main/PITCH.md
- **Files:** ARCHITECTURE.md / PITCH.md / deck PDF, optional

## Accuracy notes

- Description says "audit trail lives in the ledger itself" — the in-app `/audit` page (Phase 4) isn't built; the Xero history-note write is real and verified.
- Scopes reflect the deployed app's `.env`, not the broader MCP dev-tooling scope list in `.mcp.json`.
