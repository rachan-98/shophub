# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Full-stack E-Commerce web app (ShopHub) - Amazon clone.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)
- **Frontend**: React + Vite + Tailwind CSS
- **Auth**: JWT (jsonwebtoken + bcryptjs)
- **Payments**: Stripe (optional, works without key in test mode)

## Structure

```text
artifacts-monorepo/
├── artifacts/
│   ├── api-server/         # Express API server
│   └── ecommerce/          # React + Vite frontend (ShopHub)
├── lib/
│   ├── api-spec/           # OpenAPI spec + Orval codegen config
│   ├── api-client-react/   # Generated React Query hooks
│   ├── api-zod/            # Generated Zod schemas from OpenAPI
│   └── db/                 # Drizzle ORM schema + DB connection
│       └── src/schema/
│           ├── users.ts    # Users table (id, name, email, password, role)
│           ├── products.ts # Products table (id, name, description, price, category, stock, imageUrl, rating)
│           ├── cart.ts     # Cart items table (id, userId, productId, quantity)
│           └── orders.ts   # Orders + Order items tables
├── scripts/                # Utility scripts (seed.ts for demo data)
├── pnpm-workspace.yaml
├── tsconfig.base.json
├── tsconfig.json
└── package.json
```

## Key Features

### Authentication
- JWT-based auth (token stored in localStorage)
- Password hashing with bcryptjs
- User roles: `user` and `admin`
- Protected routes

### Products
- Browse, search, filter by category, sort
- Pagination (12 per page)
- Admin: add, edit, delete products

### Cart
- Per-user cart stored in DB
- Add/remove/update quantity
- Cart count in navbar

### Orders
- Place orders from cart
- Order history per user
- Admin: view all orders, update status (pending/processing/shipped/delivered/cancelled)

### Payment
- Stripe integration (test mode)
- Works without STRIPE_SECRET_KEY (returns mock intent)
- Set STRIPE_SECRET_KEY env variable for real Stripe

### Admin Dashboard
- Stats: users, products, orders, revenue
- Manage products
- Manage orders

## API Endpoints

- `POST /api/auth/register` - Register
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user
- `GET /api/products` - List products (filter, search, sort, paginate)
- `GET /api/products/:id` - Get product
- `POST /api/products` - Create product (admin)
- `PUT /api/products/:id` - Update product (admin)
- `DELETE /api/products/:id` - Delete product (admin)
- `GET /api/categories` - Get all categories
- `GET /api/cart` - Get cart
- `POST /api/cart` - Add to cart
- `PUT /api/cart/:id` - Update cart item
- `DELETE /api/cart/:id` - Remove cart item
- `GET /api/orders` - Get orders
- `POST /api/orders` - Place order
- `GET /api/orders/:id` - Get order
- `PUT /api/orders/:id` - Update order status (admin)
- `POST /api/payments/create-intent` - Create Stripe payment intent
- `GET /api/admin/stats` - Admin stats
- `GET /api/admin/users` - List all users (admin)

## Demo Credentials

- **Admin**: admin@shophub.com / admin123
- **User**: Register any new account

## TypeScript & Composite Projects

Every package extends `tsconfig.base.json` which sets `composite: true`.

- **Always typecheck from the root** — run `pnpm run typecheck`
- **`emitDeclarationOnly`** — we only emit `.d.ts` files during typecheck

## Root Scripts

- `pnpm run build` — runs `typecheck` first, then recursively runs `build` in all packages
- `pnpm run typecheck` — runs `tsc --build --emitDeclarationOnly` using project references
- `pnpm --filter @workspace/scripts run seed` — seed demo products and admin user

## Packages

### `artifacts/api-server` (`@workspace/api-server`)

Express 5 API server. Routes live in `src/routes/` and use `@workspace/api-zod` for request and response validation and `@workspace/db` for persistence.

### `artifacts/ecommerce` (`@workspace/ecommerce`)

React + Vite frontend. Uses `@workspace/api-client-react` for typed API hooks.

### `lib/db` (`@workspace/db`)

Database layer using Drizzle ORM with PostgreSQL. All 4 schemas defined.

### `lib/api-spec` (`@workspace/api-spec`)

Owns the OpenAPI 3.1 spec (`openapi.yaml`) and the Orval config (`orval.config.ts`).

Run codegen: `pnpm --filter @workspace/api-spec run codegen`
