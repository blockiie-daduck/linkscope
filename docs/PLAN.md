# Plan

## Phase 0: Validate
- [ ] Check Linktree's current integrations and custom-script policy
- [ ] Decide hosting for the redirect service (Cloudflare Workers + D1 is a cheap fit)

## Phase 1: Redirect tracker MVP
- [ ] `POST /links` to create a slug -> destination mapping
- [ ] `GET /:slug` logs the click (ts, referrer, UA, country, UTM) and 302s
- [ ] Simple dashboard: clicks per link over time, top referrers, device split

## Phase 2: Self-hosted page
- [ ] Static link-in-bio template
- [ ] Linktree public-profile importer
- [ ] Analytics snippet integration (Clarity / Hotjar / PostHog) with consent banner

## Phase 3: Differentiators
- [ ] Funnels and per-source breakdowns
- [ ] A/B link ordering
