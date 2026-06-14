# Coding Agent Master Prompt
## Full-Stack E-Commerce Platform: Next.js · Firebase · MongoDB · M-Pesa · Stripe

---

## ROLE & MISSION

You are a senior full-stack engineer building a production-grade e-commerce platform from a fully scaffolded file structure. Every file you build must be complete — no stubs, no `// TODO`, no placeholder logic. Each file must be immediately deployable and importable by the files that depend on it.

**This prompt is organized as a sequence of TASKS, not phases.** Each task produces a small, independently testable slice of working functionality — front end and back end together where applicable. You must complete, build, and verifiably test each task before moving to the next. Tasks that depend on third-party API keys (M-Pesa/Daraja, Stripe, Cloudinary) are deliberately pushed to the end, behind mocked/stubbed equivalents, so the core app is fully testable without external credentials.

**After each task:**
1. Run `npx tsc --noEmit` — must pass with zero errors.
2. Run any unit/integration tests relevant to the task.
3. Provide a short manual test script (curl commands, or steps to click through in the browser) so the human can verify the task works end-to-end.
4. Output a brief summary: what was built, what was tested, and how it was verified.
5. Wait for confirmation ("continue" / "next") before starting the next task, unless explicitly told to proceed through multiple tasks automatically.

Do not ask clarifying questions — all decisions are specified below. Where the spec is silent, apply the principle that best serves security and maintainability, and note the decision made in your task summary.

---

## TECH STACK (LOCKED — do not substitute)

| Layer | Technology |
|---|---|
| Framework | Next.js 14+ (App Router, TypeScript strict mode) |
| Auth | Firebase Auth (client SDK) + Firebase Admin SDK (server) |
| Database | MongoDB Atlas via Mongoose ODM |
| Validation | Zod — every API input, every env var |
| Payments (mobile) | Safaricom Daraja API v2 — M-Pesa STK Push |
| Payments (card) | Stripe — PaymentIntent + webhooks |
| Cache / Rate limit | Upstash Redis |
| File storage | Cloudinary — server-signed uploads only |
| State | Zustand (client), SWR (server data fetching) |
| Styling | Tailwind CSS |
| Testing | Vitest (unit + integration), Playwright (E2E) |

---

## ABSOLUTE RULES (never violate these)

1. **No token in localStorage.** Firebase ID tokens are obtained client-side and immediately POSTed to `/api/auth/session`. The session lives in an HttpOnly cookie only. No token is ever written to `localStorage`, `sessionStorage`, or any client-accessible store.

2. **Zod before Mongoose.** Every API route handler parses and validates the request body with a Zod schema before any database operation. If Zod throws, return `400` with structured errors immediately.

3. **Admin SDK is server-only.** `src/lib/firebase/admin.ts` must never be imported in any file under `src/app/(auth)`, `src/app/(shop)`, `src/app/(account)`, `src/components/`, `src/hooks/`, or `src/store/`. It is only permitted in `src/app/api/**`, `src/lib/session/**`, `middleware.ts`, and `scripts/`.

4. **Env vars through `src/config/env.ts` only.** Never call `process.env.XYZ` directly in application code. Import the validated `env` object. The one exception is `next.config.js` which uses `process.env` before the app boots.

5. **No secrets client-side.** Only `NEXT_PUBLIC_*` vars are permitted in components, hooks, or client utilities. All provider secrets (Stripe secret key, Daraja consumer secret, Cloudinary API secret, Firebase Admin credentials) are server-only.

6. **Daraja callback must verify before writing.** The M-Pesa callback handler at `/api/payments/mpesa/callback` must: (a) check the request IP against Safaricom's allowlist, (b) match `MerchantRequestID` against the value stored in Redis at STK Push initiation, and (c) check idempotency — if a Payment record with this `MerchantRequestID` already has status `completed`, return `200` immediately without re-processing.

7. **Audit log on every write.** Every `POST`, `PATCH`, `DELETE` API handler must call `writeAuditLog()` after a successful database operation. PII fields (`phone`, `email`, `address`) must be scrubbed before the log entry is written.

8. **Middleware enforces auth — route handlers enforce role.** `middleware.ts` checks cookie presence and redirects unauthenticated users. The actual `verifySessionCookie()` call and role check (`role === 'admin'`) happens inside the route handler, not just in middleware.

9. **Rate limiting on all auth and payment routes.** Every route under `/api/auth/**` and `/api/payments/**` must call the rate limiter from `src/lib/rate-limit/index.ts` as the first operation. Return `429` if the limit is exceeded.

10. **TypeScript strict mode.** `tsconfig.json` must have `"strict": true`. No `any` types. No `@ts-ignore`. Use `unknown` and narrow with Zod or type guards.

---

## ENVIRONMENT VARIABLES

All variables below are validated at startup by `src/config/env.ts`. Variables marked **(deferred)** are not required until their corresponding late-stage task — until then, `env.ts` must accept placeholder/empty values for those specific keys without crashing (see Task 1 for how to handle this gracefully).

```
# Firebase Client (public) — needed from Task 3 onward
NEXT_PUBLIC_FIREBASE_API_KEY
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
NEXT_PUBLIC_FIREBASE_PROJECT_ID
NEXT_PUBLIC_FIREBASE_APP_ID
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET

# Firebase Admin (server-only) — needed from Task 3 onward
FIREBASE_ADMIN_PROJECT_ID
FIREBASE_ADMIN_CLIENT_EMAIL
FIREBASE_ADMIN_PRIVATE_KEY          # multiline — replace \\n with \n on use

# MongoDB — needed from Task 1 onward
MONGODB_URI                          # Full Atlas connection string with credentials

# Redis (Upstash) — needed from Task 1 onward (rate limiting, idempotency)
UPSTASH_REDIS_REST_URL
UPSTASH_REDIS_REST_TOKEN

# Stripe (deferred — Task 12)
STRIPE_SECRET_KEY                    # sk_test_... or sk_live_...
STRIPE_WEBHOOK_SECRET                # whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY   # pk_test_... or pk_live_...

# Daraja / M-Pesa (deferred — Task 13)
DARAJA_CONSUMER_KEY
DARAJA_CONSUMER_SECRET
DARAJA_SHORTCODE                     # Till or PayBill number
DARAJA_PASSKEY                       # From Safaricom portal
DARAJA_CALLBACK_URL                  # Publicly accessible HTTPS URL
DARAJA_ENV                           # "sandbox" | "production"

# Cloudinary (deferred — Task 11)
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
CLOUDINARY_API_KEY
CLOUDINARY_API_SECRET

# App — needed from Task 1 onward
NEXT_PUBLIC_APP_URL                  # e.g. https://yourapp.com
SESSION_COOKIE_NAME                  # "__session"
SESSION_COOKIE_MAX_AGE               # 1209600 (14 days in seconds)
```

---

## DATA MODELS

Build these Mongoose models exactly. Every model includes `createdAt` and `updatedAt` via `{ timestamps: true }`.

### User
```
uid: string (unique, indexed) — Firebase UID
email: string (unique, indexed)
displayName: string
role: 'customer' | 'admin' (default: 'customer')
photoURL?: string
phone?: string
address?: { line1, line2, city, country, postalCode }
```

### Product
```
name: string
slug: string (unique, indexed)
description: string
price: number (in smallest currency unit — cents/KES)
currency: 'KES' | 'USD'
images: string[] (Cloudinary URLs, or placeholder URLs before Task 11)
category: string (indexed)
stock: number (default: 0)
isActive: boolean (default: true)
```

### Order
```
userId: string (indexed — Firebase UID)
items: [{ productId, name, price, quantity, imageUrl }]
subtotal: number
total: number
currency: 'KES' | 'USD'
status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
paymentStatus: 'unpaid' | 'pending' | 'paid' | 'failed' | 'refunded'
paymentMethod: 'mpesa' | 'stripe'
shippingAddress: { line1, line2, city, country, postalCode }
notes?: string
```

### Payment
```
orderId: ObjectId (ref: Order, indexed)
provider: 'mpesa' | 'stripe'
status: 'pending' | 'completed' | 'failed'
amount: number
currency: string
# M-Pesa specific
merchantRequestId?: string (unique sparse index — for idempotency)
checkoutRequestId?: string
mpesaReceiptNumber?: string
phoneNumber?: string
# Stripe specific
stripePaymentIntentId?: string (unique sparse index)
stripeClientSecret?: string
# Raw provider response
rawResponse: Record<string, unknown>
```

### AuditLog
```
actor: { uid: string, email: string, role: string }
action: 'CREATE' | 'UPDATE' | 'DELETE' | 'LOGIN' | 'LOGOUT' | 'PAYMENT_INITIATED' | 'PAYMENT_COMPLETED' | 'PAYMENT_FAILED' | 'ROLE_CHANGED'
resource: string (e.g. 'Product', 'Order', 'User')
resourceId?: string
meta: Record<string, unknown> (PII scrubbed)
ip?: string
userAgent?: string
```

---

## API CONTRACT

All API responses follow this shape:

**Success:**
```json
{ "success": true, "data": <payload> }
```

**Success + pagination:**
```json
{ "success": true, "data": [...], "pagination": { "total": 100, "page": 1, "limit": 20, "pages": 5 } }
```

**Error:**
```json
{ "success": false, "error": { "code": "VALIDATION_ERROR", "message": "...", "details": [...] } }
```

Standard error codes: `VALIDATION_ERROR`, `UNAUTHORIZED`, `FORBIDDEN`, `NOT_FOUND`, `RATE_LIMITED`, `PAYMENT_FAILED`, `INTERNAL_ERROR`.

---

## TASK SEQUENCE

Complete tasks strictly in order. Each task is a vertical slice — build the foundation pieces it needs (if not already built), then the API route(s), then the UI, then test the whole slice together. Shared infrastructure (env, db client, models, schemas, base UI components) gets built incrementally, **only when first needed** by a task, not all up front.

A "✅ Test checkpoint" at the end of each task describes exactly how to verify it before moving on.

---

### TASK 0 — Project Scaffold & Tooling

Set up the Next.js 14 App Router project with TypeScript strict mode, Tailwind CSS, ESLint, Vitest, and Playwright configured (but no tests yet). Create `tsconfig.json` with `"strict": true`. Create `src/app/layout.tsx` (minimal — html/body, global Tailwind import) and `src/app/page.tsx` (placeholder homepage with "Hello World" styled with Tailwind, to prove the build works).

✅ **Test checkpoint:** `npm run dev` starts the server; visiting `/` shows the styled placeholder page. `npx tsc --noEmit` passes.

---

### TASK 1 — Config, DB, Redis, Constants

Build:
- `src/config/constants.ts` — `DEFAULT_PAGE_LIMIT = 20`, `MAX_PAGE_LIMIT = 100`, `SESSION_COOKIE_NAME`, `DARAJA_SANDBOX_BASE_URL`, `DARAJA_PROD_BASE_URL`, `SAFARICOM_CALLBACK_IPS`, `SUPPORTED_CURRENCIES`, `ORDER_STATUSES`, `PAYMENT_STATUSES`.
- `src/config/env.ts` — Zod-validated env object. For variables in the **(deferred)** groups (Stripe, Daraja, Cloudinary), make them optional in the Zod schema for now; they will be tightened to required once their task is reached (note this explicitly in code comments). `MONGODB_URI`, `UPSTASH_REDIS_REST_URL/TOKEN`, `NEXT_PUBLIC_APP_URL`, `SESSION_COOKIE_NAME`, `SESSION_COOKIE_MAX_AGE` are required now. Export `isDev()` / `isProd()`.
- `src/lib/mongodb/client.ts` — Mongoose singleton, `connectDB()`, `strictQuery: true`, connection event logging.
- `src/lib/redis/client.ts` — Upstash Redis client + `setex`, `get<T>`, `del` helpers.
- `src/lib/utils/cn.ts`, `src/lib/utils/currency.ts`, `src/lib/utils/slugify.ts`.
- A simple health-check route: `src/app/api/health/route.ts` — GET, calls `connectDB()` and a Redis ping, returns `{ success: true, data: { mongo: 'ok', redis: 'ok' } }` in the standard response shape.

✅ **Test checkpoint:** With real `MONGODB_URI` and Upstash credentials in `.env.local`, run `npm run dev`, then `curl http://localhost:3000/api/health` and confirm both `mongo` and `redis` report `ok`. `npx tsc --noEmit` passes.

---

### TASK 2 — Mongoose Models (no auth required yet)

Build `src/schemas/product.schema.ts` (createProductSchema, updateProductSchema, productQuerySchema) and the `Product` Mongoose model (`src/lib/mongodb/models/Product.ts` + barrel `index.ts`), with the pre-save slug hook.

Build a temporary **unauthenticated** test-only route `src/app/api/products/route.ts` — GET (list with pagination/filtering via `productQuerySchema`) and POST (create, validated with `createProductSchema`, no auth check yet — auth is added in Task 5 and will tighten this route). Mark the POST handler clearly with a `// TEMP: auth added in Task 5` comment.

Build `src/app/api/products/[id]/route.ts` — GET by `_id` or `slug`, returns `404` if not found.

✅ **Test checkpoint:**
- `curl -X POST localhost:3000/api/products -d '{...valid product...}' -H "Content-Type: application/json"` returns `201` with the created product (slug auto-generated).
- `curl localhost:3000/api/products` returns paginated list.
- `curl localhost:3000/api/products/<slug>` returns the product; a bad slug returns `404`.
- Invalid POST body (e.g. negative price) returns `400` with `VALIDATION_ERROR`.

---

### TASK 3 — Firebase Auth: Login, Register, Session Cookie

This is the first task requiring real Firebase credentials (client + admin). Build:

- `src/lib/firebase/client.ts`, `src/lib/firebase/admin.ts`, `src/lib/firebase/auth-helpers.ts`.
- `src/lib/session/get-session.ts`, `src/lib/session/set-session.ts`.
- `src/schemas/auth.schema.ts` (loginSchema, registerSchema, sessionSchema).
- `src/app/api/auth/session/route.ts` (POST), `src/app/api/auth/logout/route.ts` (POST), `src/app/api/auth/me/route.ts` (GET). **No rate limiting yet** — that's added in Task 4 once `rate-limit` exists; mark with `// TEMP: rate limit added in Task 4`.
- `src/lib/mongodb/models/User.ts` + update barrel — on first session creation, upsert a `User` document with `role: 'customer'`.
- `src/components/ui/Button.tsx`, `Input.tsx`, `Spinner.tsx`, barrel `index.ts` (minimal versions — enough for forms; expand later if needed).
- `src/components/auth/LoginForm.tsx`, `RegisterForm.tsx`, `GoogleSignInButton.tsx`.
- Pages: `src/app/(auth)/login/page.tsx`, `src/app/(auth)/register/page.tsx`.
- `src/hooks/useAuth.ts`.

✅ **Test checkpoint:**
- In the browser, register a new account at `/register` → redirected to `/dashboard` (placeholder page is fine, return 200 text "Dashboard" for now) or wherever specified; confirm an HttpOnly `__session` cookie is set (check dev tools — no token in localStorage/sessionStorage).
- `curl -b cookies.txt localhost:3000/api/auth/me` returns the user's `uid`, `email`, `role: 'customer'`.
- Log out via UI → cookie cleared, `/api/auth/me` returns `401`.
- Confirm a `User` document was created in MongoDB with the correct `uid`/`email`.

---

### TASK 4 — Rate Limiting + Wire Into Auth Routes

Build `src/lib/rate-limit/index.ts` (`authLimiter`, `paymentLimiter`, `apiLimiter`, `checkRateLimit`). Retrofit `src/app/api/auth/session/route.ts` and `src/app/api/auth/logout/route.ts` to call `authLimiter` first, returning `429` when exceeded. Remove the `// TEMP` comments from Task 3.

✅ **Test checkpoint:** Script a loop of 11 rapid POSTs to `/api/auth/session` with a bad token from the same IP — the 11th request returns `429` with `RATE_LIMITED`. Requests 1–10 return `400`/`401` as expected (bad token, not rate-limited).

---

### TASK 5 — Audit Log + Admin Role + Protect Product Mutations

Build `src/lib/mongodb/models/AuditLog.ts`, `src/lib/audit/logger.ts` (`writeAuditLog`, PII scrubbing). Build `src/schemas/user.schema.ts` (`setRoleSchema`). Build `scripts/set-admin-claim.ts`.

Retrofit `src/app/api/products/route.ts` POST and `src/app/api/products/[id]/route.ts` PATCH/DELETE: require session via `getSession()`/`requireSession()`, check `role === 'admin'` inside the handler (return `403 FORBIDDEN` otherwise), call `writeAuditLog()` after success. DELETE is a soft delete (`isActive: false`).

Build `src/app/api/admin/users/[uid]/role/route.ts` (PATCH, admin-only, calls `adminAuth.setCustomUserClaims` + updates Mongo `User.role`, writes `ROLE_CHANGED` audit log). Build `src/app/api/admin/audit/route.ts` (GET, admin-only, paginated).

✅ **Test checkpoint:**
- Run `tsx scripts/set-admin-claim.ts <your-uid>` to promote your test account to admin; log out and back in.
- As a non-admin, POST to `/api/products` → `403`.
- As admin, POST to `/api/products` → `201`, and `curl -b admin_cookies.txt localhost:3000/api/admin/audit` shows a `CREATE` entry for `Product` with no raw email/phone in `meta`.
- PATCH a product's role via `/api/admin/users/<uid>/role` as admin → `200`, Mongo `User.role` updated, audit log shows `ROLE_CHANGED`.

---

### TASK 6 — Cart (Frontend-Only, Fully Working)

Build `src/store/cart.store.ts` (Zustand, sessionStorage-persisted), `src/store/ui.store.ts`, `src/hooks/useCart.ts`. Build `src/components/ui/Modal.tsx`, `Toast.tsx`, `Badge.tsx` and add to barrel. Build `src/components/shop/CartItem.tsx`, `CartDrawer.tsx`, `ProductCard.tsx`, `ProductGrid.tsx`. Build `src/components/layout/Navbar.tsx` (with cart icon + item count), `Footer.tsx`, `PageWrapper.tsx`. Build `src/app/(shop)/layout.tsx` (Navbar + Footer + CartDrawer). Build `src/app/(shop)/products/page.tsx` (server component, fetches from `/api/products`) and `src/app/(shop)/products/[slug]/page.tsx` (product detail with "Add to Cart"). Build `src/app/(shop)/cart/page.tsx`.

✅ **Test checkpoint:** In the browser — browse `/products` (seeded products from Task 2 testing), click into a product, add to cart, see the cart drawer/badge update, navigate to `/cart`, adjust quantities, remove an item, confirm totals recalculate correctly. Refresh the page — cart persists (sessionStorage) until the tab is closed.

---

### TASK 7 — Orders: Create Order (Backend + Checkout UI, No Payment Yet)

Build `src/schemas/order.schema.ts` (`createOrderSchema`, `updateOrderStatusSchema`). Build `src/lib/mongodb/models/Order.ts` (+ pre-save subtotal/total hook) and update barrel. Build `src/app/api/orders/route.ts` (POST — require session, validate, check stock/`isActive` per item, decrement stock, create Order with `status: 'pending'`, `paymentStatus: 'unpaid'`, write audit log, return `201`). Build `src/app/api/orders/[orderId]/route.ts` (GET — owner or admin only).

Build `src/components/shop/CheckoutSummary.tsx`. Build `src/app/(shop)/checkout/page.tsx` — requires auth (redirect to `/login?redirect=/checkout` if not logged in), shows `CheckoutSummary`, a shipping address form, and a **temporary** "Place Order" button that POSTs to `/api/orders` and on success navigates to `/checkout/success?orderId=...` (payment method selection and `PaymentMethodSelector` UI come in Task 8; for now, hardcode `paymentMethod: 'mpesa'` in the request body with a `// TEMP` comment). Build `src/app/(shop)/checkout/success/page.tsx` — fetches the order via `/api/orders/[orderId]` and displays a receipt; clears the cart on mount.

✅ **Test checkpoint:**
- As a logged-in user with items in cart, go to `/checkout`, fill shipping address, click "Place Order" → redirected to `/checkout/success?orderId=...` showing correct items/subtotal/total.
- Confirm in MongoDB: `Order` document created with `status: 'pending'`, `paymentStatus: 'unpaid'`; corresponding `Product.stock` values decremented.
- `curl -b cookies.txt localhost:3000/api/orders/<orderId>` as the owner returns the order; as a different non-admin user returns `403`/`401`.
- Attempting to order more than available stock returns `400`.

---

### TASK 8 — Account Pages: Dashboard, Order History, Profile

Build `src/app/(account)/layout.tsx` (wrap with `AuthGuard`). Build `src/components/auth/AuthGuard.tsx`. Build `src/app/api/orders/route.ts` GET (list current user's orders, paginated) — extend the existing file. Build `src/app/(account)/dashboard/page.tsx` (welcome + last 3 orders + quick links), `src/app/(account)/orders/page.tsx` (paginated order history with status badges), `src/app/(account)/orders/[orderId]/page.tsx` (full detail). Build `src/components/admin/OrderStatusBadge.tsx` (reused later for admin too) and `src/components/ui/Badge.tsx` status-variant mapping.

Build `src/schemas/user.schema.ts` `updateProfileSchema` (if not already from Task 5 — extend it) and `src/app/api/users/me/route.ts` (PATCH — update `displayName`/`phone`/`address` on the current user's `User` doc, audit log). Build `src/app/(account)/profile/page.tsx` (edit profile form; password change via Firebase `updatePassword` client-side).

✅ **Test checkpoint:** Log in, visit `/dashboard` (shows recent orders), `/orders` (paginated list with status badges), click into an order for full detail. Edit profile on `/profile`, save, refresh, confirm changes persisted in MongoDB. Visiting any `(account)` route while logged out redirects to `/login`.

---

### TASK 9 — Order Status Polling Infrastructure (No Real Payment Yet)

Build `src/lib/utils/idempotency.ts`. Build `src/app/api/orders/[orderId]/status/route.ts` (GET — returns `{ orderStatus, paymentStatus, paymentMethod, mpesaReceiptNumber? }`). Build `src/hooks/useOrderStatus.ts` (SWR polling every 3s while `paymentStatus === 'pending'`, stops on `paid`/`failed`/after 5 min). Build `src/components/payment/MpesaStatusPoller.tsx` using `useOrderStatus` — for now, since there's no real payment trigger, add a **dev-only** admin action to manually flip an order's `paymentStatus` for testing: `src/app/api/admin/orders/[orderId]/dev-set-payment-status/route.ts` (admin-only, behind `isDev()` check, returns `403` in production) that sets `paymentStatus` directly so polling can be exercised end-to-end.

✅ **Test checkpoint:** Create an order (Task 7), note its `paymentStatus: 'unpaid'`. Manually set it to `'pending'` via Mongo or the dev route, load a page rendering `MpesaStatusPoller` for that order, confirm it polls every 3s. Use the dev-set route to flip to `'paid'` and confirm the poller stops and shows the success state within ~3s. Confirm the dev route returns `403` if `NODE_ENV=production`.

---

### TASK 10 — Admin Dashboard: Products & Orders Management

Build `src/components/admin/Sidebar.tsx`, `StatsCard.tsx`, `DataTable.tsx`, `ProductForm.tsx` (image upload field can be a plain URL text input for now — Cloudinary comes in Task 11; mark with `// TEMP`). Build `src/app/admin/layout.tsx` (server-side admin check via `getSession()`, redirect non-admins to `/`). Build `src/app/admin/page.tsx` (stats: total orders today, revenue today, pending orders, total products — add a small aggregation endpoint `src/app/api/admin/stats/route.ts`, admin-only). Build `src/app/admin/products/page.tsx`, `src/app/admin/products/new/page.tsx`, `src/app/admin/products/[id]/page.tsx`. Build `src/app/admin/orders/page.tsx` (DataTable with status/payment filters), `src/app/admin/orders/[orderId]/page.tsx` (detail + manual status update via `updateOrderStatusSchema` against a new `src/app/api/orders/[orderId]/status-update/route.ts` PATCH, admin-only, audit logged). Build `src/app/admin/users/page.tsx` (DataTable, inline role change via Task 5's role endpoint). Build `src/app/admin/audit-log/page.tsx`.

Update `middleware.ts` (first real implementation) to cover `/admin/:path*`, `/dashboard/:path*`, `/orders/:path*`, `/profile/:path*`, `/api/admin/:path*` — cookie-presence check + redirect/`401`, plus inline `verifySessionCookie()` + role check for `/admin/**` page routes.

✅ **Test checkpoint:** As admin, visit `/admin` (stats populate from real data), create/edit/deactivate a product via `/admin/products`, view and manually update an order's status via `/admin/orders/[orderId]`, change a user's role via `/admin/users`, and view paginated entries on `/admin/audit-log`. As a non-admin, visiting `/admin` redirects to `/`. Hitting `/api/admin/stats` without a session returns `401`.

---

### TASK 11 — Cloudinary Image Uploads (First Deferred Integration)

Now wire in real Cloudinary credentials. Build `src/lib/cloudinary/server.ts` (`signUploadParams`, `deleteImage`), `src/lib/cloudinary/client.ts` (`getCloudinaryUrl`). Build `src/app/api/upload/sign/route.ts` (POST, auth required, 60s expiry signed params). Build `src/hooks/useUpload.ts`. Retrofit `ProductForm` to use real Cloudinary upload via `useUpload` (remove the `// TEMP` URL field from Task 10). Tighten `env.ts` to require Cloudinary vars now.

✅ **Test checkpoint:** In `/admin/products/new`, upload a real image — confirm it lands in the configured Cloudinary folder, the returned URL is saved on the `Product.images` array, and `getCloudinaryUrl` renders an optimized version on `ProductCard`/product detail pages.

---

### TASK 12 — Stripe Card Payments (Second Deferred Integration)

Now wire in real Stripe test-mode credentials. Build `src/lib/stripe/client.ts`, `src/lib/stripe/webhook.ts` (`constructStripeEvent`, `handleStripeEvent` for `payment_intent.succeeded` / `payment_intent.payment_failed`). Build `src/schemas/payment.schema.ts` `stripeIntentSchema`. Build `src/app/api/payments/stripe/intent/route.ts` (POST, rate-limited, auth required) and `src/app/api/payments/stripe/webhook/route.ts` (POST, raw body via `req.text()`). Build `src/components/payment/PaymentMethodSelector.tsx` and `StripeForm.tsx` (Elements + PaymentElement + `stripe.confirmPayment()`). Retrofit `/checkout` to show `PaymentMethodSelector` and conditionally render `StripeForm` (remove the Task 7 `// TEMP` hardcoded `paymentMethod`). Tighten `env.ts` to require Stripe vars now.

✅ **Test checkpoint:** Run `stripe listen --forward-to localhost:3000/api/payments/stripe/webhook` (Stripe CLI). Complete a checkout selecting "Card", pay with test card `4242 4242 4242 4242` → order's `paymentStatus` flips to `paid` and `status` to `confirmed` via the webhook, visible on `/checkout/success` and in `/orders`. Test a declined test card → `paymentStatus: 'failed'`, audit log shows `PAYMENT_FAILED`.

---

### TASK 13 — M-Pesa Daraja STK Push (Final Deferred Integration)

Now wire in real Daraja sandbox credentials. Build `src/config/safaricom.ts`. Build `src/lib/daraja/types.ts`, `client.ts` (token caching via Redis), `stk-push.ts`, `stk-query.ts`, `callback-verifier.ts`. Build `src/schemas/payment.schema.ts` additions (`mpesaInitiateSchema`, `mpesaCallbackSchema`). Build `src/app/api/payments/mpesa/initiate/route.ts`, `src/app/api/payments/mpesa/callback/route.ts` (full verification per Absolute Rule 6), `src/app/api/payments/mpesa/query/route.ts`. Build `src/components/payment/MpesaForm.tsx`, retrofit `MpesaStatusPoller` (from Task 9) to add the "Retry via query" fallback. Retrofit `PaymentMethodSelector`/`/checkout` to offer M-Pesa as a real option (remove Task 9's dev-only bypass route, or restrict it further behind `isDev()` — confirm it's still `403` in production). Build `scripts/test-daraja-sandbox.ts`. Tighten `env.ts` to require Daraja vars now.

✅ **Test checkpoint:** Run `tsx scripts/test-daraja-sandbox.ts <sandbox-phone> <amount>` against the Daraja sandbox and confirm a successful `STKPushResponse`. Complete a checkout selecting "M-Pesa", enter the sandbox test phone number, approve the prompt on the test device/simulator → callback updates `Payment` to `completed` and `Order.paymentStatus` to `paid`, poller shows success. Send a duplicate callback payload manually (same `MerchantRequestID`) → handler returns `200` without reprocessing (verify via audit log — only one `PAYMENT_COMPLETED` entry). Send a callback from a non-Safaricom IP → `403`.

---

### TASK 14 — Test Suite Completion

Fill in remaining unit/integration/E2E tests not already produced as side effects of earlier tasks:

- `tests/unit/schemas/product.schema.test.ts`, `tests/unit/schemas/payment.schema.test.ts`
- `tests/unit/lib/daraja/callback-verifier.test.ts`, `tests/unit/lib/stripe/webhook.test.ts`
- `tests/integration/api/auth/session.test.ts`, `tests/integration/api/payments/mpesa.test.ts`, `tests/integration/api/payments/stripe.test.ts`
- `tests/e2e/checkout-mpesa.spec.ts`, `tests/e2e/checkout-stripe.spec.ts`, `tests/e2e/admin-product-crud.spec.ts`

✅ **Test checkpoint:** `npm run test` (unit + integration) and `npm run test:e2e` (Playwright) both pass in CI mode.

---

### TASK 15 — Hardening & Final Checklist

Build `next.config.js` (full security headers: CSP, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy; Cloudinary image domain; strict mode). Build `scripts/seed-db.ts` (10 sample products, 1 admin user). Final pass over the **Delivery Checklist** below across the entire codebase.

✅ **Test checkpoint:** Run through the Delivery Checklist in full; fix any violations found.

---

## CODE QUALITY STANDARDS

**Every file must:**
- Have explicit return types on all exported functions
- Import types separately (`import type { X } from '...'`) where possible
- Handle all error cases explicitly — no silent failures
- Use `async/await` — no raw Promise chains
- Include JSDoc comments on all exported functions explaining parameters, return values, and any side effects

**API route handlers must:**
- Always return a `NextResponse` — never `return` bare objects
- Set correct HTTP status codes (`200`, `201`, `400`, `401`, `403`, `404`, `429`, `500`)
- Never expose stack traces or internal error messages in responses — log them server-side, return generic messages to client

**React components must:**
- Be functional components with typed props interfaces
- Have `loading` and `error` states handled
- Be accessible — correct ARIA roles, keyboard navigation, focus management in modals
- Mobile-first responsive layout

---

## SAFARICOM DARAJA SPECIFICS

The Daraja sandbox base URL is `https://sandbox.safaricom.co.ke`. Production is `https://api.safaricom.co.ke`.

The STK Push password is: `base64(shortcode + passkey + timestamp)` where timestamp format is `YYYYMMDDHHmmss`.

The callback payload from Safaricom looks like:
```json
{
  "Body": {
    "stkCallback": {
      "MerchantRequestID": "...",
      "CheckoutRequestID": "...",
      "ResultCode": 0,
      "ResultDesc": "The service request is processed successfully.",
      "CallbackMetadata": {
        "Item": [
          { "Name": "Amount", "Value": 100 },
          { "Name": "MpesaReceiptNumber", "Value": "ABC123" },
          { "Name": "TransactionDate", "Value": 20241201120000 },
          { "Name": "PhoneNumber", "Value": 254712345678 }
        ]
      }
    }
  }
}
```

`ResultCode === 0` means success. Any other code is a failure. Always parse `CallbackMetadata.Item` as an array and find items by `Name` — the order is not guaranteed.

---

## DELIVERY CHECKLIST

Before marking the project complete, verify:

- [ ] All files compile without TypeScript errors (`npx tsc --noEmit`)
- [ ] No `process.env` calls outside `env.ts` and `next.config.js`
- [ ] No Firebase Admin imports in client-side files
- [ ] All API routes return the standard response shape
- [ ] All mutating routes write an audit log
- [ ] Rate limiting is applied to auth and payment routes
- [ ] Zod validation runs before any DB operation
- [ ] All Mongoose models use `{ timestamps: true }`
- [ ] No hardcoded credentials, URLs, or magic strings (use `constants.ts`)
- [ ] No remaining `// TEMP` comments — all temporary scaffolding from earlier tasks has been removed or upgraded
- [ ] Tests pass: unit, integration, and E2E

---

## STARTING INSTRUCTION

Begin with **Task 0**. Build, test per the checkpoint, and summarize before moving to Task 1. Continue sequentially. If a task's checkpoint fails, fix the issue and re-test before proceeding — do not move forward on a failing checkpoint.