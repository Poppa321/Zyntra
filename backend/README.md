# Zyntra Backend

REST API powering **Zyntra**, a two-sided B2B wholesale marketplace connecting **manufacturers** and **distributors**. Built with Spring Boot 4 on Java 26, backed by PostgreSQL, and deployed as a single Docker container on Render.

## Tech Stack

| Layer | Choice |
|---|---|
| Language | Java 26 |
| Framework | Spring Boot 4.0.7 |
| Build tool | Maven |
| Database | PostgreSQL |
| Migrations | Flyway (`V1` → `V13`) |
| Auth | JWT (`io.jsonwebtoken` / jjwt 0.12.6) + Google OAuth |
| Real-time | STOMP over WebSocket (`spring-boot-starter-websocket`) |
| Payments | Paystack (via Spring `RestClient`) |
| API docs | springdoc-openapi — Swagger UI at `/swagger-ui.html`, spec at `/v3/api-docs` |
| Containerization | Docker multi-stage build (`maven:3.9-eclipse-temurin-26-alpine` → `eclipse-temurin:26-jre-alpine`), deployed on Render |

## Project Structure

Package-by-feature (vertical slice) under `com.zyntra.backend`:

```
address/       Address entity, controller, service, repository, dto/
auth/          AuthController, AuthService, JwtService, JwtAuthFilter,
               GoogleTokenVerifier, LoginAttemptService, RegistrationRateLimiter, dto/
chat/          Conversation, Message, ChatController, ChatService, repositories, dto/
common/        ApiError, PageResponse, GlobalExceptionHandler, exception/ (typed hierarchy)
config/        SecurityConfig, WebSocketConfig, JacksonConfig
dashboard/     DashboardController, DashboardService, dto/
manufacturer/  ManufacturerController, ManufacturerService, dto/ (trust score)
notification/  Notification entity, controller, service, repository, dto/
order/         Order, OrderItem, OrderStatus, OrderStatusHistory, controller, service, repository, dto/
payment/       Payment, PaymentStatus, PaymentController, PaymentService, PaystackClient, repository, dto/
product/       Product, PriceTier, PriceResolver, ProductBoost, ProductReview
               (controllers/services/repositories for products, reviews, boosts, image upload), dto/
user/          User entity, Role enum, UserRepository
BackendApplication.java   main class, @EnableScheduling
```

Each feature module follows the same internal layering: **Entity → Repository (Spring Data JPA) → Service (`@Transactional` business logic) → Controller (`@RestController`) → `dto/`** (Java records with static `from(entity)` mappers — no MapStruct).

`common/exception/` defines a typed exception hierarchy rooted at `ApiException` (carries HTTP status + machine-readable code): `BadRequestException`, `ConflictException`, `ForbiddenException`, `NotFoundException`, `UnauthenticatedException`, `UnprocessableEntityException`, `TooManyRequestsException`, `BadGatewayException`.

## Getting Started

### Prerequisites
- JDK 26
- Maven (or use the bundled `./mvnw`)
- PostgreSQL database
- Paystack account (for payment testing)
- Google OAuth client ID(s) (optional, for Google sign-in)

### Environment variables

Copy or create a local `.env` (auto-loaded via `spring.config.import: optional:file:.env`):

```
DB_URL=jdbc:postgresql://localhost:5432/zyntra
DB_USER=postgres
DB_PASSWORD=your_password

JWT_SECRET=a-long-random-secret
JWT_EXPIRY_MINUTES=1440

GOOGLE_CLIENT_ID=web-client-id,ios-client-id,android-client-id

PAYSTACK_SECRET_KEY=sk_test_xxx
PAYSTACK_CALLBACK_URL=zyntra://payment/callback

CORS_ALLOWED_ORIGINS=http://localhost:8081

PORT=8080
```

Leaving `GOOGLE_CLIENT_ID` blank disables Google sign-in. `JWT_SECRET` and `PAYSTACK_SECRET_KEY` are required at startup.

### Run locally

```bash
./mvnw spring-boot:run
```

Flyway runs automatically on startup (`ddl-auto: validate` — Hibernate never generates schema; Flyway owns it). Swagger UI is then available at `http://localhost:8080/swagger-ui.html`.

### Run tests

```bash
./mvnw test
```

Covers `JwtService`, the order status state machine, and tiered price resolution (`JwtServiceTest`, `OrderTransitionTest`, `PriceResolverTest`).

### Build & run with Docker

```bash
docker build -t zyntra-backend .
docker run -p 8080:8080 --env-file .env zyntra-backend
```

## Authentication

Stateless JWT sessions with two login paths:

1. **Email/password** — `AuthService.register` / `login`, BCrypt (strength 10) hashing. Login is throttled per-email (5 failed attempts / 15 min → 15-min lockout via `LoginAttemptService`); registration is throttled per-IP (5/hour via `RegistrationRateLimiter`, reading `X-Forwarded-For` since Render sits behind a proxy). Both run hourly cleanup via `@Scheduled`.
2. **Google OAuth** — client sends a Google ID token to `POST /api/auth/google`. `GoogleTokenVerifier` validates it against Google's `tokeninfo` endpoint (checks `aud` against the configured client-ID allow-list and `email_verified`), then looks up the user by `googleId` → falls back to `email` (auto-linking an existing password account) → creates a new verified user if none exists.

Both paths issue the same JWT (`JwtService`, HMAC-SHA256, claims: `sub` = user UUID, `role`). `JwtAuthFilter` reads the `Authorization: Bearer <token>` header on every request and populates `SecurityContextHolder`.

`SecurityConfig`: stateless sessions, CSRF disabled, CORS from `CORS_ALLOWED_ORIGINS`. Public paths: `GET /api/products/**`, `GET /api/manufacturers/**`, `/api/auth/register|login|google`, Swagger, `/ws/**`. Everything else requires a valid JWT. Role checks use `@PreAuthorize("hasRole('MANUFACTURER'|'DISTRIBUTOR')")`, plus explicit resource-ownership checks in services. WebSocket `CONNECT` frames carry the JWT as a STOMP header, validated by a dedicated `ChannelInterceptor`.

## Domain Model

All entities use UUID primary keys and `@PrePersist`-managed `createdAt`.

| Entity | Notes |
|---|---|
| **User** | email (unique), passwordHash (nullable for Google-only accounts), googleId (unique, nullable), role (`MANUFACTURER`/`DISTRIBUTOR`), businessName, phone, city, description, darkMode |
| **Product** | manufacturer → User, sku (unique per manufacturer), category, imageUrl (TEXT, base64 data URI), baseUnitPrice, moq, stockQty, lowStockThreshold, leadTimeDaysMin/Max, active (soft delete), featuredUntil; `@OneToMany` priceTiers. GIN full-text index on name. |
| **PriceTier** | product, minQty, maxQty (nullable = unbounded), unitPrice — resolved by `PriceResolver` |
| **ProductReview** | product, distributor, order (proof of purchase), rating (1–5), comment — unique per (product, distributor) |
| **ProductBoost** | product, manufacturer, Paystack reference, amountKobo, status — pay-to-feature record |
| **Order** | orderNumber (`ZYN-<seq>`), distributor, manufacturer, status (state machine), deliveryAddress, subtotal, deliveryFee, platformFeeAmount, total, eta; `@OneToMany` items, statusHistory |
| **OrderItem** | order, productId, productName (snapshot), unitPrice (snapshot), quantity, lineTotal |
| **OrderStatusHistory** | order, status, note, createdAt — audit trail on every transition |
| **Payment** | `@OneToOne` order, reference (unique, Paystack), amountKobo, currency (GHS), status, authorizationUrl, paidAt |
| **Conversation** | manufacturer + distributor pair (unique constraint) |
| **Message** | conversation, sender, optional orderId, body (≤2000 chars), readAt |
| **Address** | userId, label (`WAREHOUSE`/`OFFICE`/`STOREFRONT`/`OTHER`), line1, city, region, phone, defaultAddress |
| **Notification** | userId, type (`ORDER`/`INVENTORY`/`SYSTEM`/`PROMO`), title, body, read |

### Order state machine

```
PENDING → ACCEPTED → IN_TRANSIT → OUT_FOR_DELIVERY → DELIVERED
PENDING → DECLINED
PENDING → CANCELLED
```

`DELIVERED` / `DECLINED` / `CANCELLED` are terminal. Enforced in `Order.transitionTo()`; illegal transitions throw `ConflictException("INVALID_STATUS_TRANSITION")`. Stock decrement on acceptance uses `ProductRepository.findByIdForUpdate` (`PESSIMISTIC_WRITE`) to prevent overselling under concurrent accepts.

**Order economics**: tiered wholesale pricing via `PriceResolver` (first matching `[minQty, maxQty]` tier, else base price), a flat delivery fee (₵1,200.00), and a 5% platform commission on subtotal deducted from the manufacturer's payout (not added to the distributor's total).

## REST API

Base path `/api`. Full interactive reference at `/swagger-ui.html`.

### Auth — `/api/auth`
| Method | Path | Access | Purpose |
|---|---|---|---|
| POST | `/register` | public | Email/password signup |
| POST | `/login` | public | Email/password login |
| POST | `/google` | public | Google ID-token sign-in/sign-up |
| PUT | `/role` | authenticated | Set caller's role |
| GET | `/me` | authenticated | Current user profile |
| PUT | `/me` | authenticated | Update profile / dark mode |

### Products — `/api/products`
| Method | Path | Access | Purpose |
|---|---|---|---|
| GET | `/` | public | Search/browse (`search`, `category`, `manufacturerId`, paginated, sortable) |
| GET | `/low-stock` | MANUFACTURER | Own low-stock products |
| GET | `/{id}` | public | Product detail |
| POST | `/` | MANUFACTURER | Create product |
| PUT | `/{id}` | MANUFACTURER (owner) | Update product |
| PATCH | `/{id}/stock` | MANUFACTURER (owner) | Update stock quantity |
| POST | `/{id}/photo` | MANUFACTURER (owner) | Multipart image upload |
| DELETE | `/{id}` | MANUFACTURER (owner) | Soft delete (`active=false`) |
| POST | `/{id}/feature/initialize` | MANUFACTURER | Start Paystack "boost" payment |
| GET | `/feature/verify/{reference}` | MANUFACTURER | Verify boost payment |

### Reviews — `/api/products/{productId}/reviews`
| Method | Path | Access | Purpose |
|---|---|---|---|
| GET | `/` | public | Paginated review list |
| POST | `/` | DISTRIBUTOR | Create review (requires a DELIVERED order for the product) |

### Orders — `/api/orders`
| Method | Path | Access | Purpose |
|---|---|---|---|
| POST | `/` | DISTRIBUTOR | Create order |
| GET | `/` | authenticated | List caller's orders (`group=active|completed|cancelled`, paginated) |
| GET | `/{id}` | either party | Order detail |
| POST | `/{id}/accept` | MANUFACTURER | Accept order |
| POST | `/{id}/decline` | MANUFACTURER | Decline (with reason) |
| POST | `/{id}/ship` | MANUFACTURER | Mark in transit |
| POST | `/{id}/out-for-delivery` | MANUFACTURER | Mark out for delivery |
| POST | `/{id}/deliver` | MANUFACTURER | Mark delivered |
| POST | `/{id}/cancel` | DISTRIBUTOR | Cancel (while pending) |

### Payments — `/api/payments`
| Method | Path | Access | Purpose |
|---|---|---|---|
| POST | `/initialize` | DISTRIBUTOR | Start Paystack payment for an order |
| GET | `/verify/{reference}` | DISTRIBUTOR | Verify payment status |

### Chat — `/api/chats`
| Method | Path | Access | Purpose |
|---|---|---|---|
| POST | `/` | authenticated | Find-or-create conversation with a counterparty |
| GET | `/` | authenticated | List caller's conversations |
| GET | `/{id}/messages` | authenticated | Cursor-paginated messages (`before`, `size` ≤ 100) |
| POST | `/{id}/messages` | authenticated | Send a message (also pushed via WebSocket) |
| POST | `/{id}/read` | authenticated | Mark conversation read |

### Addresses — `/api/addresses`
| Method | Path | Purpose |
|---|---|---|
| GET | `/` | List caller's addresses |
| POST | `/` | Create address |
| PATCH | `/{id}/default` | Set default address |
| DELETE | `/{id}` | Delete address |

### Notifications — `/api/notifications`
| Method | Path | Purpose |
|---|---|---|
| GET | `/` | List (top 100, newest first) |
| PATCH | `/{id}/read` | Mark one read |
| POST | `/read-all` | Mark all read |

### Dashboard & Manufacturers
| Method | Path | Access | Purpose |
|---|---|---|---|
| GET | `/api/dashboard/manufacturer` | MANUFACTURER | 30-day revenue, order count, active/low-stock product counts, 5 most recent orders |
| GET | `/api/manufacturers/{id}/trust-score` | public | Verified flag, member-since, orders settled, completion rate, on-time delivery rate |

### WebSocket
STOMP endpoint at `/ws` (simple in-memory broker on `/topic` and `/queue`, app prefix `/app`, user prefix `/user`). Messages are written via the REST endpoint and pushed to both participants via `SimpMessagingTemplate.convertAndSendToUser(userId, "/queue/messages", dto)`.

## Real-time Chat

- One `Conversation` per manufacturer/distributor pair (unique constraint), idempotently found-or-created.
- Messages persisted via REST (`POST /api/chats/{id}/messages`), then pushed live over STOMP to both participants.
- Cursor-paginated history (`before` timestamp + `size`, clamped 1–100); unread counts via aggregate query on `readAt IS NULL`.

## Payments & Monetization

**Paystack** (`PaystackClient`, Spring `RestClient`) backs two flows, both `initialize` → `verify` against `/transaction/initialize` and `/transaction/verify/{reference}`, with amount-match checks on verification:

1. **Order payments** — distributor pays for a placed order.
2. **Product boosts** — manufacturer pays ₵50.00 for a 7-day featured-listing window (stackable).

## Image Uploads

No external object storage (no S3/Cloudinary). Product photos are validated (`image/jpeg`, `image/png`, `image/webp`; 4MB max), Base64-encoded, and stored directly as a `data:<content-type>;base64,...` URI in the `products.image_url` TEXT column — a deliberate zero-infrastructure tradeoff. Seed data instead links externally-hosted Unsplash URLs.

## Reviews & Trust

- **Purchase-gated**: a distributor can only review a product they have a `DELIVERED` order for (`ForbiddenException("PURCHASE_REQUIRED")` otherwise).
- One review per (product, distributor), enforced at both the DB (`UNIQUE`) and application level.
- Rating 1–5 (`CHECK` constraint); average rating and count computed via repository aggregates.
- Manufacturer trust score (`/api/manufacturers/{id}/trust-score`) is derived purely from settled order history — no self-reported fields.

## Database & Migrations

PostgreSQL, configured entirely via environment variables (HikariCP pool size 5, `ddl-auto: validate`, `open-in-view: false`, UTC timezone). Flyway migrations in `src/main/resources/db/migration/`:

| Version | Change |
|---|---|
| V1 | `users` |
| V2 | `products`, `price_tiers` (+ GIN full-text index) |
| V3 | `orders`, `order_items`, `order_status_history` |
| V4 | seed demo data |
| V5 | `payments` |
| V6 | `conversations`, `messages` |
| V7 | `addresses`, `notifications`, `users.description` |
| V8 | seed product photo URLs |
| V9 | seed additional manufacturers/products |
| V10 | Google OAuth support + `featured_until` + `product_boosts` |
| V11 | `product_reviews` |
| V12 | `platform_fee_amount`; `image_url` widened to TEXT |
| V13 | fix `product_reviews.rating` column type |

## Cross-Cutting Concerns

- **Validation**: Jakarta Bean Validation on request DTOs; failures return a structured `VALIDATION_ERROR` 400 with per-field messages.
- **Exception handling**: `GlobalExceptionHandler` (`@RestControllerAdvice`) maps every failure mode to a single `ApiError` JSON shape (timestamp, status, code, message, fieldErrors).
- **Pagination**: generic `PageResponse<T>` wrapper, server-clamped page sizes (products/orders 1–50, chat messages 1–100).
- **Search**: combinable free-text + category + manufacturer filters, backed by a Postgres GIN index and `lower()/LIKE` matching.
- **Scheduled jobs**: hourly cleanup of in-memory rate-limit maps (`@EnableScheduling`).
- **Notifications**: polling-based (no push), triggered from order lifecycle events.

## Configuration Reference (`application.yaml`)

```yaml
spring.datasource:        DB_URL / DB_USER / DB_PASSWORD
spring.jpa:                ddl-auto=validate, open-in-view=false, UTC timezone
spring.flyway:              baseline-on-migrate=false
spring.servlet.multipart:   max-file-size / max-request-size = 4MB
zyntra.cors.allowed-origins: CORS_ALLOWED_ORIGINS
zyntra.jwt.secret:           JWT_SECRET (required)
zyntra.jwt.expiry-minutes:   1440
zyntra.google.client-id:     GOOGLE_CLIENT_ID (comma-separated; blank disables Google sign-in)
zyntra.paystack.secret-key:  PAYSTACK_SECRET_KEY (required)
zyntra.paystack.base-url:    https://api.paystack.co
zyntra.paystack.callback-url: PAYSTACK_CALLBACK_URL
server.port:                 PORT (default 8080)
```

## Key Dependencies

`spring-boot-starter-{data-jpa, flyway, restclient, security, webmvc, jackson, validation, websocket}`, `flyway-database-postgresql`, `springdoc-openapi-starter-webmvc-ui`, `io.jsonwebtoken:jjwt-{api,impl,jackson}`, `org.postgresql:postgresql`, `org.projectlombok:lombok`.

## Deployment

Docker multi-stage build → deployed on **Render** (`render.yaml`). `JWT_SECRET` is auto-generated by Render; DB, Paystack, Google, and CORS values are set manually per environment.
