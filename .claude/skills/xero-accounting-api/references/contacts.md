# Contacts — resolution reference

Source of truth: `xero-node` SDK `Contact` model (`src/gen/model/accounting/contact.ts`, XeroAPI/xero-node), cross-checked against live `list-contacts` output from this project's Demo Company sandbox (55 contacts, 4 Jul 2026).

## Fields relevant to resolution/dedupe

Raw Accounting API field names (PascalCase on the wire, camelCase in the SDK/most tool responses):

- `ContactID` (GUID) — the stable identifier; always match on this once resolved, not on name.
- `Name` — full name of contact/organisation, max 255 chars. This is what `searchTerm` on `list-contacts` matches against, along with `FirstName`, `LastName`, `ContactNumber`, `EmailAddress`.
- `EmailAddress` — max 255 chars, umlauts not supported.
- `ContactStatus` — enum `ACTIVE | ARCHIVED | GDPRREQUEST`. Filter out non-`ACTIVE` contacts when fuzzy-matching for resolution.
- `IsCustomer` / `IsSupplier` — booleans, **read-only**, auto-set by Xero when an AR/AP invoice is created against the contact. Don't try to set these on create/update.
- `UpdatedDateUTC` — useful for showing "last activity" in the resolution UI.

## What the MCP tool actually exposes

The live `create-contact`/`update-contact` tool schemas are much narrower than the full Contact object above:

- `create-contact`: `name` (required), `email`, `phone`.
- `update-contact`: `contactId`, `name` (both required — must resend `name` even if unchanged), plus optional `email`, `phone`, `firstName`, `lastName`, `address` (needs at least `addressLine1`).

There is no way to set `ContactNumber`, tax number, default account codes, or tracking categories via these MCP tools — if Caslean's contact needs those, it has to be done manually in the Xero UI, not through the agent.

## Duplicate/fuzzy-match notes

`list-contacts` with `searchTerm` does the fuzzy matching server-side (case-insensitive substring across Name/FirstName/LastName/ContactNumber/EmailAddress) — prefer this over pulling the full list and matching client-side, except when doing exhaustive duplicate-invoice checks (which needs the full picture, not just name matches).
