## Project Configuration

- **Language**: TypeScript
- **Package Manager**: npm
- **Add-ons**: none

---

# CLAUDE.md — Rise of the Builder (Xero Hackathon)

Working memory + house rules for this project. **Read this first, every session.**

## What we're building

**A conversation-to-invoice agent** for multi-hustle creatives: *"you got the gig, I'll do the paperwork."* Caslean pastes a booking conversation — a promoter's email, an agency DM, a call transcript — and the agent extracts client, date, rate and deliverables; resolves the contact in Xero (creating it if new, after approval); drafts the invoice (or quote); and, after one-tap human approval, writes it to Xero and verifies it landed.

Persona: **Caslean** — musician, Depop seller, model. Three income streams, bookings arriving via email, DMs and calls, zero appetite for admin. Real person, real books, real nightmare.

Working title: **[TBD]**

- **Bounty:** 01 — The Small Business Productivity Powerhouse (automate a painful workflow, give owners hours back).
- **Form factor:** an *agent* doing the work, inside an *app* that makes it trustworthy. Human-in-the-loop on every irreversible action.

## The rubric drives every decision

| Weight | Criterion | What it means for us |
|---|---|---|
| **50%** | Xero Connection | Distinctive on-ramp nobody else will demo: unstructured human mess in, correct ledger entries out. Caslean is a real named user. |
| **30%** | API Integration | Read + **write** Contacts and Invoices/Quotes; verify writes by re-reading. The agent acts on the ledger. |
| **20%** | Architecture | Extraction-with-reasoning + approval gate + audit log + "asks, never guesses" = financially trustworthy. |

Not scored: visual polish, animation, feature breadth, inbound-channel plumbing. Depth beats prettiness. When trading off, **protect 50% first, then 30%, then 20%.**

## Scope ladder (strict order)

1. **Core (must ship):** paste conversation → extract → resolve contact → draft invoice → approve → write to Xero → verify → audit log.
2. **Stretch 1:** the chase skill — nudge overdue invoices, reusing the same approve/audit skeleton.
3. **Stretch 2:** Postmark/Mailgun inbound address — forward an email instead of pasting.
4. **Roadmap only (pitch lines, zero build):** Zoom/Meet transcript ingestion, per-stream income summary, tax-prep breakdown, projections.

**Out this weekend:** Gmail OAuth, live call audio, WhatsApp/Instagram APIs, bank feeds, reconciliation, tax filing, dashboards beyond a simple list, multi-org auth, mobile.

## Key design decisions (de-risk)

- **The channel is just transport.** Core input is a paste box — true to Caslean's life (DMs have no API anyway) and immune to live-demo flakes. Transcripts are just text: a pasted Zoom transcript is a first-class demo beat.
- **The agent asks, never guesses.** Missing rate? Ambiguous client? It poses the question instead of inventing data. This is a trust feature, demo it proudly.
- **Fallback floor:** if write-actions aren't reliable by the checkpoint, ship the "drafting assistant" — same extraction + reasoning, human copies the draft into Xero. A solid app scores; a broken agent doesn't.

## Stack

- **Sandbox:** Xero Demo Company + free developer app (Starter tier fine for build/demo).
- **Agent hands:** Claude (LLM) + Xero MCP Server (`@xeroapi/xero-mcp-server`, configured in `.mcp.json`).
- **App shell:** SvelteKit (default) for paste box + approval + audit UI.
- Keep it demoable on a laptop. No fragile infra.

## Development setup

**Prerequisites:** Node 18+, Xero sandbox credentials (Client ID/Secret in `.env` — already populated).

**First time only:**
```bash
npm create svelte@latest . # SvelteKit scaffold, choose options for TypeScript + Prettier
npm install
# Verify MCP connection: cat .mcp.json; env vars in .env should be auto-loaded
```

**Development loop:**
```bash
npm run dev          # SvelteKit dev server (localhost:5173)
npm run build        # Production build
npm run preview      # Preview production build
npm run lint         # Lint TypeScript
npm test             # Run tests (once suite exists)
```

**Testing the MCP connection:**
Before starting the UI, verify the Xero MCP Server is wired up:
```bash
# In Claude Code or a Xero-agent context, run: list-contacts
# Should return your seeded sandbox contacts from mock-data/
```

**Xero sandbox:** Demo Company credentials are in `.env`; use these in the MCP Server. Check that `XERO_CLIENT_ID` and `XERO_CLIENT_SECRET` are non-empty before starting Phase 0. [Sync details with README-KICKOFF.md for exact auth flow if unclear.]

## Code structure (post-scaffold)

Once scaffolded, the layout will be:
- `src/lib/agent/` — LLM extraction, contact resolution, invoice drafting. Structured JSON contracts live here.
- `src/lib/xero/` — MCP tool wrappers, Xero API calls (list-contacts, create-invoice, verify reads).
- `src/lib/types.ts` — shared types: `Extraction`, `Proposal`, `AuditEntry` — keep this canonical.
- `src/routes/+page.svelte` — paste box entry point.
- `src/routes/approve/+page.svelte` — proposal review (diff view) + questions gate.
- `src/routes/audit/+page.svelte` — read-only audit log view.
- `src/lib/store.ts` — session state: current extraction, proposal, audit trail.
- `mock-data/` — unchanged; used for manual testing and as reference in comments.

**No `/api/` routes** — the agent runs *inside* Claude Code (or as a library within the SvelteKit app). The Xero MCP Server is an external tool, not an API endpoint.

## Testing strategy

- **Unit:** extraction contract validation (given JSON, does it match the schema?). [Add once schemas are locked.]
- **Integration:** mock-data conversations → extraction → proposal. No Xero write.
- **E2E smoke test:** seed 3 sandbox contacts, extract a conversation, resolve them, propose an invoice. This runs in Phase 0 to confirm MCP wiring works.
- **Edge case manual (Phase 4):** vague rate, duplicate, unknown client, multi-item, noise — all in `mock-data/conversations/`; run against extraction logic to ensure questions are raised, not guesses.

## Working agreements

- **One thing at a time.** Work the current Active task in TASKS.md; don't sprawl.
- **Atomic commits** after each working slice; present-tense messages. Examples: `Add paste box UI`, `Extract client and line items from conversation`, `Wire up Xero contact resolution`, `Verify create-invoice API call`. Not: "work on agent" or "fix stuff".
- **British English** everywhere — UI copy, docs, invoices. Spell-check before committing.
- **Verify, don't fabricate.** Confirm exact Xero endpoint/field/tool names against developer.xero.com and the live MCP tool list before relying on them. If unsure, say so.
- **Ask before anything irreversible** — creating a contact, writing an invoice, sending anything. Never auto-write, in the demo or against real data.
- **Concise over verbose.** Show the decision/diff, not an essay. Commit message should be 1–2 lines; detailed rationale goes in ARCHITECTURE.md or a comment, not the commit body.

## Definition of done (submission)

- The agent completes the full loop live: paste one mock conversation → approved invoice visible in the Xero sandbox, no manual code edits mid-demo.
- Every ledger write passes through the approval gate.
- An audit log records what the agent did and *why* — including questions it asked and drafts that were rejected.
- A 2-minute demo runs start-to-finish, with a recorded backup clip.

## Key facts & links

- Event: Rise of the Builder — Xero App & Agent Hackathon, Encode Hub, **4–5 July**.
- Xero dev: developer.xero.com · Agent toolkit: github.com/XeroAPI/xero-agent-toolkit · MCP server: github.com/XeroAPI/xero-mcp-server
- Companion files: **TASKS.md** (plan) · **ARCHITECTURE.md** (design) · **PITCH.md** (demo) · **mock-data/** (Caslean's world: conversations + sandbox seed).

## Debugging & troubleshooting

**MCP Server not connecting:**
- Check `XERO_CLIENT_ID` and `XERO_CLIENT_SECRET` in `.env` are non-empty.
- Verify the Custom Connection app exists at developer.xero.com and is authorised against the Demo Company.
- Run `npx @xeroapi/xero-mcp-server@latest` locally to see actual error output; look for OAuth timeouts or invalid credentials.

**Xero API field names don't match ARCHITECTURE.md:**
- Tool schemas change. Before relying on a field name, confirm it in the *live* tool output: `list-contacts` first line says what fields are available.
- Update ARCHITECTURE.md immediately if there's a mismatch.

**Extraction contract failing validation:**
- Schema is in `src/lib/types.ts`. If JSON has missing required fields or wrong types, validation will fail loudly (by design — this is a trust feature).
- Check the LLM prompt in `src/lib/agent/extract.ts` — if it's not following the schema, add an example or reframe the instruction.

**Duplicate detection false positives:**
- Fuzzy matching uses name + date + amount. If the same contact has a legitimately similar invoice on the same date, it may flag as duplicate. The agent should ask before proceeding (not our bug — it's the "asks, never guesses" philosophy).

## Current status

_Update at the end of each session: what's done, what's next, any blocker._

- Product locked: conversation→invoice core, chase as stretch. Docs + mock conversations ready. Next: Phase 0 — Xero sandbox credentials + MCP connection. Checkpoint clock not yet set — set it the moment Phase 0 starts.
