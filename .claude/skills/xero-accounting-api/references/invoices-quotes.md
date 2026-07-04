# Invoices & Quotes — field reference

Source of truth: `xero-node` SDK models (`invoice.ts`, `lineItem.ts`, `quote.ts`, `lineAmountTypes.ts`, `quoteStatusCodes.ts` — XeroAPI/xero-node, `src/gen/model/accounting/`), cross-checked against live MCP tool schemas and this project's Demo Company (UK) sandbox data. For the MCP tool's actual (narrower) input contract, see [mcp-tools.md](mcp-tools.md) — this file covers the underlying Accounting API model, useful for understanding what Xero returns and what fields exist even if the MCP tools don't expose them all.

## Invoice

- `Type` — enum `ACCREC` (sales/customer invoice — what Caslean issues) `| ACCPAY | ACCPAYCREDIT | APOVERPAYMENT | APPREPAYMENT | ACCRECCREDIT | AROVERPAYMENT | ARPREPAYMENT`. This project only ever needs `ACCREC`.
- `Status` — enum `DRAFT | SUBMITTED | DELETED | AUTHORISED | PAID | VOIDED`. `create-invoice` produces `DRAFT` (or `AUTHORISED`, org-setting dependent — verify which on first live create); `update-invoice` only works on drafts; `create-payment` requires `AUTHORISED`.
- `Contact`, `LineItems[]`, `Date` (YYYY-MM-DD, defaults to today), `DueDate` (YYYY-MM-DD), `LineAmountTypes` (see below), `InvoiceNumber` (auto-generated if omitted), `Reference` (ACCREC-only free text — the only place to stash audit context on the ledger side), `CurrencyCode`, `Total`/`SubTotal`/`TotalTax` (computed), `InvoiceID` (GUID, returned on create — re-read by this ID to verify the write per ARCHITECTURE.md's "Act → Verify" step).

## LineItem

- `Description` (required, ≥1 char), `Quantity`, `UnitAmount`, `AccountCode`, `TaxType` — all required by the MCP `create-invoice`/`create-quote` tools even though the raw API allows `LineAmount` in place of `Quantity`×`UnitAmount`.
- `LineAmount` — if provided instead of Quantity/UnitAmount, Xero computes the missing one: `LineAmount = Quantity × UnitAmount × ((100 − DiscountRate)/100)`. Not exposed by the MCP tool schemas — compute quantity/unitAmount yourself in the extraction step instead.
- `TaxAmount` — auto-calculated from `TaxType`; only override if Xero's calculation is wrong.
- `DiscountRate` / `DiscountAmount` — ACCREC invoices and quotes only, not ACCPAY or credit notes.

## LineAmountTypes

`Exclusive | Inclusive | NoTax` — controls whether `UnitAmount` is tax-exclusive or -inclusive. Not currently exposed by the MCP `create-invoice` tool (defaults apply); if precision matters for a gig rate quoted "inclusive of VAT", compute the exclusive unit amount yourself before calling `create-invoice`.

## This sandbox's real account/tax codes (Demo Company UK, verified live 4 Jul 2026)

For a normal gig/booking sales line item, use:
- `accountCode: "200"` — **Sales** (type `REVENUE`, active, default tax `OUTPUT2`)
- `taxType: "OUTPUT2"` — **20% VAT on Income** (active)

Other active sales-side tax rates in this org if a gig is genuinely reduced-rate or zero-rated: `RROUTPUT` (5% VAT on Income), `ZERORATEDOUTPUT`, `EXEMPTOUTPUT`. Don't use anything marked `PENDING`, `ARCHIVED`, or `DELETED` in `list-tax-rates` output — Xero will reject the write.

Re-run `list-accounts` / `list-tax-rates` if working against a different org — these codes are org-specific, not fixed by the API.

## Quote

- `Status` — `QuoteStatusCodes` enum: `DRAFT | SENT | DECLINED | ACCEPTED | INVOICED | DELETED`.
- `Contact`, `LineItems[]` (same LineItem model as invoices), `Date`, `ExpiryDate`, `QuoteNumber`, `Reference`, `Terms`, `Title`, `Summary`, `LineAmountTypes` (its own `QuoteLineAmountTypes` enum, same values as invoices).
- No `Type` field — quotes aren't ACCREC/ACCPAY typed.
- **Gotcha (see mcp-tools.md):** the MCP `create-quote` tool has no `date`/`expiryDate` param — set expiry via `update-quote` after creating if Caslean's quote needs a visible expiry date.
