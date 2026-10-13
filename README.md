# LinkScope

Hotjar-style insight for link-in-bio pages (Linktree and similar).

Hotjar-type heatmaps and session recordings need a JS snippet running on the page, and Linktree doesn't allow arbitrary script injection. LinkScope works around that in two layers.

## Approach

1. **Click-tracking redirect layer (MVP).** Each link on a Linktree points to `go.<your-domain>/<slug>`. The service logs the click (time, referrer, device, country, UTM) and redirects to the real destination. Works with Linktree as-is, but gives click-level analytics only.
2. **Self-hosted link-in-bio page (upgrade path).** A static page with an embedded analytics snippet (Microsoft Clarity, Hotjar or PostHog) for real heatmaps and recordings. Includes an importer that rebuilds a public Linktree profile.

## Status

Idea / scaffolding. See [docs/PLAN.md](docs/PLAN.md).

## Open questions

- Linktree's current policy on custom scripts and integrations (verify before building).
- Consent handling for recordings (GDPR / CCPA).
- Differentiation vs. Linktree's built-in analytics: funnels, per-source breakdowns, A/B link ordering.

## License

MIT
