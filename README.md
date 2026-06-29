# NOIR MARKET — Mini E-Commerce Platform

A full-stack e-commerce application built with Next.js 16, NestJS, and MongoDB. Features a customer-facing storefront and a complete admin panel.

---

## Project Overview

| Layer | Technology |
|---|---|
| Frontend | Next.js 16 (App Router), React 19, MUI v9, Zustand, React Hook Form |
| Backend | NestJS 10, MongoDB + Mongoose, Passport JWT |
| Styling | Material-UI with a custom dark/light theme ("NOIR MARKET" design system) |
| Charts | Recharts |
| Validation | class-validator (backend), yup (frontend) |

### Features

- **Auth**: JWT access + refresh tokens; `admin` and `customer` roles
- **Catalog**: Product listing with search, filter by category, price range, sort, pagination
- **Cart**: Server-side cart (MongoDB), per-user, survives session
- **Checkout**: 3-step flow (Shipping → Payment → Confirmation); mock payment (no Stripe needed)
- **Orders**: Order history with expandable detail rows; status tracking
- **Admin Panel**: Dashboard with Recharts analytics, product CRUD, order management with status state machine
- **Recommendations**: Co-occurrence + category fallback (product page); personalized (purchase history)
- **Security**: JWT auth guard, RBAC roles guard, Helmet, CORS locked to `FRONTEND_URL`, rate limiting on `/auth/*` (10 req/min)

---

## Prerequisites

- **Node.js** 18 or later
- **MongoDB** — local (`mongodb://localhost:27017`) or a MongoDB Atlas connection string
- **npm** (or pnpm / yarn)

---

## Setup

### 1. Clone the repository

```bash
git clone <repo-url>
cd Assessment-Mini-E-Commerce-Platform
```

### 2. Configure and install the backend

```bash
cd backend
npm install
cp .env.example .env
```

Open `backend/.env` and fill in your values (see [Environment Variables](#environment-variables) below).

### 3. Configure and install the frontend

The frontend lives at the **project root** (not a separate directory).

```bash
# from the project root
npm install
cp .env.example .env.local
```

`NEXT_PUBLIC_API_URL` in `.env.local` defaults to `http://localhost:4000/api` and points to the backend.

### 4. Seed the database

```bash
cd backend
npm run seed
```

This creates two users and 13 sample products across five categories.

### 5. Start the backend

```bash
# in backend/
npm run start:dev
```

API is available at `http://localhost:4000/api`.  
Health check: `GET http://localhost:4000/api/health`

### 6. Start the frontend

```bash
# from project root
npm run dev
```

Frontend is available at `http://localhost:3000`.

---

## Environment Variables

### Backend (`backend/.env`)

| Variable | Description | Example |
|---|---|---|
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017/ecommerce` |
| `JWT_SECRET` | Secret for signing access tokens | `a-long-random-string` |
| `JWT_REFRESH_SECRET` | Secret for signing refresh tokens | `another-long-random-string` |
| `JWT_EXPIRES_IN` | Access token TTL | `15m` |
| `PORT` | Port the API listens on | `4000` |
| `FRONTEND_URL` | CORS allowed origin — must match frontend URL | `http://localhost:3000` |

### Frontend (`/.env.local`)

| Variable | Description | Example |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | Backend API base URL | `http://localhost:4000/api` |

---

## Seeded Credentials

After running `npm run seed` in the backend directory:

| Role | Email | Password |
|---|---|---|
| Admin | `admin@store.com` | `Admin1234!` |
| Customer | `customer@store.com` | `Customer1234!` |

---

## API Base URL

```
http://localhost:4000/api
```

Key route groups:

| Prefix | Access | Description |
|---|---|---|
| `/api/auth/*` | Public | Login, register, refresh |
| `/api/products/*` | Public (reads), Admin (writes) | Product catalog |
| `/api/cart/*` | Authenticated | Shopping cart |
| `/api/orders/*` | Authenticated | Place and view orders |
| `/api/admin/*` | Admin only | Analytics, order management |
| `/api/recommendations/*` | Mixed | Product + personalized recs |
| `/api/health` | Public | Health check |

---

## Running Tests

### Backend (Jest)

```bash
cd backend
npm test              # run all tests once
npm run test:watch    # watch mode
npm run test:cov      # with coverage report
```

Test files follow the `*.spec.ts` pattern and live next to the source files they test:

| File | Coverage |
|---|---|
| `modules/auth/auth.service.spec.ts` | register() returns tokens, login() with wrong password |
| `modules/products/products.service.spec.ts` | create() with negative price, findOne() not found |
| `modules/cart/cart.service.spec.ts` | addItem() exceeds stock → BadRequestException |
| `modules/orders/orders.service.spec.ts` | createFromCart() decrements stock by correct amount |
| `modules/recommendations/recommendations.spec.ts` | max 4 results, excludes requested product |

### Frontend (Jest + React Testing Library)

```bash
# from project root
npm test              # run all tests once
npm run test:watch    # watch mode
npm run test:coverage # with coverage report
```

| File | Coverage |
|---|---|
| `src/components/ui/__tests__/ProductCard.test.tsx` | renders name, price, "Out of Stock" |
| `src/components/ui/__tests__/QuantitySelector.test.tsx` | does not go below 1 |
| `src/store/__tests__/cartStore.test.ts` | addItem increases itemCount |

---

## Project Structure

```
Assessment-Mini-E-Commerce-Platform/
├── backend/                    # NestJS API
│   ├── src/
│   │   ├── modules/
│   │   │   ├── auth/           # JWT auth, register, login
│   │   │   ├── users/          # User schema + bcrypt hashing
│   │   │   ├── products/       # Catalog, admin CRUD
│   │   │   ├── cart/           # Server-side cart
│   │   │   ├── orders/         # Order lifecycle + status machine
│   │   │   ├── analytics/      # Revenue + order analytics aggregations
│   │   │   └── recommendations/# Co-occurrence + personalized engine
│   │   ├── common/             # Guards, decorators, filters, interceptors
│   │   ├── app.module.ts
│   │   ├── app.controller.ts   # /health endpoint
│   │   ├── main.ts
│   │   └── seed.ts             # Database seed script
│   └── package.json
├── src/                        # Next.js frontend
│   ├── app/                    # App Router pages
│   │   ├── (store)/            # Storefront route group
│   │   ├── admin/              # Admin panel
│   │   └── layout.tsx
│   ├── components/
│   │   ├── layout/             # NavbarConnected, Footer, StorefrontShell
│   │   └── ui/                 # ProductCard, QuantitySelector, StatusChip, etc.
│   ├── lib/api.ts              # Axios instance + all API functions + types
│   ├── providers/              # MUI ThemeProvider
│   └── store/                  # Zustand: authStore, cartStore
├── public/
├── jest.config.js              # Frontend Jest configuration
├── .env.example                # Frontend env template
├── package.json                # Frontend deps + test scripts
├── CLAUDE.md                   # Project context for Claude Code sessions
├── NOTES.md                    # Agent workflow + design decisions
└── README.md
```
