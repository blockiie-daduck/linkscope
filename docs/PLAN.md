# Plan

## Goal
A Linktree-simple link-in-bio for small creators (artists, musicians, shop owners) whose differentiator is analytics that help them grow. Creators build their own pages; nobody creates pages for them.

## Phase A: self-serve core, invite-gated
Tests one hypothesis: do per-link and per-source insights change what creators do, and do their numbers improve? Launch to a small invited group (invite codes or waitlist) so abuse risk stays controlled.

### Creator flow
1. Sign in with email (magic link), enter an invite code the first time.
2. Claim a handle (`/<handle>`).
3. **Import** a Linktree (paste the URL; page is created automatically) or **start blank**.
4. Edit in a simple **form editor** with a live phone preview: add/remove/reorder links (up/down), title, URL, shape (rounded rectangle / rounded square), content (text / icon / icon+text), icon or emoji, colors, theme preset, Spotify block.
5. Publish; share the page and per-platform **tagged links**.
6. See own analytics in the dashboard behind the same login.

### Scope
**In**
- Accounts: email magic-link login, sessions, invite codes, handle claim with reserved-word list.
- Editor (form + live preview), Linktree importer (button + CLI), profile validation.
- Page renderer (<50 KB, accessible, light/dark), shapes, built-in icons + emoji, theme presets, Spotify click-to-load facade.
- Tracker (~3 KB, sendBeacon): views, per-link impressions and clicks, scroll depth, session in `sessionStorage`, no cookies, IP never stored, country from `request.cf`, DNT/GPC honored.
- Attribution: referrer, UTM, in-app browser detection (Instagram/TikTok/Facebook/X), tagged-link generator.
- Dashboard (per account, login-protected): per-link CTR, sources, devices, countries, time series, low-traffic caveat.
- Plain-English insights per account, shown in the dashboard; weekly email digest once email sending is set up.
- Minimum safety: reserved handles, URL scheme validation, link scanning (Google Safe Browsing) on save, report button, rate limits on login/ingest/save, account suspension flag.
- `account_id` on every table and query.

**Out until the hypothesis holds**: custom domains, email-signup/tip/events/store-preview widgets, drag-and-drop editor, AI-assisted setup, click heatmap, rage/dead clicks, A/B tests, session replay, revenue attribution, billing.

### Architecture
Cloudflare Workers + D1 + static assets; path-based handles.
```
src/
  worker.mjs          # routes: /:handle, /e, /auth/*, /app (editor + dashboard), /api/*
  auth.mjs            # magic links, sessions, invites, handle claim
  profile.mjs         # validation/normalisation (done in PR #1)
  render.mjs          # profile -> HTML
  icons.mjs  spotify.mjs
  tracker.mjs         # served at /t.js
  attribution.mjs     # source classifier + tagged links
  stats.mjs  insights.mjs
  safety.mjs          # Safe Browsing check, rate limits, report handler
  app/                # editor + dashboard (vanilla JS, mobile-first)
  import-linktree.mjs # public linktr.ee page -> profile
schema.sql  wrangler.toml  test/
```
Tables: `accounts`, `invites`, `magic_links`, `sessions`, `pages` (blocks inside `profile_json`), `events`, `reports`.

### Steps
1. Scaffold + profile model (PR #1).
2. `icons.mjs`, `spotify.mjs`, `render.mjs`, local dev server, page preview.
3. Auth: magic link (logged to console in dev), sessions, invites, handle claim.
4. Editor API + form editor with live preview; Linktree import button + CLI.
5. Tracker + ingest + attribution + tagged links.
6. Dashboard + stats + insights.
7. Safety minimum (scanning, report, rate limits, suspension).
8. Email sending (magic links in production, weekly digest).
9. Docs: README, privacy notice template, deploy guide.
10. Pilot with invited creators; measure success (see below).

### Success metrics
Creators who finish setup (page published), who return to the dashboard, who change link order/labels after an insight, and CTR change over the first weeks.

### Verification
- `npm test`: tenant isolation, auth flows (expired/reused link, invalid invite), profile validation, XSS escaping, attribution classifier, ingest validation, aggregation queries, insights rules, importer fixture.
- Local run: sign up, import and edit a page, visit it, confirm events and dashboard numbers; mobile width and dark mode; DNT sends nothing.
- Deploy only after go-ahead (Cloudflare account; email provider for production).

## Later phases
Widgets (email signup, tip jar, tour dates, Etsy/Shopify store preview), drag-and-drop editor, AI-assisted setup, click heatmap + rage/dead clicks, A/B tests, session replay, Shopify revenue attribution, custom domains, paid tier.
