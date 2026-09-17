# Product

<!-- impeccable:product-schema 1 -->

## Platform

adaptive

## Users

Adults of legal drinking age ordering liquor and snacks for personal, same-night consumption, browsing and buying from home late at night when regular stores are closed. Operating region is inferred from product copy ("the valley's elite late-night society") and the Nepali loyalty program name (CLUB घ्याम्पे) to be Kathmandu Valley, Nepal — not explicitly confirmed by the user.

## Product Purpose

RAKSHIMANDU is a liquor-and-snacks delivery service open 24/7, so customers can get alcohol and pairings delivered any time of night rather than being limited to store hours. Success is a fast delivery (site currently advertises "~22 min") completed after age verification, with the customer coming back via the loyalty program.

## Positioning

Speed and always-open availability are the primary differentiator versus a generic delivery app or a nearby physical liquor store — being the option that's still open and fast at 2am, not the cheapest or most curated. Curated liquor+snack pairings and the loyalty club exist as secondary retention hooks, not the core pitch.

## Operating Context

- Delivery is zone-restricted (see `/zones` route) — not available everywhere.
- Mandatory age verification is part of account signup, required for legal liquor sales compliance.
- Order lifecycle: browse catalog → cart → checkout (guest via phone number or logged-in account) → real-time order tracking with assigned driver, through delivery.
- A support/chat channel exists for order or product questions, positioned as important during late-night hours when other help may be unavailable.
- An admin dashboard manages inventory (including age-restricted items), orders, user accounts, and delivery logistics — web-only, not a mobile-app concern.

## Capabilities and Constraints

- Core commerce: product catalog with categories (Spirits, Wine, Beer, Snacks, Bundles, Vapes), cart, checkout, order tracking, loyalty points/rewards, curated liquor+snack "pairings."
- Age-restricted inventory (liquor) must be flagged and gated separately from non-restricted items (snacks) throughout the product.
- The backend is mid-migration: the web app currently runs on Firebase/Firestore and is being moved to Postgres (Supabase) — inventory, orders, and user data will eventually live in one relational database shared by both the website and the mobile app.
- The mobile app (Expo/React Native, `mobile/`) is a new, early-stage companion to the website, intended to read/write the same shared inventory once the backend migration lands. It is not a native wrapper of the website — it has its own native UI.
- Undecided: exact delivery zone boundaries, payment methods beyond what checkout currently lists, and whether the mobile app will eventually get its own admin/driver-facing surfaces.

## Brand Commitments

- Customer-facing storefront brand: **RAKSHIMANDU** (confirmed by user — this supersedes the original Firebase Studio blueprint name "Nightcap Nosh," which may be legacy/internal).
- Loyalty program name: **CLUB घ्याम्पे** (Nepali) — kept as-is, not to be renamed to an English equivalent without the user's say.
- No static logo asset exists yet; the live site currently uses a remote Unsplash placeholder image as a stand-in logo.

## Evidence on Hand

- `docs/blueprint.md` — original Firebase Studio product blueprint (legacy app name and an earlier Deep Amethyst/Dark Plum color direction that the shipped UI has since departed from; treated as historical context, not current design truth).
- Live hero copy in `src/app/page.tsx` ("the valley's elite late-night society," "~22 min" delivery notice).
- No real customer testimonials, case studies, press, or usage metrics exist in the repo — future work must not fabricate any.

## Product Principles

- Always-open, fast delivery is the product's reason to exist — never trade delivery speed framing for a slower but more "premium" feel.
- Age verification and age-restricted-item handling are legal compliance requirements, not optional UX friction to design away.
- Website and mobile app are one product with two faces sharing the same inventory and brand — they should feel like the same service, not two different apps.
- The admin/driver-logistics side of the product is an operator tool (Operate-mode concerns: scanability, task completion), distinct from the customer-facing storefront (Persuade/Operate blend: browsing entices, checkout must be frictionless).

## Accessibility & Inclusion

No product-specific accessibility requirement has been established by the user.
