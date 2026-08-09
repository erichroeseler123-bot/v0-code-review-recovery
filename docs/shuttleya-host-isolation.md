# ShuttleYa host isolation

## Problem

The shared hostname middleware rewrote only the root path for `shuttleya.com`. Deeper human-facing routes such as `/about` fell through to the shared application and could expose Destination Command Center pages under the ShuttleYa hostname.

## Intended public surface

ShuttleYa is a direct-service site. Its human-facing public surface is intentionally small:

- `/` — ShuttleYa storefront
- `/book/argo-shuttle` — Argo booking flow

Shared DCC pages must not render on the ShuttleYa hostname.

## Middleware behavior in this branch

- `/` rewrites internally to `/s/shuttleya`.
- `/book/argo-shuttle` continues normally.
- Other human-facing paths redirect permanently to `/`.
- `/api/*`, Next internals, favicon, and static assets continue to bypass hostname routing through the middleware matcher.
- Other mapped brand domains keep their existing behavior.

## Production deployment gate

The live `v0-shuttleya` Vercel project is currently CLI-deployed rather than Git-connected. Merging this branch alone does **not** change production.

Before deploying to `v0-shuttleya`:

1. Use the exact source checkout that currently deploys that Vercel project.
2. Apply the middleware change from this branch without replacing the working ShuttleYa storefront, booking page, Square API routes, order routes, webhooks, or environment configuration.
3. Build locally.
4. Deploy a preview to the existing `v0-shuttleya` project.
5. Verify `/` and `/book/argo-shuttle` still work.
6. Verify `/about`, `/contact`, `/cities`, `/tours`, `/transportation`, and another arbitrary human path do not render shared DCC content and instead resolve to the ShuttleYa root.
7. Verify `/api/square/create-payment` and existing Argo API/webhook routes are not redirected by middleware.
8. Only then deploy to production and re-check `shuttleya.com` and `www.shuttleya.com`.

Do not move the domains to another Vercel project as part of this fix.
