# Auth — two flows, two purposes

## 1. Custom Connection (`client_credentials`) — the agent's real auth

Used by `xero-mcp-server` per `.mcp.json`. This is server-to-server: there is **no user redirect, no refresh token**. A fresh access token is requested per session.

- Token endpoint: `POST https://identity.xero.com/connect/token`
- Headers: `Authorization: Basic base64(client_id:client_secret)`, `Content-Type: application/x-www-form-urlencoded`
- Body: `grant_type=client_credentials&scope=<space-separated scopes>`
- Response: `access_token`, `expires_in` (~1800s / 30 min), `token_type` — **no `refresh_token`**; just request a new token when it expires.
- Tenant discovery: `GET https://api.xero.com/connections` with `Authorization: Bearer <token>`. A Custom Connection always resolves to exactly **one** tenant (the org it was authorised against in Xero's UI under My Apps → connected app).
- Setup is done in the Xero UI (My Apps → app → Connections), not via a redirect — there is no `code` param for this flow.

Source: `xero-mcp-server`'s `src/clients/xero-client.ts` (`CustomConnectionsXeroClient.requestToken`), verified 4 Jul 2026.

### Scopes

`.mcp.json` sets `XERO_SCOPES` explicitly, which **overrides** the MCP server's built-in V1/V2 scope fallback entirely — so the V1/V2 tables below don't apply to this project unless `XERO_SCOPES` is unset.

Current `.mcp.json` scopes: `accounting.contacts accounting.contacts.read accounting.invoices accounting.invoices.read accounting.settings accounting.settings.read accounting.payments accounting.payments.read accounting.reports.aged.read accounting.reports.profitandloss.read accounting.reports.trialbalance.read app.connections`

**Verified live 4 Jul 2026:** `list-quotes` and `list-contacts` both succeed against the sandbox with this scope set — no explicit `accounting.quotes` scope is configured, and reads still work. **Not yet verified:** whether `create-quote` (a write) needs a scope this list doesn't have — Xero's granular scopes migration (apps created after 2 Mar 2026) introduced a dedicated `accounting.quotes` scope replacing part of the old `accounting.transactions` bucket. Since this app was created 4 Jul 2026 (after the cutover), **test `create-quote` for real before demoing the quote path** — if it 403s, add `accounting.quotes` (and `accounting.quotes.read`) to `XERO_SCOPES` in `.mcp.json`.

If `XERO_SCOPES` is unset, the MCP server tries these in order (from `xero-client.ts`):

| Custom Connection created | Scopes tried |
|---|---|
| Before 29 Apr 2026 | `accounting.transactions accounting.contacts accounting.settings accounting.reports.read payroll.settings payroll.employees payroll.timesheets` (V1, legacy) |
| From 29 Apr 2026 | `accounting.invoices accounting.payments accounting.banktransactions accounting.manualjournals accounting.reports.aged.read accounting.reports.balancesheet.read accounting.reports.profitandloss.read accounting.reports.trialbalance.read accounting.contacts accounting.settings payroll.settings payroll.employees payroll.timesheets` (V2) |

Neither default list includes Quotes or Payroll timesheets scopes needed for this app's stretch goals — always set `XERO_SCOPES` explicitly rather than relying on the fallback.

## 2. Standard Authorization Code flow — `src/routes/callback`

This is a **separate, one-off** flow implemented in `src/routes/callback/+page.server.ts`. It exists purely to run a normal OAuth2 user-consent redirect once, so Caslean's tenant name/ID can be confirmed and copied into `.mcp.json` as `XERO_TENANT_ID` — it is not used at agent runtime.

- Token endpoint: same `https://identity.xero.com/connect/token`, but `grant_type=authorization_code` with `code` (from the callback query string) and `redirect_uri` (must exactly match what's registered on the app).
- Requires `Authorization: Basic base64(client_id:client_secret)` header (per Xero docs — confirmed in the existing implementation and commit `7c672c7`).
- Requires the developer app to have the **Authorization Code grant type enabled with a redirect URI registered** (`http://localhost:5173/callback` per README-KICKOFF.md) — this is a different app configuration surface than the Custom Connection's client-credentials pair, even though both can use the same Client ID/Secret if the app is dual-mode.
- Response includes `access_token` + (if `offline_access` scope requested) `refresh_token` — this project doesn't currently request `offline_access` or persist a refresh token, consistent with the callback being a one-time discovery step, not ongoing auth.

**Gotcha:** if the Xero app was created as Custom-Connection-only, the Authorization Code flow in the callback route will fail (no redirect/consent screen configured). Confirm in My Apps → app → Configuration that both an OAuth2 redirect URI *and* a Custom Connection are set up if you need both flows.
