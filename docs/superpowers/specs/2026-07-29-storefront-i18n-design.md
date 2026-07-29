# Storefront EN/VI Design

## Goal

Make every customer-facing Starlier screen consistently available in English and Vietnamese while leaving the admin interface in English.

## Scope

The language system covers:

- Header, navigation, search, hero, homepage editorial sections, Discover, and footer
- Shop catalog, category labels, product cards, and product detail pages
- Cart, checkout, delivery location, QR payment, payment status, and order confirmation
- Account login, signup, profile, favorites, signed-in order history, and guest order lookup
- Empty, loading, success, error, and validation messages shown to customers
- Accessibility labels and customer-facing input placeholders

Admin routes and internal API messages are outside this change.

## Language Control

The header contains one pill-shaped button that displays `EN` and `VI` with a persistent divider between them.

- The entire pill is one button and one click target.
- Clicking anywhere toggles directly between English and Vietnamese.
- The active language is visually emphasized while both labels remain visible.
- The control exposes the destination language in its accessible label.
- The selected language is stored in `localStorage` and applied to `document.documentElement.lang`.
- The control keeps the same dimensions and divider in both states and across hero/scrolled header styles.

## Translation Architecture

The existing `LanguageProvider` remains the single source of truth.

- Expand the typed translation dictionary with all customer-facing strings.
- Client components use `useLanguage().t`.
- Server-rendered static labels use the existing `LocalizedText` boundary or a small localized client wrapper when interpolation is required.
- Dynamic values such as quantities, prices, product names, order numbers, and statuses remain data; surrounding labels and sentence templates are translated.
- Product and brand names remain unchanged.
- Category display labels receive EN/VI translations without changing stored database category values.

No URL locale prefixes are introduced. Existing links, SEO routes, checkout callbacks, and OAuth redirects remain unchanged.

## Translation Quality

Vietnamese copy should read naturally rather than mirror English word order. Terminology remains consistent:

- `All products` → `Tất cả sản phẩm`
- `Bag/Bags` → `Túi`
- `Shirt` → `Sơ mi`
- `T-Shirt` → `Áo thun`
- `Shorts` → `Quần short`
- `In stock` → `Còn hàng`
- `Checkout` → `Thanh toán`
- `Order` → `Đơn hàng`

Brand names, product names, email addresses, payment memo values, and technical identifiers are not translated.

## State And Error Handling

- The provider defaults to English during server rendering.
- On the client, a valid stored language restores the previous choice.
- Invalid or missing stored values fall back to English.
- Switching language must not reset cart, search, form, checkout, or account state.
- Customer-facing errors use translation keys; provider/API details remain unmodified internally.

## Testing

Tests will verify:

- The language pill is a single button with a persistent divider.
- Clicking either visual half toggles the same control.
- The active language and accessible label update correctly.
- The selection persists and updates the root `lang` attribute.
- Representative strings change on home, shop, product, cart, checkout, account, search, and order flows.
- No customer-facing route regresses in the existing unit, integration, or production build checks.

## Acceptance Criteria

1. No customer-facing screen mixes English and Vietnamese after selecting either language, except unchanged product/brand/payment data.
2. The language pill looks structurally identical in EN and VI states.
3. Clicking anywhere inside the pill changes language exactly once.
4. Reloading or navigating preserves the chosen language.
5. Admin remains English.
6. Existing tests, new i18n tests, and the production build pass.
