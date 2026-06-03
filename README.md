# DCC Network — Unified Storefront Engine

Complete rebuild of the DCC Network as a single Next.js application handling all markets: Welcome to Alaska Tours, Welcome to the Swamp (NOLA), Welcome to the Dells, GoSno, Shuttleya, Blue Hills, Feastly Spread, and Party at Red Rocks.

## Architecture

**One codebase, multiple storefronts** — routes via `/s/[market]/`:
- All markets share the same UI engine and checkout shell
- Each market configures its own booking provider (FareHarbor for WTA/Alaska, Viator/GetYourGuide for affiliates, custom for your own products)
- Styling adapts per market (accent hue, trust badges, hero images)

## Markets

- **`alaska`** (Welcome to Alaska Tours) — FareHarbor API, on-site checkout, cruise-port excursions
- **`new-orleans`** (Welcome to the Swamp) — Viator handoff, swamp tours + NOLA experiences
- **`last-frontier`** — Viator handoff, vetted Alaska shore excursions
- **`dells`** — GetYourGuide handoff, Wisconsin Dells group trips
- **`gosno`** — Custom booking (Neon + Stripe), private Denver→resort transfers
- **`shuttleya`** — Custom booking, Mighty Argo shuttle service
- **`parr`** — Party at Red Rocks (protected, not in engine)

## Data Sources

### Images
- **FareHarbor tours** (WTA/Alaska) — fetch from FareHarbor API in real-time via `getTourImageUrl()` server action
- **Affiliate tours** (NOLA, Dells, Last Frontier) — real photos in `/public/nola/`, `/public/dells/`, etc.
- **Custom products** (GoSno, Shuttleya) — placeholder images, can add real ones
- All images are **non-AI, real photographs** to avoid misleading users

### Tours
- Defined in `lib/tours.ts` with provider references (FareHarbor itemIds, Viator URLs, etc.)
- Markets filter tours by `marketId`
- Custom booking tours stored in Neon database

## Default Settings

- **Quantity/Travelers**: Default to **1** (set in `tour-booking-panel.tsx`)
- All sites use consistent styling: flexbox layouts, Tailwind typography, market-specific accent colors

## Key Files

- `lib/markets.ts` — Market configurations (provider, hero, trust badges, coordinates)
- `lib/tours.ts` — Tour catalog with provider references
- `app/s/[market]/page.tsx` — Market homepage
- `app/s/[market]/tours/page.tsx` — Tours listing
- `components/tour-card.tsx` — Tour card (fetches FareHarbor images dynamically)
- `app/actions/tours.ts` — Server action for FareHarbor image fetching
- `app/api/auth/[...all]/route.ts` — Better Auth handler for custom bookings

## Database

**Neon PostgreSQL** with Better Auth tables + custom booking schema:
- `bookings` — central booking record
- `gosno_bookings`, `shuttleya_bookings`, `blue_hills_bookings`, `feastly_bookings`, `parr_bookings` — product-specific details
- `marketplace_profiles` — Feastly Spread caterer info
- `user`, `session`, `account`, `verification` — auth

## Checkout Flow

- **On-site markets** (FareHarbor, custom) → add to cart → Stripe checkout
- **Handoff markets** (Viator, GetYourGuide) → "Book on [partner]" link → external site

## Deployment

Ready to deploy. Point domains to this unified app:
- welcometoalaskatours.com → `/s/alaska`
- welcometotheswamp.com → `/s/new-orleans`
- gosno.co → `/s/gosno`
- etc.

All routing handled by market ID.
