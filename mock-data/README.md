# Mock data — Caslean's world

Caslean: musician + Depop seller + model. Bookings arrive by email, DM, and calls. **conversations/** are the demo inputs (pasted into the app). **contacts.csv** and **invoices.csv** get seeded INTO the Xero sandbox via MCP in Phase 0. (`bank-statement.csv` is obsolete — left over from the reconciliation pivot; ignore or delete.)

## ⚠️ Sandbox state as of 5 Jul 2026 — check before demoing

- **INV-0050** (The Velvet Room Ltd, 17 Jul, £420, ref "The Velvet Room — 2026-07-17") is currently **AUTHORISED** in the sandbox — a leftover from testing conversation `01`. **Pasting `01-venue-email.txt` now will trigger a duplicate warning** against this invoice (same contact, same date, same total). Either void/delete INV-0050 in the Xero UI before demoing for a clean happy-path run, or keep it and use `01` as an extra duplicate-detection beat instead of the clean happy path.
- **INV-101** (`INV-0046`, Velvet Room, £420, due 2026-08-03) and **INV-102** (`INV-0047`, Brightside, £150, due 2026-08-03) are both still **DRAFT** and **not overdue** relative to today (5 Jul 2026) — the earlier plan to backdate INV-101's due date for the Stretch-1 chase-skill demo was never done. Irrelevant unless Stretch 1 gets built.
- Every approved test invoice from development testing has been deleted except INV-0050 above. Do a final sweep in the Xero UI before a live demo — search "DELETE ME" and any duplicate-looking test entries are safe to ignore (already void/deleted), but double-check nothing unexpected accumulated.

## Demo bank — one table, all six scenarios

| # | File | Client | Scenario | Expected result | What it proves |
|---|---|---|---|---|---|
| 01 | `01-venue-email.txt` | The Velvet Room Ltd (existing) | £350, 17 Jul, 14-day terms | Clean extraction, no questions → contact matched (exact) → **duplicate warning if INV-0050 still exists** → approve → £420 invoice written | The happy path — *clean only if INV-0050 is voided first* |
| 02 | `02-agency-dm.txt` | Halliday Model Management (existing) | £600 day rate + £120 usage, 30-day terms | Two line items (not one blob), £720 subtotal / £864 with VAT → clean approve | Multi-item extraction; DM as a channel |
| 03 | `03-zoom-transcript.txt` | Brightside Studios (existing) | £275 session, Thu 9 Jul | Clean extraction despite filler words and speaker labels; provenance still traces to the real quote | Transcripts are just text — the "any channel" story |
| 04 | `04-vague-dm.txt` | The Velvet Room Ltd (existing) | "usual arrangement?", no amount stated | `unit_amount: null`, **2 open questions** (fee, year confirmation) — approve button is disabled, and the server rejects a direct write attempt too | **Asks, never guesses** — the trust beat |
| 05 | `05-duplicate.txt` | The Velvet Room Ltd (existing) | Re-confirmation of the same 17 Jul gig as `01` ("just confirming", "as agreed", "running order attached") | Clean extraction, but `duplicate_suspects` flagged from the LLM *and* a live Xero duplicate match if `01`/INV-0050 already exists — approving would double-invoice | Never double-invoice, two independent duplicate signals |
| 06 | `06-new-client.txt` | Nightshade Festival (**not in Xero**) | £450 festival slot, 8 Aug, 30-day terms | Clean extraction, no questions → resolves to `status: "new"` → approving creates a brand-new Xero contact + invoice in one action | Unknown client → propose contact creation |

Recommended **2-minute pitch order** (matches PITCH.md): **02** (impressive multi-item) → **04** (trust beat: asks, never guesses) → approve 02 live, show it land in Xero with the reasoning in the invoice history.

**If judges want more** (Q&A / deeper demo): **06** for the new-contact moment, **05** for duplicate detection, **01**/**03** as backup/rehearsal material.

---

## Copy-paste text (for zero-friction live pasting)

### 01 — Venue email (happy path)
```
From: Marta Reyes <bookings@thevelvetroom.example>
To: Caslean
Subject: Re: Friday 17th — confirmed

Hi Caslean,

Great news — confirming you for the Friday 17 July residency slot, 9pm set.
Fee as discussed: £350, payable within 14 days of the gig. Invoice to this
address, marked for the attention of accounts.

Backline provided, soundcheck 6pm.

Best,
Marta
The Velvet Room
```

### 02 — Agency DM (multi-item)
```
[Instagram DM — Halliday Model Management]

halliday.mgmt: Hi Cas! Campaign shoot confirmed for Mon 20 July, studio day
halliday.mgmt: Day rate £600 as per your card, plus £120 usage (12 months, UK digital)
halliday.mgmt: Invoice us the full £720 as usual, 30 day terms — we sort our commission our end
caslean: amazing!! see you monday 🖤
halliday.mgmt: Call sheet to follow. Don't forget the invoice this time 😅
```

### 03 — Zoom transcript (noise)
```
[Zoom transcript — Brightside Studios call, 3 July 2026, 14:12]

Dom (Brightside): ...so yeah, the topline session, we're thinking Thursday the 9th if you're free?
Caslean: Thursday works, yeah. Afternoon?
Dom (Brightside): Perfect, um, 1 till 5. And we said £275 for the session, right, flat?
Caslean: £275, yep. Same as the last one.
Dom (Brightside): Cool cool cool. Just invoice the studio as usual, accounts will sort it end of month.
Caslean: Great, I'll send it over after the session.
Dom (Brightside): Legend. Okay I've got another call, see you Thursday.
```

### 04 — Vague DM (asks, never guesses)
```
[WhatsApp — Marta, The Velvet Room]

Marta: Cas! One of Friday's acts dropped out, 24th. Any chance you could do the acoustic slot?
Caslean: yes!! love that slot
Marta: You're a lifesaver. Usual arrangement?
Caslean: perfect 🙌
Marta: Great, 8pm, keep it to 40 min. See you then x
```

### 05 — Duplicate
```
From: Marta Reyes <bookings@thevelvetroom.example>
To: Caslean
Subject: Friday 17th — running order

Hi Caslean,

Just confirming everything's set for your 9pm slot this Friday the 17th —
running order attached. As agreed, £350 for the set, invoice whenever suits.

See you at soundcheck!

Marta
The Velvet Room
```

### 06 — New client (unknown contact)
```
[Instagram DM — Nightshade Festival]

nightshade.fest: Hey Cas! Caught your Velvet Room set, would love you for the
festival — Sat 8 Aug, 6pm slot, 45 min
caslean: omg yes!! I'm in
nightshade.fest: Amazing. Fee's £450, you invoice us, 30 days from the show
date
caslean: perfect, I'll send it over after
nightshade.fest: See you there!
```

---

## Sandbox seed (via MCP, Phase 0)
- 3 contacts pre-seeded: The Velvet Room Ltd, Halliday Model Management, Brightside Studios — enables the contact-resolution and duplicate-check demos out of the box.
- INV-101 (`INV-0046`) and INV-102 (`INV-0047`) — see the sandbox-state warning above; both DRAFT, both due 2026-08-03, neither currently overdue.
- Nightshade Festival deliberately does **not** exist as a contact — that's the point of `06`.

## Sanity check (fresh sandbox, all six approved in order, INV-0050 voided first)
- 01: £420 total (£350 + VAT)
- 02: £864 total (£720 + VAT)
- 03: £330 total (£275 + VAT)
- 04: total depends on the answered fee — not approvable until a rate is confirmed
- 05: **creates nothing** — duplicate of 01, should be rejected
- 06: £540 total (£450 + VAT), plus one new contact created
- Five new invoices (01, 02, 03, 04 once answered, 06), one new contact (Nightshade Festival), one rejected duplicate (05).
