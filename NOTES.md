# NOTES — NOIR MARKET Assessment

## 1. Agent Workflow

This project was built using **Claude Code** (Anthropic's CLI for Claude) across 7 sequential prompts. Each prompt scoped a discrete layer of the application so the agent could stay focused and the output could be reviewed before proceeding.

**Prompt sequence:**

| # | Scope | Output |
|---|---|---|
| 1 | Backend scaffold | NestJS project, MongoDB connection, global guards, exception filter, transform interceptor |
| 2 | Auth + Users modules | JWT access/refresh, bcrypt hashing, register/login/me endpoints |
| 3 | Products + Cart + Orders modules | Full CRUD, cart logic, order lifecycle, status state machine |
| 4 | Analytics + Recommendations | MongoDB aggregation pipelines, co-occurrence engine |
| 5 | Frontend design system | MUI v9 theme, NavbarConnected, Footer, ProductCard, QuantitySelector, StatusChip |
| 6 | Storefront pages | Homepage, catalog, product detail, cart, checkout, orders, login, register |
| 7 | Admin panel + final production tasks | Admin layout, dashboard, product management, order management, tests, docs |

**CLAUDE.md** was used to give the agent persistent context across sessions — project structure, tech stack choices, and key conventions. This eliminated the need to re-explain the architecture at the start of each prompt.

---

## 2. Where the Agent Helped vs. Where It Needed Correction

### Helped well

- **MongoDB aggregation pipelines** — the co-occurrence recommendation engine (two-pass: co-occurrence + category fallback) was generated correctly on the first attempt and matched the intended algorithm precisely.
- **Order status state machine** — `ALLOWED_TRANSITIONS` map and the validation logic were correct immediately; no revision required.
- **MUI v9 syntax** — the agent was aware of v9 breaking changes (e.g., `fontWeight` must live in `sx`, Drawer uses `slotProps.paper`, Typography `textAlign` must be in `sx` not a direct prop) and applied them consistently once flagged.
- **JWT + Passport integration** — guard/strategy/decorator wiring worked first try.
- **react-hook-form + yup** — form validation across all storefront pages was generated cleanly, including password confirmation cross-field validation and dynamic error messages.

### Needed correction

- **Cart quantity increment** — the initial `addToCart` implementation created a *duplicate* cart entry instead of incrementing the existing item's quantity. Caught during manual cart testing (adding the same product twice showed two rows). Fixed by explicitly specifying upsert logic: "if `existingItem`, increment `existingItem.quantity`; else push new item".
- **Cart operations using `itemId` vs `productId`** — the frontend initially tried to use `item._id` (the cart subdocument ID) as the route parameter for `PATCH /cart/items/:id`, but the backend routes use `productId`. Caught when cart quantity updates were returning 404. Fixed by reading the backend controller and aligning the frontend API calls to use `item.productId`.
- **`PriceDisplay` prop name** — the component accepts `size` (not `variant`). Several pages passed `variant="h4"` which TypeScript caught; fixed to `size="large"`.
- **Orders response shape** — `GET /orders` returns `{ orders, total, page, totalPages }` (not a plain array). The page was calling `setOrders(data.data)` which silently set an object instead of an array. Caught by seeing "length of undefined" in the browser console. Fixed by changing to `setOrders(data.data.orders ?? [])`.
- **`GET /products` returning inactive products for admin** — the public products endpoint filters `isActive: true` so the admin product table was missing inactive products. Fixed by adding a dedicated `GET /admin/products` endpoint that uses `findAllAdmin()` (no active filter).
- **React 19 `useRef` types** — `useRef<T>()` without an initial value is rejected by React 19's strict types. Fixed by providing `undefined` as the initial value: `useRef<ReturnType<typeof setTimeout> | undefined>(undefined)`.
- **`useSearchParams()` without Suspense** — the login page uses `useSearchParams()` to read the `redirect` query param; Next.js 16 requires this to be inside a `Suspense` boundary. Fixed by extracting the form into a client component and wrapping it.
- **StorefrontShell architecture** — initially tried using route groups `(store)/layout.tsx` to separate storefront from admin, but this caused a route conflict for `/` (both `app/page.tsx` and `app/(store)/page.tsx` would resolve). Solved with a `StorefrontShell` client component that reads `usePathname()` and skips navbar/footer when the path starts with `/admin`.

---

## 3. Supervision & Verification

Every page and API endpoint was manually tested before considering it complete. The manual testing checklist:

### Authentication flow
- [x] Register a new user → JWT tokens returned, user stored
- [x] Login with correct credentials → tokens returned
- [x] Login with wrong password → "Invalid credentials" shown
- [x] Access protected route (`/cart`) without token → redirect to login with `?redirect=/cart`
- [x] Access `/admin` as customer → redirect to homepage
- [x] Access `/admin` as admin → dashboard visible

### Catalog
- [x] Products page loads with correct pagination
- [x] Search filters results in real-time (debounced 300ms)
- [x] Category filter exclusive selection works
- [x] Price slider commits after drag
- [x] "In Stock" filter hides out-of-stock products
- [x] Sort by price ASC/DESC/newest

### Cart
- [x] Add to cart increments counter in navbar
- [x] Adding same product twice merges quantity (doesn't duplicate row)
- [x] Remove item removes row and recalculates total
- [x] Cart persists on page refresh (server-side, not localStorage)
- [x] Free shipping threshold (PKR 5,000) shows/hides shipping cost correctly
- [x] Out-of-stock product → "Out of Stock" button disabled

### Checkout
- [x] Empty cart → redirect to `/cart`
- [x] Form validation shows errors for empty required fields
- [x] Complete checkout flow: shipping → payment → confirmation
- [x] Order created in database; stock decremented
- [x] Cart cleared after order; navbar counter resets

### Admin
- [x] Dashboard stat cards and charts load
- [x] Products table shows all products including inactive
- [x] Add product form validates: name min 2 chars, price positive, stock non-negative
- [x] Edit product pre-fills form
- [x] Delete shows confirm dialog, soft-deletes (sets `isActive: false`)
- [x] Orders tabs filter by status
- [x] Status update respects state machine (can't move delivered → pending)
- [x] 403 on admin orders → "Access Denied" page renders

### Edge cases verified
- Attempting to order with out-of-stock product mid-session (stock changes between add-to-cart and checkout) → `BadRequestException` returned, user sees error
- Admin visiting storefront routes → storefront navbar visible (admin role doesn't break storefront)
- Expired JWT → automatic logout + redirect to login
- Empty recommendations → section hidden (no empty grid rendered)

---

## 4. Design Workflow

**Design system**: "NOIR MARKET" — a dark-first luxury e-commerce aesthetic.

Key MUI customisation decisions:

- **Accent color**: `#6C63FF` (indigo-violet) — chosen to feel premium without the warmth of typical e-commerce palettes (orange, red, green). Applied to chips, active nav states, CTAs, price displays.
- **Typography pairing**: `Syne` (geometric, heavy display weight) for headings and the logo; `Inter` for body text. Both loaded via `next/font/google` to avoid flash of unstyled text.
- **Card elevation**: Custom box-shadow per mode rather than MUI's elevation numbers — dark mode uses a subtle violet glow (`rgba(108,99,255,0.22)`) on hover; light mode uses a neutral shadow.
- **Status chips**: Semantic color per order status (orange → pending, blue → processing, purple → shipped, green → delivered, red → cancelled). These are separate from the accent color to avoid confusion.
- **Admin sidebar**: Uses `#141418` in dark mode (slightly warm near-black) rather than pure black to feel softer. Active state: violet highlight + accent bar on the right edge of the nav item.
- **StorefrontShell pattern**: Root layout wraps everything in `StorefrontShell`, which reads `usePathname()` to conditionally render the storefront navbar/footer. Admin routes get a completely separate layout without any storefront chrome.

---

## 5. Assumptions Made

| Area | Assumption | Rationale |
|---|---|---|
| **Image handling** | URL-based only (no file uploads required to review the app) | Keeps reviewer setup simple — no S3 or local file server needed; seed data uses real product image URLs |
| **Payment** | Mock Stripe integration (stores `mock_pi_${Date.now()}` as `paymentIntentId`) | No API keys required to run the application end-to-end |
| **Recommendations** | Co-occurrence algorithm based on MongoDB order history | Standard collaborative filtering approach; documented inline in `recommendations.service.ts` |
| **Cart persistence** | Server-side only (MongoDB) | Survives browser refresh and session expiry; no localStorage cart needed |
| **Seeded passwords** | Plain text in seed file, hashed on save via `bcrypt.hash(password, 12)` | Seed file is development-only; production passwords would never be in source |
| **Auth token storage** | `accessToken` in Zustand (memory); lightweight `auth-session=1` cookie for middleware | Edge middleware can't access localStorage; the cookie is a signal only (actual auth uses the JWT) |

---

## 6. Trade-offs & Scope

### Fully built
- Customer auth with JWT access + refresh tokens
- Product catalog with search, filter, sort, pagination
- Server-side cart with stock validation
- 3-step checkout with mock payment
- Order lifecycle with status state machine
- Admin panel: dashboard analytics, product management, order management
- Co-occurrence recommendation engine (product page + personalized)
- Rate limiting on `/auth/*` (10 req/min via `@nestjs/throttler`)
- Security: Helmet, CORS locked to `FRONTEND_URL`, global JWT guard, RBAC

### Mocked / simplified
- **Payment**: Mock `paymentIntentId`; no actual charge occurs. Swap `mock_pi_` for real Stripe `PaymentIntent` creation to enable real payments.
- **Image uploads**: URL-based only. The backend has `multer` and `POST /products/:id/upload` wired for file uploads, but the admin UI uses URL input.
- **Email notifications**: No transactional email on order placement or status change.

### Would add with more time
- **Redis** for cart caching (reduces MongoDB reads on every page load)
- **Elasticsearch** for full-text product search (current regex search doesn't scale past ~100k products)
- **Real Stripe** integration with webhook handling for payment confirmation
- **Email service** (Resend / SendGrid) for order confirmations and shipping updates
- **Image CDN** (Cloudinary / AWS S3) for product image upload and optimisation
- **Refresh token rotation** with a database blocklist (current refresh tokens are stateless JWTs)
- **E2E test suite** with Playwright covering the critical purchase path end-to-end in a real browser
