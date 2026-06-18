# Coding Agent Master Prompt — v2 (Corrective Patch Pass)
## Full-Stack E-Commerce Platform: Next.js 16 · Firebase · MongoDB · M-Pesa · Stripe

---

## CONTEXT: WHY THIS REWRITE EXISTS

The original master prompt produced a working scaffold, but a manual debugging pass against the live codebase surfaced a cluster of real bugs — mostly around session handling, runtime mismatches, and a perf-hostile request pattern. This version is **not a from-scratch rebuild**. It is a corrective patch guide: a sequence of fix-tasks to run against the *existing* codebase, each scoped tightly enough to verify in isolation, followed by a hardened version of the original task list for any net-new work.

Treat every item in **PART A** as a required patch before continuing any new feature work from the original task list (preserved in **PART B** with corrections folded in). Do not skip PART A — several of these bugs are silent (they don't crash, they just silently produce wrong behavior), and later tasks will be built on top of the broken assumption if not fixed first.

---

## ROLE & MISSION (unchanged)

You are a senior full-stack engineer. Every file must be complete — no stubs, no `// TODO`, no placeholder logic, unless explicitly marked `// TEMP` with the task number where it gets upgraded. Each file must be immediately deployable and importable by the files that depend on it.

**After each task in this document:**
1. Run `npx tsc --noEmit` — must pass with zero errors.
2. Run relevant tests.
3. Provide a manual test script (curl or click-path) to verify end-to-end.
4. Summarize what was built/fixed, what was tested, how it was verified.
5. Wait for confirmation before proceeding, unless told to run through multiple tasks automatically.

Do not ask clarifying questions on items already decided below. Where this spec is silent, apply the principle that best serves security, correctness, and load-time performance, and note the decision in your summary.

---

# PART A — CORRECTIVE PATCHES (apply first, in order)

## PATCH 1 — Session Verification Must Be Real, Never Mocked

**Bug found:** `verifySessionCookie` in `lib/firebase/admin.ts` (or wherever it lives) contained a `NODE_ENV === 'development'` branch that returned a **hardcoded mock session** (`{ uid: 'mock-user-id', role: 'customer' }`) instead of calling Firebase Admin's real verification. This silently broke every role-based check in development — a user could be `admin` in the database and still get treated as `customer` everywhere, with no error, no warning, just wrong behavior.

**Rule going forward:** `verifySessionCookie` has exactly one implementation, used in every environment:

```typescript
export async function verifySessionCookie(sessionCookie: string) {
  try {
    const decodedToken = await adminAuth.verifySessionCookie(sessionCookie, /* checkRevoked */ true)
    return decodedToken
  } catch (error) {
    console.error('Error verifying session cookie:', error)
    return null
  }
}
```

- **No environment-conditional mock branches in any auth-path function, ever.** If a mock or stub is genuinely needed for local dev without real Firebase credentials, it must live in a clearly separate, clearly named file (e.g. `__mocks__/firebase-admin.ts`) that is wired in only via test config or a dependency-injection seam — never an inline `if (isDev())` inside the real implementation.
- Pass `true` as the second argument to `verifySessionCookie` to enable revocation checking, so `adminAuth.revokeRefreshTokens(uid)` (used after role changes — see Patch 3) actually takes effect immediately rather than waiting out natural token expiry.
- **Audit this immediately:** grep the whole codebase for `NODE_ENV === 'development'`, `isDev()`, and `mock` inside anything under `src/lib/session/**`, `src/lib/firebase/**`, and `middleware.ts`/`proxy.ts`. Any conditional mock logic found in these paths must be removed.

✅ **Test checkpoint:** Log in as a known `customer`-role account and a known `admin`-role account (use the same one promoted via `scripts/set-admin-claim.ts`). Hit `/api/auth/me` for each — confirm the returned `role` matches the database exactly, with `NODE_ENV=development` set. Confirm an expired or tampered cookie returns `null`/`401`, not a fake valid session.

---

## PATCH 2 — One `getSession`/`requireSession` Per Execution Context, Correctly Named

**Bug found:** the codebase grew **two different `getSession` implementations** with the same name in different files — one accepting an optional `NextRequest` (for API route handlers), one reading from `next/headers` `cookies()` (for Server Components/layouts) — and a Server Component (`AdminLayout`) imported the *request-based* one with no request to pass it, so `req?.cookies?.get(...)` always evaluated to `undefined` and the session always read as `null`. This produced a confusing failure mode: middleware approved the request, but the layout's own check failed immediately after, throwing an uncaught `Unauthorized` error that crashed the page with a 500 instead of redirecting.

**Rule going forward — two clearly separated, clearly named modules:**

`src/lib/session/get-session.ts` — **API route handlers only.** Takes a `NextRequest`. Used inside `route.ts` files under `src/app/api/**`.

```typescript
export async function getSession(req: NextRequest) { /* reads req.cookies */ }
export async function requireSession(req: NextRequest) { /* throws if null */ }
```

`src/lib/session/verify-session.ts` — **Server Components, layouts, Server Actions.** Takes no arguments; reads via `cookies()` from `next/headers`.

```typescript
export async function getSession() { /* reads cookies() from next/headers */ }
export async function requireSession() { /* throws if null */ }
```

- **Never** import the request-based `get-session.ts` from a file under `src/app/**/layout.tsx`, `src/app/**/page.tsx`, or any Server Component. ESLint rule: add a `no-restricted-imports` entry forbidding `@/lib/session/get-session` from any path matching `**/layout.tsx` or `**/page.tsx` (route handlers under `src/app/api/**/route.ts` are exempt).
- Server Component callers should generally prefer the **non-throwing** `getSession()` + explicit `redirect()` over `requireSession()` + uncaught throw, so an expired/missing session sends the user to `/login` cleanly instead of crashing into a 500 page:

```typescript
const session = await getSession()
if (!session) {
  redirect('/login')
}
```

✅ **Test checkpoint:** Visit `/admin` while logged out — must redirect cleanly to `/login`, zero uncaught errors in server logs. Visit `/admin` while logged in as a non-admin — must redirect cleanly to `/`. Visit `/admin` while logged in as admin — must render.

---

## PATCH 3 — Stale Session After Role Change Is Expected; Document and Handle It

**Bug found:** running `scripts/set-admin-claim.ts` updates Firebase custom claims and the Mongo `User.role` field, but any **already-issued session cookie** still reflects the old role until it's refreshed. This isn't a bug in the script — it's how session cookies work — but it confused debugging because logout/login audit logs kept showing the pre-promotion role, making it look like the promotion script had silently failed.

**Rule going forward:**
- `scripts/set-admin-claim.ts` must call `adminAuth.revokeRefreshTokens(uid)` after setting the custom claim, so existing sessions are invalidated rather than left stale for up to `SESSION_COOKIE_MAX_AGE`.
- Print an explicit message after the script runs: `Session for this UID has been revoked — user must log in again for the new role to take effect.`
- The audit log written at session-create/destroy time must read the role **fresh from the decoded session token** (or re-query Mongo), never from a separately cached value, so this kind of staleness is visible in logs the moment it happens rather than silently persisting.

✅ **Test checkpoint:** Promote a user via the script, confirm the script's own log line about revocation appears. Without explicitly logging out, attempt an admin action with the now-stale cookie still in the browser — it should be rejected (revocation took effect), forcing a fresh login, after which the new role is correctly reflected everywhere.

---

## PATCH 4 — Rate Limiters Must Match the Sensitivity of the Route, Not Just the Route's Folder

**Bug found:** `/api/auth/logout` shared `authLimiter` (10 requests / 15 minutes) with login/registration/password-reset. Logout has no brute-force/credential-guessing surface — rate-limiting it that tightly only self-DoSes legitimate users during normal testing or normal use (e.g. multiple tabs logging out near-simultaneously).

**Rule going forward — limiter assignment by *actual* sensitivity, not by folder convention:**

| Route | Limiter | Reasoning |
|---|---|---|
| `/api/auth/session` (login/register) | `authLimiter` (10 / 15 min) | Credential-guessing surface |
| `/api/auth/logout` | `apiLimiter` (100 / min) | No credential surface; logout should never be the thing blocking a user |
| `/api/payments/**` | `paymentLimiter` (5 / min) | Cost-bearing, abuse-sensitive |
| Everything else under `/api/**` | `apiLimiter` (100 / min) | General abuse/DoS protection only |

- Add a one-line comment above every `checkRateLimit(...)` call explaining *why* that specific limiter was chosen for that route, so future edits don't regress this by copy-pasting the wrong limiter from a neighboring file.
- The `identifier` passed to `checkRateLimit` falls back to `'anonymous'` when `x-forwarded-for`/`x-real-ip` are both absent (this is the normal case on bare `localhost` in dev, since those headers are normally set by a reverse proxy). Document this explicitly in `rate-limit/index.ts`: in local dev, **all unauthenticated requests share one global bucket** unless a real proxy header is present. This is fine for production (real hosts set these headers) but means local rate-limit testing will trip far faster than a teammate might expect — call this out so nobody burns an hour confused by it again.

✅ **Test checkpoint:** Hit `/api/auth/logout` 20 times in under a minute — no `429`. Hit `/api/auth/session` with bad credentials 11 times in under 15 minutes — the 11th returns `429`.

---

## PATCH 5 — Runtime Mismatch: Firebase Admin SDK Cannot Run on the Edge Runtime

**Bug found:** `middleware.ts` imported `verifySessionCookie`, which (correctly, per Patch 1) now calls into the Firebase Admin SDK — but middleware defaults to the Edge runtime, which has no `node:crypto`, `node:fs`, etc. Result: `Cannot find module 'node:crypto'` crash on every request once real verification was wired in.

**Rule going forward:**
- Any file that transitively imports Firebase Admin (`adminAuth`) and is reachable from `middleware.ts`/`proxy.ts` **must** declare:
  ```typescript
  export const runtime = 'nodejs'
  ```
  at the top of the middleware/proxy file itself. Confirm this is supported and behaving as expected on the exact Next.js version in `package.json` before relying on it — if a future Next major reintroduces Edge-only middleware, the fallback is to make middleware do a **cheap, unverified** check (cookie presence only, or unverified JWT payload decode for UX-routing purposes only) and push the *real* cryptographic verification down into the Node-runtime route handler or Server Component, treating middleware as advisory routing only, never as the actual security boundary in that fallback scenario.
- Next.js's `middleware.ts` file convention is deprecated in favor of `proxy.ts` as of the version in use here (confirm current naming requirement against the installed `next` version in `package.json` before renaming, since this convention may continue to evolve). Rename and re-verify after PATCH 5's runtime fix is confirmed working, as a separate, isolated step — don't combine the rename with other changes in the same test cycle, so any regression is attributable to one or the other.

✅ **Test checkpoint:** Restart the dev server, visit any protected route. No `node:crypto` error in server or browser console. Confirm `proxy.ts` (post-rename) still triggers correctly on protected paths.

---

## PATCH 6 — No Relative-URL `fetch()` From Server-Rendered Code, Ever

**Bug found:** `app/admin/page.tsx` (a Server Component) called `fetch('/api/admin/stats', { credentials: 'include' })`. Two compounding problems: (a) relative URLs have no implicit origin to resolve against on the server, causing a hard crash (`Failed to parse URL`); and (b) even with an absolute URL, `credentials: 'include'` is a browser-only fetch option — a server-side `fetch` call is a brand-new outbound request with no cookies attached unless manually forwarded, so the "fixed" version would have rendered a silently blank dashboard (401 → early `return null`) rather than crashing, which is a worse failure mode because it doesn't announce itself.

**Rule going forward — Server Components never `fetch()` their own app's API routes for data they could read directly:**

- If a Server Component needs data that's also exposed via an API route (because some other client also needs it over HTTP), **extract the core logic into a plain server-only function** (e.g. `src/lib/admin/get-admin-stats.ts` exporting `getAdminStats()`), and have *both* the route handler and the Server Component call that shared function directly. No HTTP round-trip to itself, ever.
- The extracted function does **not** perform its own auth check — that stays the caller's responsibility (the route handler does its own `requireSession` + role check; the Server Component relies on its parent layout already having gated the entire route tree, per Patch 2).
- If a genuine cross-origin or client-side fetch to an internal API is unavoidable, the URL must be built from `env.NEXT_PUBLIC_APP_URL`, never a bare relative path, and cookies must be explicitly forwarded (e.g. reading `cookies()` server-side and attaching a `Cookie` header manually) — but prefer the shared-function approach above whenever the caller and the route handler live in the same codebase, which is the common case here.
- Add this as a lint-adjacent code review rule: any `fetch(` call whose first argument is a string literal starting with `/api/` inside a file under `src/app/**` that is *not* itself a `route.ts` is a defect, full stop.

✅ **Test checkpoint:** `/admin` dashboard loads with real, non-zero (or correctly zero) stats on first paint, no client-side loading flash, no fetch-related errors in server logs.

---

## PATCH 7 — No `setState`/Router Navigation Calls During Render

**Bug found:** `CheckoutPage` called `router.push(...)` directly in the component body (not inside an effect) to redirect unauthenticated users, triggering React's "Cannot update a component while rendering a different component" warning — calling router navigation during render violates React's render-purity contract.

**Rule going forward:** any redirect, analytics call, or other side effect triggered by a *client-side* auth/state check must live inside `useEffect`, never directly in the render body. Pattern to use everywhere this shape occurs:

```typescript
'use client'
export default function SomeGatedPage() {
  const router = useRouter()
  const { isAuthenticated, isLoading } = useAuth()

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push(`/login?redirect=${encodeURIComponent(currentPath)}`)
    }
  }, [isLoading, isAuthenticated, router])

  if (isLoading) return <Spinner />
  if (!isAuthenticated) return null
  // ...render the real page
}
```

Note the explicit `isLoading` guard — auth state is very often resolved asynchronously on mount; redirecting before that resolves causes a flash-redirect for users who are, in fact, logged in. Audit every Client Component doing an auth-gated redirect (`checkout`, `(account)/**`, anywhere else `useAuth` is consulted for a redirect decision) for this same pattern — this bug class is easy to reintroduce by copy-paste.

✅ **Test checkpoint:** No React console warnings about setState-during-render anywhere in the auth-gated checkout/account flows. Logged-out visit to `/checkout` redirects to `/login?redirect=%2Fcheckout` with no flash of checkout content first. Logged-in visit renders checkout directly, no flash of redirect.

---

## PATCH 8 — Performance Pass (apply across the whole app, not just one file)

No single catastrophic bottleneck was identified, so harden broadly rather than chasing one fix. Apply all of the following:

**8a. Mongoose connection reuse.** Confirm `connectDB()` is a true singleton — cache the connection promise on `globalThis` (standard Next.js dev-mode hot-reload pattern) so repeated calls across requests/route handlers reuse the existing connection rather than reconnecting. The `🔌 Using existing MongoDB connection` log line seen in dev output suggests this is *already* working — confirm it, don't assume it; add a one-time `console.warn` if a *new* connection is ever opened after startup, so regressions are loud.

**8b. Stop redundant `/api/auth/me` calls.** Dev logs showed `/api/auth/me` being hit repeatedly across page navigations in rapid succession. Cache the auth state client-side (SWR with a reasonable `dedupingInterval`, or React context populated once at app shell mount) rather than having every page/component independently re-fetch identity on mount. Target: one `/api/auth/me` call per session-cookie lifetime per page load, not one per component.

**8c. Avoid N+1 Mongo lookups on every gated request.** Both `AdminLayout` and `/api/admin/stats` (and likely other admin routes) each independently do `verifySessionCookie` → `User.findOne({ uid })` to re-derive the role. Since `AdminLayout` already gates the entire `/admin/**` tree, child Server Components/route handlers under it should not need to repeat the full session-verify-plus-Mongo-lookup if there's a cheaper way to pass already-verified identity down (e.g. via a `React.cache()`-wrapped session getter so multiple calls within the same render pass dedupe automatically, rather than re-hitting Mongo each time). Apply `React.cache()` (or equivalent request-memoization) to `getSession()`/role-lookup helpers used in Server Components.

**8d. Parallelize independent data fetches.** Where a page needs multiple independent pieces of data (e.g. dashboard stats + recent orders), fetch them with `Promise.all` rather than sequential `await`s, mirroring the pattern already used inside `getAdminStats()`'s internal `Promise.all` — apply that same discipline at the page level, not just within individual aggregation functions.

**8e. Add Mongoose indexes matching actual query patterns.** Audit every `findOne`/`find`/aggregation `$match` against fields that aren't already indexed per the original data model spec (`uid`, `email`, `slug` were specified as indexed — confirm this is actually present in the live schema files, not just the spec document). Add indexes for any additional frequently-filtered fields introduced since (e.g. `Order.status`, `Order.createdAt` given the stats aggregation filters on both).

**8f. Fix the Mongoose deprecation warning while in the area.** `findOneAndUpdate(..., { new: true })` is deprecated in favor of `{ returnDocument: 'after' }`. Sweep the codebase for every occurrence and update — low-risk, removes console noise that obscures real warnings.

**8g. Confirm Next.js image optimization isn't silently falling back to slow paths.** The dev logs showed a 404 on `/_next/image?url=https%3A%2F%2Fexample.com%2Fimage.jpg...` — a placeholder/example image URL slipping into production-style image rendering will always 404 and may cause layout-shift/perceived slowness on pages using it. Audit for hardcoded `example.com` or other placeholder image URLs left over from scaffolding and replace with either real Cloudinary URLs (post-Task 11) or a local placeholder asset that's guaranteed to resolve.

✅ **Test checkpoint:** With browser dev tools' Network tab open, click through login → dashboard → admin → products → checkout. Confirm: no duplicate back-to-back `/api/auth/me` calls per navigation, no new-Mongo-connection log lines after startup, no 404s on image requests, Server Component pages with multiple data needs show parallel (not waterfall) request timing in the Next.js dev overlay.

---

# PART B — ADMIN ACCESS, FULLY SPECIFIED

This section consolidates and elaborates the admin-access requirements scattered across the original Tasks 3, 5, and 10 into one authoritative reference, since this was a recurring point of confusion.

## Admin access model (decision, locked)

- **No separate admin login page or admin-specific auth flow.** There is exactly one login flow (`/login`) for every user, customer or admin. This is intentional — Firebase Auth sessions are role-agnostic at the authentication layer; role is an authorization concern checked *after* authentication, not a separate login surface.
- **No visible "Admin" link in the regular navbar, by design.** The admin area is reached by navigating directly to `/admin` in the URL. This is a deliberate simplicity choice for this project's scale, not an oversight — do not add a nav link unless explicitly requested in a future task.
- **The entire `/admin/**` route tree is gated by exactly one place: `src/app/admin/layout.tsx`.** Every page under `/admin` inherits this gate automatically via Next.js layout nesting. No individual `/admin/**` page should re-implement its own redirect-on-unauthorized logic — that's `AdminLayout`'s job, once, at the top.

## The full, correct gate logic for `AdminLayout`

```typescript
import { getSession } from '@/lib/session/verify-session' // cookies()-based — see Patch 2
import { User } from '@/models'
import { connectDB } from '@/lib/mongodb/client'
import { redirect } from 'next/navigation'
import Sidebar from '@/components/admin/Sidebar'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession()
  if (!session) {
    redirect('/login?redirect=/admin')
  }

  await connectDB()
  const user = await User.findOne({ uid: session.uid })
  if (!user || user.role !== 'admin') {
    redirect('/')
  }

  return (
    <>
      <Sidebar />
      <div className="flex-1 p-6">{children}</div>
    </>
  )
}
```

Key details, each tied to a patch above: imports the cookies()-based `getSession`, not the request-based one (Patch 2); redirects cleanly instead of throwing (Patch 2); the redirect target preserves intent (`?redirect=/admin`) so a future "return to where I was going" flow has something to work with, even though it isn't wired up yet.

## API routes under `/api/admin/**`

Every route handler under `/api/admin/**` performs **its own independent** session + role check — never rely on the page-level layout gate to also protect the API layer, since API routes can be hit directly (curl, another client, a forged request) without ever rendering the layout. This was already correct in the original spec (Absolute Rule 8: "middleware enforces auth, route handlers enforce role") — Part A's patches don't change this rule, they just fix the *implementation* of the session check itself.

```typescript
const session = await requireSession(request) // request-based — see Patch 2
await connectDB()
const user = await User.findOne({ uid: session.uid })
if (!user || user.role !== 'admin') {
  return NextResponse.json(
    { success: false, error: { code: 'FORBIDDEN', message: 'Forbidden' } },
    { status: 403 }
  )
}
```

## Step-by-step: how an operator actually gets admin access (operational runbook)

This is the actual day-to-day procedure — include it verbatim in project README or onboarding docs, since this caused real confusion during development:

1. Find the target user's Firebase UID (Firebase Console → Authentication → Users, or query by email via `adminAuth.getUserByEmail()`).
2. Run `npx tsx -r dotenv/config scripts/set-admin-claim.ts <uid> dotenv_config_path=.env.local` (the explicit `dotenv_config_path` is required — `tsx` does not auto-load `.env.local` the way `next dev` does; this caused a full debugging detour and should be called out in the script's own usage error message, not just docs).
3. The script sets the Firebase custom claim, updates `User.role` in MongoDB, and (per Patch 3) revokes existing refresh tokens for that UID.
4. The promoted user must log out and log back in (or have their existing session naturally rejected on next request, per Patch 3's revocation) before the new role takes effect anywhere.
5. Navigate to `/admin` directly in the browser address bar. No further setup required.

## Sidebar/admin section map (per original Task 10, confirmed still the target surface)

`/admin` (dashboard/stats), `/admin/products`, `/admin/products/new`, `/admin/products/[id]`, `/admin/orders`, `/admin/orders/[orderId]`, `/admin/users`, `/admin/audit-log`. `Sidebar.tsx` should link to all of these; confirm none are missing or dead-ended as new admin pages get built out.

---

# PART C — REMAINDER OF ORIGINAL TASK SEQUENCE (corrected)

Resume the original task list (Tasks 0–15) from wherever the existing codebase currently stands, but apply these standing corrections to every remaining task, not just the ones already completed:

- Wherever a task instructs building something under `src/app/**` (page or layout) that needs the current session, import from `lib/session/verify-session`, never `lib/session/get-session` (Patch 2).
- Wherever a task instructs building an API route under `src/app/api/**`, import from `lib/session/get-session`, and assign rate limiters per the sensitivity table in Patch 4, not by folder convention alone.
- Any task introducing a new Server Component that needs data also exposed via an API route must extract shared logic into a plain function per Patch 6 — never `fetch()` the app's own relative API path from server-rendered code.
- Any task introducing a new client-side auth-gated redirect must follow the `useEffect`-based pattern in Patch 7.
- Task 10 (`AdminLayout`, `/admin/**`) is superseded by the fully-specified version in Part B above — use that version verbatim rather than re-deriving it.
- Task 13's M-Pesa work and Task 12's Stripe work are unaffected by these patches and proceed as originally specified, with the standing corrections above still applying to any new route/page files they introduce.
- Before starting any remaining task, re-run the Part A test checkpoints for any patch touching infrastructure that task depends on (e.g. don't start Task 11's Cloudinary work without Patch 8's perf pass already landed, since image-handling code compounds with the existing placeholder-URL issue from 8g).

---

## DELIVERY CHECKLIST (extended)

Original checklist items still apply. Add:

- [ ] No environment-conditional mock logic exists anywhere in `src/lib/session/**` or `src/lib/firebase/**`
- [ ] Exactly two `getSession`/`requireSession` pairs exist in the codebase, correctly named and correctly scoped (request-based vs. cookies()-based), with no accidental third variant
- [ ] `scripts/set-admin-claim.ts` revokes refresh tokens after promotion and prints an explicit "log in again" notice
- [ ] Every `checkRateLimit` call site has a one-line comment justifying its limiter choice
- [ ] `middleware.ts`/`proxy.ts` declares `export const runtime = 'nodejs'` if it (even transitively) imports Firebase Admin
- [ ] Zero `fetch('/api/...')` calls exist inside any Server Component
- [ ] Zero router-navigation or setState calls exist directly in a component's render body (all wrapped in `useEffect`)
- [ ] No placeholder/example.com image URLs remain anywhere reachable in normal app usage
- [ ] `npx tsc --noEmit` passes
- [ ] All Part A test checkpoints pass, in order, on a clean restart of the dev server

---

## STARTING INSTRUCTION

Begin with **Patch 1**. Apply each patch in Part A strictly in order, verifying its checkpoint before moving to the next — several patches depend on the prior one being correctly in place (e.g. Patch 5's runtime fix only matters once Patch 1 makes `verifySessionCookie` real instead of mocked). After Part A is fully verified, proceed to Part C to resume the original task sequence from wherever the codebase currently stands.