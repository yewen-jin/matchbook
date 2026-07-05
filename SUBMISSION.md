# Checkpoint 2 Submission — as submitted (5 Jul 2026)

The text below is what was actually entered into the Checkpoint 2 form, verbatim. Earlier drafts superseded.

## Project Description

Matchbook is the finance department creative freelancers can't afford — it turns booking conversations into approved Xero invoices in one tap, from "you got the gig" to correct books.

## Submission Details

### Provide a detailed explanation of your submission. Describe what you've done, the process, and any relevant context.

Matchbook takes your meeting notes from calls, email exchanges, and all client correspondent into an invoice draft waiting for your approval to send to client. From then on it takes care of everything until the money is in your bank account.

The target clients are people like Caslean: musician, Depop seller, model. Three income streams, and every booking arrives as human mess — a promoter's email, an agency DM, a call transcript. None of it becomes an invoice on time, because she's an artist, not an accounts department. Matchbook is the accounts department: an agent that turns booking conversations into correct Xero ledger entries, with a human hand on every irreversible action.

The loop:
Claude extracts the deal — client, date, rate, line items, payment terms — with per-field provenance: every value is traced to the exact phrase it came from, validated against a strict Zod schema before anything downstream trusts it. The agent then resolves the client against Xero Contacts with fuzzy matching (exact / high / medium confidence, org-suffix and punctuation normalised), checks recent invoices for duplicates (same contact, ±3 days, same amount — it will never double-invoice a gig), and presents a proposal: exactly what it intends to write, and why. Nothing touches the ledger until you taps approve. On approval it creates the contact if new, writes the draft invoice (correct UK VAT, due date computed from free-text terms like "14 days" or "end of month"), then re-reads the invoice from Xero to verify it actually landed — and writes its extraction reasoning into the invoice's history in Xero, so the audit trail lives in the ledger itself.

### How did your project utilize the Xero API?

Conversation-to-invoice automation. The core workflow is: unstructured booking text in → contact resolved against Xero Contacts (fuzzy match, or gated creation of a new contact) → duplicate check against recent Invoices for the same contact/date/amount → human approval → draft ACCREC invoice written to Xero with correct account code, UK VAT and computed due date → write-back verification by re-reading the invoice → the agent's extraction reasoning appended to the invoice's History in Xero, so the audit trail is part of the ledger record itself. Every Xero write is behind a one-tap approval gate.

### Which specific Xero API endpoints did your application interact with?

All against the Accounting API (https://api.xero.com/api.xro/2.0):

- GET /Contacts — list active contacts for fuzzy resolution
- PUT /Contacts — create a new contact (gated on approval)
- GET /Invoices — recent invoices for duplicate detection
- PUT /Invoices — create the draft ACCREC invoice (gated on approval)
- GET /Invoices/{InvoiceID} — re-read after writing to verify it landed
- PUT /Invoices/{InvoiceID}/History — append the agent's reasoning as a history note

Auth: POST https://identity.xero.com/connect/token (Custom Connection, client_credentials) and GET https://api.xero.com/connections for tenant discovery.

### What development platform did you use?

Claude Code (agentic pair-programming, with the Xero MCP Server wired in as live dev tooling for sandbox seeding and API verification). App: SvelteKit + TypeScript; extraction powered by the Claude API with schema-enforced structured output.

### What Xero OAuth 2.0 scopes did your application require?

accounting.contacts, accounting.invoices, accounting.settings — deliberately minimal: the deployed app requests only what the workflow needs, via a Custom Connection (client_credentials, server-side only, no tokens in the browser).

## Other form fields (as recommended at submission time)

- **Track:** Productivity Powerhouse (primary) + Vibe Integrator
- **Code:** https://github.com/yewen-jin/matchbook
- **Live demo:** deployed site
- **Presentation:** demo deck PDF (matchbook-demo-deck.pdf)
- **Demo video:** none

## Accuracy notes

- Description says "audit trail lives in the ledger itself" — the in-app `/audit` page (Phase 4) isn't built; the Xero history-note write is real and verified.
- Scopes reflect the deployed app's `.env`, not the broader MCP dev-tooling scope list in `.mcp.json`.
- The opening line "takes care of everything until the money is in your bank account" is aspirational (chasing/payment tracking is roadmap) — if a judge asks, frame it as the product direction, with the shipped loop ending at the verified draft invoice.
