# Zyntra Mobile

A two-sided B2B wholesale marketplace app — **"direct, tracked, trusted trade"** — connecting **manufacturers** and **distributors**. Built with Expo/React Native, targeting a Ghana-focused market (₵ currency, Paystack payments). Positioned explicitly as trade infrastructure, not consumer shopping: *"Trade, not shopping."*

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | Expo SDK ~57.0.7 (managed workflow, `expo-dev-client`) |
| Runtime | React Native 0.86.0, React 19.2.3 |
| Language | TypeScript throughout — no JavaScript files |
| Routing | Expo Router ~57.0.7 (file-based), `typedRoutes` + `reactCompiler` experiments enabled |
| Package manager | bun |
| App identity | "Zyntra", bundle `com.festxsteam.zyntra`, custom URL scheme `zyntra` (Google OAuth + Paystack redirects) |

Notable native/Expo modules: `expo-image`, `expo-image-picker`, `expo-secure-store`, `expo-auth-session` (Google), `expo-web-browser` (Paystack checkout + OAuth), `expo-linear-gradient`, `expo-glass-effect`, `react-native-webview` (embedded Leaflet map), `react-native-reanimated`/`react-native-worklets`, `react-native-svg`, `phosphor-react-native` (icons), `@stomp/stompjs` (WebSocket chat), `@tanstack/react-query` (server state), `axios` (HTTP).

See also [`PRODUCT.md`](PRODUCT.md) (brand personality, users, anti-references) and [`DESIGN.md`](DESIGN.md) (the "Trade Ledger" visual system — colors, typography, component tokens).

## Getting Started

### Prerequisites
- Node.js + [bun](https://bun.sh)
- Expo CLI (`npx expo`)
- The [Zyntra backend](../backend) running locally or reachable (see `EXPO_PUBLIC_API_BASE_URL`)

### Install & run

```bash
bun install
npx expo start
```

From the Expo CLI output you can open the app in a development build, Android emulator, iOS simulator, or Expo Go.

### Environment variables

```
EXPO_PUBLIC_API_BASE_URL=http://localhost:8080/api   # or the deployed backend URL
```

Google OAuth requires separate Web/iOS/Android client IDs configured via env vars consumed by `expo-auth-session`.

## Project Structure

```
src/
  api/
    client.ts            axios instance, token storage, error helpers
    types.ts              all backend DTO types
    mappers.ts             DTO → UI "domain" model mappers
    endpoints/              one file per REST resource (thin axios wrappers)
  app/                     Expo Router file-based routes (screens)
    (auth)/                 login, register, forgot/reset password (route group)
    distributor/             distributor tab stack (home, browse, orders, messages, profile)
    manufacturer/             manufacturer tab stack (home, inventory, orders, messages, profile)
    manufacturer-profile/[id].tsx
    product/[id].tsx
    chat/[id].tsx, chat/new.tsx
    order-tracking/[id].tsx
    payment/callback.tsx
    notifications.tsx, notifications/[id].tsx
    profile/                 business profile, addresses (shared stack)
    cart.tsx, list-product.tsx, role-select.tsx, welcome.tsx, index.tsx (splash)
  components/              ~25 reusable presentational components
  hooks/                    one useX.ts per domain, wraps react-query + endpoints
  lib/                      alert.ts, format.ts, queryClient.ts, stomp.ts
  screens/                  ChatListScreen.tsx (shared between role tab stacks)
  theme/                    ThemeContext, colors.ts, darkColors.ts, spacing.ts, typography.ts
  types/domain.ts            UI-facing domain models
```

**Architecture pattern**: `api/types.ts` (backend DTOs) → `api/mappers.ts` (pure mapping functions) → `types/domain.ts` (presentation-friendly models, pre-formatted currency/labels) → `hooks/useX.ts` (react-query) → screens. Screens never touch backend response shapes directly.

## Navigation (Expo Router)

Root `Stack` (`src/app/_layout.tsx`) wraps everything in `QueryClientProvider` + `ThemeProvider`.

- **`index.tsx`** — animated splash; reads session, redirects to `/manufacturer`, `/distributor`, or `/welcome`
- **`welcome.tsx` → `role-select.tsx` → `(auth)`** — its own `Stack`: `login`, `register`, `forgot-password`, `reset-password`
- **`distributor/_layout.tsx`** — bottom tabs: Home, Browse, Orders, Messages, Profile
- **`manufacturer/_layout.tsx`** — bottom tabs: Home, Inventory, Orders, Messages, Profile
- **`profile/_layout.tsx`** — plain stack for `business.tsx`, `addresses.tsx`
- Cross-cutting detail routes pushed on top: `product/[id]`, `manufacturer-profile/[id]`, `chat/[id]`, `chat/new`, `order-tracking/[id]`, `notifications`, `notifications/[id]`, `cart`, `list-product` (modal), `payment/callback` (deep-link fallback)

Two role-scoped tab navigators sit under shared stack routes for auth/onboarding; role is chosen post-auth in `role-select.tsx` and decides which tab layout loads.

## State Management

No Redux/MobX/Zustand — state is split by concern:

- **Server state** — `@tanstack/react-query` (`staleTime: 30_000`, `retry: 1`). Every domain hook (`useAuth`, `useChat`, `useOrders`, …) wraps a `useQuery`/`useMutation` and owns its cache keys/invalidation.
- **Theme** — React Context (`ThemeProvider` / `useTheme()` / `useThemeColors()`).
- **Cart** — no backend cart entity exists; the cart is modeled purely as local react-query cache (`hooks/useCart.ts`, key `["cart"]`), translated into `CreateOrderRequest.items` only at checkout.
- **Local UI state** — `useState` for forms/toggles.

## API Integration

`src/api/client.ts`:
- `API_BASE_URL` from `EXPO_PUBLIC_API_BASE_URL`, defaulting to `http://localhost:8080/api`
- `WS_BASE_URL` derived by stripping `/api` for the WebSocket host
- Axios instance with a request interceptor injecting `Authorization: Bearer <token>`
- Token persisted via `expo-secure-store` (native) / in-memory `Map` fallback (web)
- `getApiErrorMessage()` / `getApiErrorCode()` parse the backend's standard `ApiErrorBody` shape

Endpoint modules (`src/api/endpoints/*.ts`), each a set of typed axios wrappers, consumed only through `hooks/`:

| File | Covers |
|---|---|
| `auth.ts` | login, register, googleAuth, setRole, me, updateMe |
| `products.ts` | list/get/create/update/delete, stock, photo upload, low-stock, boost initialize/verify |
| `orders.ts` | create, list, get, accept/decline/ship/outForDelivery/deliver/cancel |
| `reviews.ts` | list, create |
| `chat.ts` | findOrCreateConversation, listConversations, listMessages, sendMessage, markRead |
| `notifications.ts` | list, markRead, markAllRead |
| `addresses.ts` | list, create, setDefault, delete |
| `payments.ts` | initialize, verify |
| `manufacturers.ts` | getTrustScore |
| `dashboard.ts` | getManufacturerDashboard |

## Authentication

- **Email/password** — `useLoginMutation` / `useRegisterMutation` (`hooks/useAuth.ts`) hit `/auth/login` / `/auth/register`, store the JWT via `setAuthToken()`, then route to the correct role tab stack.
- **Google Sign-In** (`components/GoogleSignInButton.tsx`) — `expo-auth-session`'s `Google.useIdTokenAuthRequest` with per-platform client IDs, plus `expo-web-browser`'s `maybeCompleteAuthSession()`. Posts the ID token to `/auth/google`; a first-time Google user with no role is routed to `role-select.tsx`.
- **Session** — `useSessionQuery()` reads the stored token, calls `GET /auth/me`, clears the token silently on 401. Drives the splash-screen redirect, tab visibility, and dark-mode sync.
- **Sign out** — clears the token and `queryClient.clear()`, routes to `/welcome`.
- **Password reset** — `forgot-password.tsx` / `reset-password.tsx` exist in the UI, but their mutations are client-side stubs (`simulateDelay`) since the backend has no password-reset flow yet.
- **Redirect scheme** — `com.festxsteam.zyntra:/oauthredirect` (OAuth) and `zyntra://payment/callback` (Paystack), registered in `app.json`'s `scheme` array.

## Real-time Chat

- **Screens**: `screens/ChatListScreen.tsx` (shared by both role tab stacks), `app/chat/[id].tsx` (thread), `app/chat/new.tsx` (start-conversation picker).
- **Transport**: `src/lib/stomp.ts` — one shared, ref-counted STOMP client (`@stomp/stompjs`) to `${WS_BASE_URL}/ws`, authenticated with the JWT as a STOMP connect header, auto-reconnect (4s delay).
- **`hooks/useChat.ts`**: `useConversationsQuery`, `useMessagesQuery`, `useSendMessageMutation`, `useMarkConversationReadMutation`, `useStartConversationMutation`, `useChatLiveUpdates(selfId)` (subscribes to STOMP, pushes incoming messages into the react-query cache with dedupe against the sender's own echo).
- **UI**: conversation list with unread badges; inverted `FlatList` bubble thread (`bubbleSelf`/`bubbleOther`); contextual "Message manufacturer/distributor" entry points from Product, Orders, and Order-tracking screens.

## Reviews UI

- `components/ProductReviews.tsx`, embedded on `product/[id].tsx`.
- Average rating + count header, star-rating summary, review cards (name, relative time, stars, comment).
- Distributors (`session?.role === "DISTRIBUTOR"`) get a "Write a review" toggle → `ReviewForm` with a tappable 5-star picker, submitting via `useCreateReviewMutation` (invalidates both the reviews and product query caches).

## Dark Theme

- React Context system (`theme/ThemeContext.tsx`), not a UI-library theme.
- `theme/colors.ts` (light) / `theme/darkColors.ts` (dark) — brand colors (navy, gold) pinned identical in both; only surfaces and text roles flip.
- **Sync**: dark-mode preference lives on the user account (`UserDto.darkMode`); adopted once on session load (`hasSynced` guard), toggled from `ProfileScreen.tsx` via `useUpdateDarkModeMutation` (`PUT /auth/me`).
- **Pattern**: every screen computes its `StyleSheet` via `createStyles(colors)`, memoized with `useMemo` — this is what makes the whole app re-theme live.
- A `pureWhite` (fixed) vs `white` (theme-flipping) color distinction keeps text/icons on always-navy/gold surfaces (e.g. the manufacturer dashboard hero) from inverting incorrectly in dark mode.

## Image Upload UI

- `expo-image-picker` in `app/list-product.tsx` (the "List a Product" wizard). Requests media-library permission, `launchImageLibraryAsync({ allowsMultipleSelection: true, selectionLimit: MAX_PHOTOS - photos.length, quality: 0.7 })`, capped at `MAX_PHOTOS = 6`.
- Horizontal scrollable photo tray with removable thumbnails, dashed "Add photo" tile, manual "Image URL" fallback field.
- **Flow**: create the product first (`POST /products`, no photo), then upload the photo separately (`useUploadProductPhotoMutation` → multipart `FormData` POST to `/products/:id/photo`). If the upload fails, the product still exists — the user can add a photo later from inventory.
- Product images render via `expo-image` (`ImageCarousel`, `ProductThumb`); a placeholder multi-slide carousel with dot indicators shows when no photo exists.

## Design System

No third-party component library (no React Native Paper / NativeBase / Tamagui) — a fully custom design system, documented in [`DESIGN.md`](DESIGN.md) ("The Trade Ledger"):

- **Primitives** (`src/components/`): `Button`, `TextField`, `Text`, `Badge`, `Chip`, `IconButton`, `Divider`, `StatusDot`, `ScreenContainer`, `SectionIcon`, `ProductThumb`, `ProductCard`, `ManufacturerCard`, `ImageCarousel`, `ProductReviews`, `ProfileScreen`, `AuthShell`, `Logo`, `GoogleSignInButton`, `DotPattern`, `LeafletMap`
- **Icons**: `phosphor-react-native`
- **Typography**: Noto Sans (`@expo-google-fonts/noto-sans`), weights 400/500/600/700 only ("extraBold" maps to Bold)
- **Tokens** (`theme/spacing.ts`): `spacing` (4–32px scale), `radius` (`sm:10, md:14, pill:29`), shared `cardShadow`
- **Brand**: navy `#0f2743` + gold `#eaaa34`, bold uppercase display text — "confident, industrial, trustworthy," deliberately avoiding generic e-commerce/SaaS tropes
- **Maps**: `components/LeafletMap.tsx` — geocodes via free Nominatim (OpenStreetMap), renders Leaflet.js + Routing Machine inside a `react-native-webview` (Kumasi fallback coordinate); no native Maps SDK

## Feature Overview by Role

**Shared**
- Splash → Welcome → Role selection → Auth (email/password or Google) → role home
- Real-time 1:1 chat, contextual entry points from product/order screens
- Notifications center (order/inventory/system/promo, mark-read/mark-all-read)
- Profile: business info, delivery addresses, dark-mode toggle, sign out
- Order tracking: status stepper (Pending → Accepted → In Transit → Out for Delivery → Delivered) + live map

**Distributor**
- Home: search, "Top Manufacturers" and "Featured" carousels, category chips, product grid
- Browse: full search/filter across products and manufacturers
- Manufacturer profile: trust card (completion rate, on-time delivery rate, orders settled, member-since) + catalog
- Product detail: tiered pricing, stock/lead-time, quantity stepper, add-to-cart, reviews
- Cart → Place Order → Pay via Paystack → Order tracking
- Orders tab (Active/Completed/Cancelled), cancel while pending

**Manufacturer**
- Dashboard: 30-day revenue (after platform fee), quick actions, stats, low-stock banner, recent activity
- Inventory: inline stock editing, "Feature" (boost) via Paystack (₵50/7 days), low-stock highlighting
- "List a Product": 4-step wizard (Photos & Details → Category → Pricing & Stock → Contact & Review)
- Incoming Orders: accept/decline, progress ship → out-for-delivery → deliver

## Payments

Paystack-powered checkout for both order payments (`usePayForOrderMutation`) and product boosts (`useBoostProductMutation`), both via `expo-web-browser`'s `openAuthSessionAsync` against a hosted Paystack checkout URL. `payment/callback.tsx` is a deep-link fallback verification screen for when the in-app browser redirect isn't intercepted (e.g. app backgrounded mid-checkout); reference prefixes (`ZYNPAY-` vs `ZYNBOOST-`) distinguish order payments from product boosts.

## Key Dependencies

```
expo ~57.0.7                 expo-router ~57.0.7            expo-auth-session ^57.0.4
react 19.2.3                 react-dom 19.2.3               react-native 0.86.0
@tanstack/react-query ^5.101.3   axios ^1.18.1               @stomp/stompjs ^7.3.0
expo-secure-store ~57.0.1    expo-image ~57.0.1             expo-image-picker ~57.0.5
expo-web-browser ~57.0.1     expo-linear-gradient ~57.0.1   expo-glass-effect ~57.0.1
react-native-webview 13.16.1 react-native-svg 15.15.4        phosphor-react-native ^3.0.6
react-native-reanimated 4.5.0  react-native-worklets 0.10.0  react-native-gesture-handler ~2.32.0
@expo-google-fonts/noto-sans ^0.4.2
```

Dev: `typescript ~6.0.3`, `@types/react ~19.2.17`. No test framework, no state-management or UI-kit libraries.

## Notable Patterns

- **DTO/domain separation** keeps formatting logic (currency, quantity ranges, relative time) centralized in `lib/format.ts` rather than scattered across components.
- **Hook-per-domain convention**: each `useX.ts` colocates all queries/mutations for one resource.
- **`createStyles(colors)` factory**, memoized per screen — the backbone of live theme switching.
- **Ref-counted singleton WebSocket** avoids duplicate connections across screens.
- **Cart-as-cache**: the distributor cart has no backend entity; it's pure client-side react-query state until order placement.
- **Deep-link–aware payment/auth**: custom `zyntra://` scheme handles both Google OAuth and Paystack callbacks.
