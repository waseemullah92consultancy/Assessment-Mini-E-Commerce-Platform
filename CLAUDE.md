# CLAUDE.md — NOIR MARKET Project Context

This file gives Claude Code the context it needs to work in this repository without repeated explanation.

---

## Project Structure

```
Assessment-Mini-E-Commerce-Platform/
├── backend/                    # NestJS 10 API (port 4000)
│   └── src/
│       ├── modules/            # Feature modules
│       ├── common/             # Shared guards, decorators, filters, interceptors
│       ├── app.module.ts       # Root module (imports all feature modules)
│       ├── app.controller.ts   # /api/health endpoint
│       ├── main.ts             # Bootstrap (CORS, Helmet, ValidationPipe, static)
│       └── seed.ts             # `npm run seed` — creates admin + customer + 13 products
└── src/                        # Next.js 16 frontend (port 3000)
    ├── app/                    # App Router
    │   ├── (store)/            # Route group for storefront pages
    │   ├── admin/              # Admin panel (separate layout)
    │   ├── layout.tsx          # Root layout — wraps in StorefrontShell
    │   └── page.tsx            # Homepage
    ├── components/
    │   ├── layout/             # NavbarConnected, Footer, StorefrontShell
    │   └── ui/                 # ProductCard, QuantitySelector, StatusChip, PriceDisplay, EmptyState
    ├── lib/api.ts              # Axios instance + all typed API functions
    ├── providers/              # MUI ThemeProvider
    └── store/                  # Zustand stores: authStore, cartStore
```

---

## Backend Module Map

| Module | Path | Key endpoints |
|---|---|---|
| Auth | `modules/auth/` | `POST /auth/register`, `POST /auth/login`, `POST /auth/refresh`, `GET /auth/me` |
| Users | `modules/users/` | Internal only (no public controller) |
| Products | `modules/products/` | `GET /products`, `GET /products/:id`, `GET /products/:id/recommendations` |
| Admin Products | `modules/products/admin-products.controller.ts` | `GET /admin/products`, `GET /admin/products/:id` |
| Cart | `modules/cart/` | `GET /cart`, `POST /cart/items`, `PATCH /cart/items/:productId`, `DELETE /cart/items/:productId`, `DELETE /cart` |
| Orders | `modules/orders/` | `POST /orders`, `GET /orders`, `GET /orders/:id` |
| Admin Orders | `modules/orders/admin-orders.controller.ts` | `GET /admin/orders`, `PATCH /admin/orders/:id/status` |
| Analytics | `modules/analytics/` | `GET /admin/analytics` |
| Recommendations | `modules/recommendations/` | `GET /products/:id/recommendations`, `GET /recommendations/personalized` |
| Health | `app.controller.ts` | `GET /health` |

---

## Security & Auth Conventions

- **Global JwtAuthGuard** applied to every route via `APP_GUARD` in `app.module.ts`
- Routes opt out of auth with `@Public()` decorator (`common/decorators/public.decorator.ts`)
- **RolesGuard** enforces `@Roles('admin')` decorator
- Middleware (Edge): reads lightweight `auth-session=1` and `admin-session=1` cookies (set by `authStore.login()`) — these are signals only; actual auth uses Bearer JWT in the Authorization header
- **ThrottlerGuard** applied to `AuthController` only (10 req / 60 s)
- CORS locked to `FRONTEND_URL` env variable in `main.ts`

---

## Key Technical Conventions

### Backend

- **Response envelope**: All API responses are wrapped by `TransformInterceptor` → `{ success: true, data: ..., message: '...' }`. Frontend reads `response.data.data` to get the actual payload.
- **Soft delete**: Products are never hard-deleted. `ProductsService.remove()` sets `isActive: false`.
- **Cart routes use `productId` as URL param**, not the cart subdocument `_id`. Correct: `PATCH /cart/items/:productId`.
- **Order status machine**: Transitions live in `ALLOWED_TRANSITIONS` in `orders.service.ts`. Only valid next states are allowed; invalid transitions throw `BadRequestException`.
- **Stock decrement** happens inside `OrdersService.createFromCart()` via `ProductsService.decrementStock()` after the order document is created.
- **DTOs** use `class-validator` decorators; the global `ValidationPipe` enforces them with `whitelist: true, forbidNonWhitelisted: true, transform: true`.
- **Mongoose schemas** use `@Prop({ min: 0 })` for price and stock — negative values throw a Mongoose `ValidationError` on `.save()`.

### Frontend

- **MUI version**: v9. Breaking changes: `fontWeight`/`textAlign` as direct Typography props are dropped — use `sx`. Drawer uses `slotProps={{ paper: { sx: ... } }}`.
- **React version**: 19. `useRef` requires an explicit initial value: `useRef<T | undefined>(undefined)`. Dynamic route params use `use(params)` not `params.id`.
- **`useSearchParams()`** requires a `Suspense` boundary in Next.js App Router. Wrap the consuming component.
- **`PriceDisplay`** accepts `size?: 'small' | 'medium' | 'large'` — NOT `variant`.
- **`EmptyState`** accepts `action?: ReactNode` — pass JSX directly, not an object.
- **Cart item operations** use `item.productId` (string) as the route parameter to `PATCH /cart/items/:productId`.
- **Zustand** `authStore` uses `persist` middleware (key `noir-auth`). `cartStore` does NOT persist (cart is server-side).
- **StorefrontShell** (`components/layout/StorefrontShell.tsx`): client component that reads `usePathname()` to skip navbar/footer for `/admin/*` routes. This solves the homepage route conflict between `app/page.tsx` and `app/(store)/page.tsx`.
- **Admin layout** (`app/admin/layout.tsx`): client component; performs client-side role check (`user.role === 'admin'`) in addition to the Edge middleware check.
- **Recharts** components must be in `'use client'` files — they require browser APIs.

---

## Design System

**Theme**: Dark-first. Light mode available via toggle (persisted in `localStorage` as `'noir-theme'`).

**Accent color**: `#6C63FF` (indigo-violet).

**Typography**:
- Display / headings / logo: `Syne` (variable `--font-syne`)
- Body: `Inter` (variable `--font-inter`)

**Status colors** (separate from accent, do not mix):
- `pending` → `#FF9800`
- `processing` → `#2196F3`
- `shipped` → `#9C27B0`
- `delivered` → `#00C896`
- `cancelled` → `#FF4757`

---

## Environment Variables

### Backend (`backend/.env`)
```
MONGODB_URI=mongodb://localhost:27017/ecommerce
JWT_SECRET=...
JWT_REFRESH_SECRET=...
JWT_EXPIRES_IN=15m
PORT=4000
FRONTEND_URL=http://localhost:3000
```

### Frontend (`/.env.local`)
```
NEXT_PUBLIC_API_URL=http://localhost:4000/api
```

---

## Seeded Users

After `cd backend && npm run seed`:

| Role | Email | Password |
|---|---|---|
| Admin | `admin@store.com` | `Admin1234!` |
| Customer | `customer@store.com` | `Customer1234!` |

---

## Test Commands

```bash
# Backend (NestJS + Jest)
cd backend && npm test

# Frontend (Jest + RTL)
# from project root
npm test
```

---

## Common Gotchas

1. `GET /public/products` (if it appears anywhere) — this is the old storefront route. Use `GET /products` for the storefront and `GET /admin/products` for the admin panel.
2. The `orders` response from `GET /orders` is `{ orders: Order[], total, page, totalPages }` — not a plain array. Extract with `data.data.orders`.
3. `Analytics.ordersByStatus` is `Record<string, number>` (an object), not an array. Use `Object.entries()` to iterate.
4. Admin routes require the `Authorization: Bearer <token>` header AND the `admin-session` cookie for middleware. Both are set automatically by `authStore.login()` when `user.role === 'admin'`.
5. Do not add `'use client'` to layout files that export `metadata` — Next.js App Router does not support both in the same file.
