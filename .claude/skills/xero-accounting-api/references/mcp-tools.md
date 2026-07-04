# xero-mcp-server tool list (live, verified 4 Jul 2026)

Full list confirmed both from the `xero-mcp-server` README and by loading live tool schemas from this project's connected `mcp__xero__*` server. Where noted, exact input schemas were pulled live (source of truth over any README description).

## Core loop (Phases 1–3)

- **`list-contacts`** — `{ page?, searchTerm? }`. `searchTerm` does a case-insensitive search across Name, FirstName, LastName, ContactNumber, EmailAddress. Paginates at 100.
- **`create-contact`** — `{ name (required), email?, phone? }`. Much narrower than the raw Contact object — no address, no contact number. Returns a deep link to show the user.
- **`update-contact`** — `{ contactId (required), name (required even when unchanged), email?, phone?, firstName?, lastName?, address? }`. `address` requires at least `addressLine1`.
- **`list-invoices`** — `{ page (required), contactIds?, invoiceNumbers? }`. Passing `invoiceNumbers` also returns line items (otherwise line items are omitted — relevant for duplicate-detection logic, which needs amounts).
- **`create-invoice`** — `{ contactId (required), lineItems[] (required), type? (ACCREC|ACCPAY, default ACCREC), date?, reference? }`. **No `dueDate` field on create** — due date comes from the org's default invoice settings unless set afterward via `update-invoice`. Each line item requires **all** of: `description`, `quantity`, `unitAmount`, `accountCode`, `taxType`. `itemCode` and `tracking` are optional.
- **`update-invoice`** — draft invoices only. `{ invoiceId (required), contactId?, date?, dueDate?, lineItems?, reference? }`. **Danger:** if `lineItems` is provided, it fully replaces the existing set — any line item not included is deleted. Only pass `lineItems` when actually changing them.
- **`list-accounts`** — no params. Needed to resolve `accountCode` for every invoice/quote line item.
- **`list-tax-rates`** — no params. Needed to resolve `taxType` for every invoice/quote line item.
- **`list-items`** — `{ page? }`. Optional `itemCode` per line item if Caslean has predefined items (she likely doesn't — fine to omit).

## Quotes (used when the conversation is a quote request, not a confirmed booking)

- **`list-quotes`** — `{ page (required), contactId?, quoteNumber? }`.
- **`create-quote`** — `{ contactId (required), lineItems[] (required), quoteNumber?, reference?, summary?, terms?, title? }`. **No `date` or `expiryDate` param at creation** — unlike invoices, if the quote needs a specific expiry shown to the client, it must be set via `update-quote` afterward.
- **`update-quote`** — draft quotes only. `{ quoteId (required), contactId?, date?, expiryDate?, lineItems?, quoteNumber?, reference?, summary?, terms?, title? }`. Same full-replace danger on `lineItems` as `update-invoice`.

## Chase skill (Stretch 1)

- **`list-aged-receivables-by-contact`** — `{ contactId (required), reportDate?, invoicesFromDate?, invoicesToDate? }`. Defaults `reportDate` to end of current month if omitted.
- **`create-payment`** — `{ invoiceId (required), accountId (required), amount (required, must be > 0), date?, reference? }`. Invoice must be `AUTHORISED` status and not already fully paid.

## No history/notes tool

There is no tool for adding a note or history entry to a contact or invoice. The only free-text field available on write is `reference` (invoice/quote) — put audit-relevant context there if it needs to live in Xero; otherwise the audit trail lives entirely in this app's own log, per ARCHITECTURE.md.

## Also available, not currently in scope for this project

`list-credit-notes` / `create-credit-note` / `update-credit-note`, `list-manual-journals` / `create-manual-journal` / `update-manual-journal`, `list-bank-transactions` / `create-bank-transaction` / `update-bank-transaction`, `list-contact-groups`, `list-organisation-details`, `list-profit-and-loss`, `list-report-balance-sheet`, `list-trial-balance`, `list-tracking-categories` / `create-tracking-category` / `update-tracking-category` / `create-tracking-option` / `update-tracking-options` (roadmap-only per CLAUDE.md's "Someday" list), all `payroll.*` tools (explicitly out of scope — bank feeds/reconciliation/payroll are excluded this weekend).
