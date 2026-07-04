---
name: xero-accounting-api
description: Verified reference for this project's Xero integration — the Custom Connections (client_credentials) auth used by the xero-mcp-server, the standard Authorization Code flow used in src/routes/callback, the live xero-mcp-server tool list and input schemas, and field names/enums for Contacts, Invoices and Quotes. Use whenever writing or reviewing code that talks to Xero (src/lib/xero/, src/routes/callback), calling an mcp__xero__* tool, resolving a contact/account/tax code, or checking an exact Xero field/endpoint/tool name before relying on it.
---

# Xero Accounting API — project reference

This project talks to Xero two ways. Don't confuse them:

1. **Custom Connection (`client_credentials`)** — what `.mcp.json` configures for `xero-mcp-server`. This is what the agent uses for every read/write in the app. See [references/auth.md](references/auth.md).
2. **Standard Authorization Code flow** — a one-off in `src/routes/callback/+page.server.ts`, used only to discover the tenant ID via a normal user-consent redirect. Separate app registration requirements from (1). See [references/auth.md](references/auth.md) for why both exist.

## Before writing Xero code

- Check the exact MCP tool input schema in [references/mcp-tools.md](references/mcp-tools.md) — the MCP tool's schema is often *simpler* than the raw Accounting API (e.g. `create-contact` only takes `name`/`email`/`phone`, not the full Contact object).
- Resolving a contact → [references/contacts.md](references/contacts.md).
- Drafting an invoice or quote → [references/invoices-quotes.md](references/invoices-quotes.md) — **`accountCode` and `taxType` are required on every line item**, so `list-accounts` and `list-tax-rates` must run before `create-invoice`/`create-quote`.
- This sandbox's (Demo Company UK) real codes: sales income → `accountCode: "200"` (Sales), `taxType: "OUTPUT2"` (20% VAT on Income, ACTIVE). Confirmed live 4 Jul 2026 — re-run `list-accounts`/`list-tax-rates` if the org changes.

## If something here looks stale

`developer.xero.com` is a heavy JS SPA — `WebFetch` reliably times out on it, so don't rely on it for verification. Faster, more reliable sources, in order of preference:
1. The live `mcp__xero__*` tool schemas (`ToolSearch` with `select:mcp__xero__<name>`) — the actual contract the agent calls.
2. `xero-node` SDK model source (ground truth, auto-generated from Xero's OpenAPI spec): `https://raw.githubusercontent.com/XeroAPI/xero-node/master/src/gen/model/accounting/<modelName>.ts` (e.g. `contact.ts`, `invoice.ts`, `lineItem.ts`, `quote.ts`).
3. `xero-mcp-server` README/source: `https://raw.githubusercontent.com/XeroAPI/xero-mcp-server/main/README.md` and `src/clients/xero-client.ts`.

Everything in this skill was verified against these sources (and this project's live sandbox) on 4 Jul 2026.
