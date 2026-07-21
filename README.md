# Zyntra

Zyntra is a two-sided B2B wholesale marketplace — **"direct, tracked, trusted trade"** — connecting **manufacturers** and **distributors**. It replaces opaque, informal wholesale deals with direct trade backed by full order tracking, tiered pricing, real-time chat, and Paystack payments. Positioned explicitly as trade infrastructure, not consumer shopping.

This is a monorepo with two projects:

| Project | What it is | Docs |
|---|---|---|
| [`backend/`](backend) | Spring Boot 4 / Java 26 REST API + WebSocket, PostgreSQL, Flyway | [backend/README.md](backend/README.md) |
| [`mobile/`](mobile) | Expo / React Native app (TypeScript), Expo Router | [mobile/README.md](mobile/README.md), [mobile/PRODUCT.md](mobile/PRODUCT.md), [mobile/DESIGN.md](mobile/DESIGN.md) |

Each subproject has its own comprehensive README covering architecture, setup, and API/feature reference in depth — this file is just the map. Start there for anything project-specific.

## Architecture at a Glance

```
mobile (Expo/React Native, TypeScript)
   │  REST (axios) + STOMP over WebSocket
   ▼
backend (Spring Boot, Java 26)
   │  Spring Data JPA
   ▼
PostgreSQL  ──  Flyway migrations
```

External integrations: **Paystack** (order payments + product "boost" listings), **Google OAuth** (sign-in), Gmail SMTP (password-reset email), Nominatim/Leaflet (order-tracking map, client-side only).

## Users

Manufacturers and distributors, treated as equally primary. Manufacturers list products, manage inventory, and fulfill wholesale orders; distributors discover manufacturers, order in bulk, and track deliveries.

## Getting Started

Run both projects side by side for local development — the mobile app expects the backend reachable at `http://localhost:8080/api` by default.

### Backend

```bash
cd backend
# create a .env with DB_URL, DB_USER, DB_PASSWORD, JWT_SECRET, PAYSTACK_SECRET_KEY, MAIL_USERNAME, MAIL_PASSWORD (see backend/README.md)
./mvnw spring-boot:run
```
Swagger UI: `http://localhost:8080/swagger-ui.html`

### Mobile

```bash
cd mobile
bun install
npx expo start
```

Full environment-variable lists, dependency tables, and setup prerequisites are in each project's own README — see the table above.

## Key Product Flows

- **Auth**: email/password or Google sign-in, JWT-based sessions, role selection (manufacturer vs distributor) on first sign-in.
- **Catalog & Pricing**: manufacturers list products with tiered wholesale pricing (`PriceTier`); distributors browse/search with category and manufacturer filters.
- **Orders**: distributor places an order → manufacturer accepts/declines → ships → out for delivery → delivered, with a full status-history audit trail and live tracking in the app.
- **Payments**: Paystack checkout for order payment and for manufacturer product "boosts" (paid featured-listing placement).
- **Chat**: real-time 1:1 messaging between a manufacturer and distributor over STOMP/WebSocket, with contextual entry points from product and order screens.
- **Trust**: manufacturer trust scores (completion rate, on-time delivery rate) and purchase-gated product reviews, both derived from settled order history.

## Repository Layout

```
zyntra/
  backend/     Spring Boot REST API (see backend/README.md for full package/API reference)
  mobile/      Expo/React Native app (see mobile/README.md for full screen/feature reference)
```
