# Architecture — Conversation-to-Invoice Agent

## One-line
An agent that turns a pasted booking conversation into a correct Xero invoice — extraction with stated reasoning, questions instead of guesses — wrapped in an app where a human approves every ledger write and can audit everything.

## Two layers
- **Agent (the worker):** reasons and acts. Loop: ingest → extract → resolve → propose → act → verify.
- **App (the face):** paste box + approval gate + audit log. Thin on purpose.

## The loop
1. **Ingest** — user pastes conversation text (email, DM, call transcript — channel is just transport).
2. **Extract** — LLM pulls the deal: client, date(s), service/deliverables, amount(s), payment terms. Each field carries **provenance** — the phrase it came from — as reasoning.
3. **Resolve** — look up the client in Xero Contacts (fuzzy match against names/emails). New client → propose contact creation. Check open/recent invoices for **duplicates** (same client + date + amount).
4. **Propose** — draft invoice (or quote on request) with line items. Missing or ambiguous data → the agent **asks a question, never guesses**. **Stop here for approval.**
5. **Act** — on one-tap sign-off: create contact if needed, create the invoice in Xero.
6. **Verify** — re-read the invoice from the API; show invoice number + status back; log the result.

## Xero integration
Use the **Xero MCP Server** as the agent's tools. Tool names below **verified against the README (github.com/XeroAPI/xero-mcp-server, 4 Jul)** — confirm against the *live* tool list once connected; field signatures still need checking:

- **Contacts:** `list-contacts` for resolution; `create-contact` (gated) for new clients; `update-contact` exists too.
- **Invoices:** `list-invoices` (duplicate check + chase skill); `create-invoice` (gated) — the headline write; re-read via `list-invoices` to verify; `update-invoice` works on drafts.
- **Quotes:** `create-quote` / `list-quotes` when the conversation is a quote request, not a confirmed booking.
- **Chase-skill extras (Stretch 1):** `list-aged-receivables-by-contact`, `create-payment`.
- **Tracking (Someday, per-stream view):** `list-tracking-categories`, `create-tracking-category`.
- **History/Notes:** no history tool in the MCP list — the audit trail lives in our app's log; putting reasoning into Xero can go in the invoice reference/description fields instead. Adjust ambitions accordingly.

**Auth (verified):** Custom Connection mode — env vars `XERO_CLIENT_ID` + `XERO_CLIENT_SECRET` (optional `XERO_SCOPES`). The developer app must be a **Custom Connection** type (developer.xero.com guide: oauth2/custom-connections), with all required scopes ticked, authorised against the Demo Company.

**Deliberately avoided:** Gmail OAuth, WhatsApp/Instagram APIs (restricted), Zoom/Meet APIs (paid tiers + OAuth plumbing, zero rubric points), Bank Feeds. Transcripts enter as pasted text.

Reference implementations: **github.com/XeroAPI/xero-agent-toolkit**.

## Extraction contract (the agent brain)
LLM output is **structured JSON**, validated before anything touches Xero:
`{ client, client_confidence, event_date, line_items[{description, qty, unit_amount, provenance}], currency, due_terms, questions[], duplicate_suspects[] }`
- Every extracted value keeps the source phrase (provenance) → this becomes the reasoning shown at approval and written to History.
- Anything below confidence, or absent → goes in `questions[]`, and the proposal is blocked until answered. **Refusing to guess is the trust feature.**

## Human-in-the-loop gate
- The agent may freely **read, extract, and draft**.
- Any **write** (create contact, create invoice/quote, send anything) is **irreversible → explicit one-tap approval** in the app, shown as a diff of exactly what will be written.
- Nothing auto-fires in the demo or against real books.

## Audit log
Every proposal and action recorded with: timestamp, source text, extracted fields + provenance, resolution decision, questions asked, approve/reject/edit, resulting Xero IDs. This *is* the 20% architecture score — and the answer to "why should I trust an AI near my money?"

## Edge cases (built into mock-data/conversations/; judges will poke these)
- **Vague booking, no rate** ("usual rate?") → agent asks; never invents a number.
- **Duplicate booking** (re-confirmation of an already-invoiced gig) → flag, don't double-invoice.
- **Unknown client** → propose contact creation, gated separately.
- **Multi-item deal** (day rate + usage fee) → correct line items, not one blob.
- **Transcript noise** (filler words, speaker labels) → extraction still clean; show provenance.

## Rubric map
- **50% Xero Connection** → a real creative's real on-ramp (bookings in DMs/emails/calls), a chore nobody else automates from that end.
- **30% API Integration** → Contacts + Invoices read *and written*, verified by re-read, History noted.
- **20% Architecture** → structured extraction contract, approval-as-diff, asks-never-guesses, audit log, no mid-demo hacks.
