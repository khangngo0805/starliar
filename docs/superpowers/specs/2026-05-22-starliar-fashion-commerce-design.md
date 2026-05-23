# Starliar Fashion Commerce Design

## Summary

Starliar needs a first-release fashion commerce website for a unisex clothing
brand. The site should borrow the campaign-first pacing and full-viewport media
impact of Gentle Monster while establishing Starliar as its own cold,
minimalist, futuristic brand.

The first release must do more than present the brand. It must support a real
shopping flow with products, variants, cart, checkout, payment status, order
confirmation, and a basic admin area for product and order operations.

## Chosen Approach

Use a cinematic storefront with a focused commerce backend.

This approach wins because the first release is intended to make a strong visual
impression before it behaves like a dense catalog. It keeps the homepage and
campaign surfaces editorial and media-led, while still giving the buying flow
clear commerce boundaries and operational support.

## Brand And Visual Direction

Starliar should feel:

- cold, minimalist, futuristic, and slightly mysterious;
- premium and editorial rather than crowded or promotional;
- visually close in pacing to the provided Gentle Monster reference without
  copying its identity.

The visual system should use strong media, restrained typography, crisp
contrast, generous negative space, and precise interaction states. Commerce UI
must stay legible and efficient: search, account, cart, size selection, payment
states, and admin controls should be clear even when the storefront surfaces are
quiet and cinematic.

Starliar differentiates itself through unisex clothing imagery, its own
collection naming and copy, its own typography and palette decisions, and
product-focused media slots that can later accept real campaign and product
assets.

## Homepage Experience

The homepage opens with the provided Starliar brand video as a full-bleed hero.
The first viewport includes:

- overlay navigation with `STARLIAR` as a strong brand signal;
- shop and campaign navigation;
- search, account, and cart access;
- an opening collection title;
- two calls to action: shop the collection and view the campaign;
- a visible hint of the next section below the hero.

After the hero, the homepage flows through:

1. New arrivals or featured drop products.
2. A campaign block using editorial media with minimal copy.
3. Category entry points for unisex clothing such as outerwear, tops, bottoms,
   and accessories.
4. A selected product grid with product media, price, and variant-aware entry
   points.
5. A minimal footer with shipping, returns, contact, social, and policy links.

## First-Release Screens

The first release includes:

- home;
- shop listing by collection and category;
- product detail;
- cart;
- checkout;
- payment result states;
- order confirmation;
- basic admin sign-in;
- admin product management;
- admin order list and order detail.

## Product And Campaign Content

The initial build does not depend on final product photography or final product
copy. Until those assets exist, the design uses intentional placeholder product
and campaign media that match the Starliar visual direction instead of generic
blank blocks.

The content model should leave campaign media and product media replaceable so
real launch assets can be swapped in without restructuring the storefront.

## Architecture

The system is split into three bounded areas.

### Storefront

The storefront renders the public shopping experience. It reads product,
collection, campaign, cart, and order-facing data through defined backend
interfaces rather than hardcoding product data into UI components.

### Commerce Backend

The backend owns products, product variants, collections, basic inventory,
orders, order items, payment attempts, and payment status transitions.
Checkout creates an order before starting a payment flow.

Payment integration should use a provider boundary so the first Vietnamese
payment integration does not force checkout to be rewritten when an
international payment method is added later.

### Admin

The admin area requires authentication and supports the first operational loop:

- create, edit, publish, and hide products;
- manage product media, sizes, prices, and basic stock;
- inspect orders, payment state, and shipping information;
- manage the campaign media needed by the homepage at a basic level.

## Core Data Model

The first release centers on these entities:

- `Product`
- `ProductVariant`
- `Collection`
- `CampaignMedia`
- `Cart`
- `Order`
- `OrderItem`
- `Payment`
- `AdminUser`

The model deliberately excludes wishlist, reviews, loyalty, advanced promotions,
recommendation engines, multi-warehouse inventory, and a large general-purpose
CMS.

## Purchase Flow

The buyer flow is:

1. Browse the homepage, collection, or category.
2. Open a product detail page.
3. Select size and quantity.
4. Add the item to cart.
5. Enter shipping and contact information in checkout.
6. Choose an available payment method.
7. Complete payment through the selected QR or payment-provider flow.
8. Return to a payment result and order confirmation experience.

Orders remain recorded when payment fails, is canceled, or is still pending so
admin users can understand the checkout outcome.

## Payments

The first release prioritizes Vietnamese payment behavior while leaving the
checkout architecture open for international payment expansion.

QR payment is a primary checkout option for Vietnamese buyers. The checkout
creates an order and payment attempt before displaying or redirecting into the
QR payment flow. The QR must be tied to the order amount and payment reference
needed to reconcile the transaction.

Payment completion must be confirmed server-side through the selected
provider's callback or webhook mechanism. A browser redirect alone is not enough
to mark an order paid.

The first provider decision should favor a Vietnamese web-payment option that
supports QR payment and reliable payment status confirmation. If the selected
provider also supports local card or bank payment methods, those can share the
same checkout surface. International payment rails are a later extension unless
the chosen provider already supports them cleanly.

For buyers outside supported payment coverage, checkout must communicate the
available payment methods honestly instead of implying every country and method
is supported.

## Error Handling

The storefront must handle:

- unavailable or invalid product variants;
- cart quantities that exceed available stock;
- invalid checkout fields;
- payment pending, success, failure, cancel, callback retry, and duplicate
  callback cases;
- missing media fallbacks that preserve layout quality.

Payment status updates should be idempotent so repeated provider notifications
do not duplicate fulfillment-visible order effects.

## Testing And Verification

The implementation plan should include focused verification for:

- responsive hero video, overlay navigation, and CTA layout on desktop and
  mobile;
- product variant selection and cart totals;
- checkout validation and order creation;
- QR payment flow boundaries and payment status handling;
- payment success, failure, pending, and duplicate callback behavior;
- admin authentication and product/order operations;
- a storefront smoke flow from home to order confirmation.

## Out Of Scope

The first release does not include:

- automated shipping carrier integrations;
- advanced coupon or promotion rules;
- full multilingual content management;
- accounting-grade multi-currency support;
- wishlist;
- product reviews;
- loyalty programs;
- advanced analytics;
- recommendation systems.

## Open Risks

- Final product photos, campaign assets, and product copy are not available yet,
  so placeholders must be designed carefully and replaced before launch.
- The exact Vietnamese QR-capable payment provider is still a planning and
  implementation decision. The architecture must keep that dependency isolated.
- The brand reference intentionally stays close to Gentle Monster's pacing, so
  execution must preserve Starliar-specific typography, copy, imagery, and
  product structure to avoid feeling derivative.

## Next Skill

After user review of this written spec, move to `$superpower-writing-plans`.
