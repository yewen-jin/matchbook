# Mock data — Caslean's world

Caslean: musician + Depop seller + model. Bookings arrive by email, DM, and calls. **conversations/** are the demo inputs (pasted into the app). **contacts.csv** and **invoices.csv** get seeded INTO the Xero sandbox via MCP in Phase 0. (`bank-statement.csv` is obsolete — left over from the reconciliation pivot; ignore or delete.)

## Expected agent behaviour per conversation (the demo script, in data form)

| Input | Expected outcome | Case it proves |
|---|---|---|
| `01-venue-email.txt` — Velvet Room, £350, 17 Jul, 14-day terms | Clean extraction → existing contact matched → invoice drafted → approve → written | The happy path, end to end |
| `02-agency-dm.txt` — Halliday, £600 day rate + £120 usage, 30-day terms | **Two line items**, not one blob; full £720 invoiced | Multi-item extraction; DM as channel |
| `03-zoom-transcript.txt` — Brightside, £275 session, Thu 9 Jul | Clean extraction despite filler/speaker labels; provenance shown | **Transcripts are just text** — the voice story |
| `04-vague-dm.txt` — Velvet Room, "usual arrangement?", no amount | Agent **asks** ("what's the usual rate for an acoustic slot?") — proposal blocked until answered. Bonus: infer £150–£350 range from history, still confirm | **Asks, never guesses** — the trust beat |
| `05-duplicate.txt` — re-confirmation of the same 17 Jul gig as 01 | **Duplicate flagged** (same client + date + amount as invoice from 01) — no second invoice | Never double-invoice |

Suggested demo order: 02 (impressive) → 04 (trust) → approve + show Xero live. 01/03/05 are rehearsal + backup-clip material.

## Sandbox seed (via MCP, Phase 0)
- 3 contacts (Velvet Room, Halliday, Brightside) — enables contact resolution + fuzzy matching.
- INV-101 Velvet Room £420, due 26 Jun — **deliberately overdue**: fuel for the chase-skill stretch.
- INV-102 Brightside £150, due 28 Jul — open/current: background noise for duplicate checks.

## Sanity checks
- After demoing 01, 02, 03 and answering 04 (£150 assumed): 4 new invoices totalling £1,495; 05 creates nothing.
- Open ledger after all approvals: 6 invoices, £2,065 outstanding, 1 overdue (INV-101).
