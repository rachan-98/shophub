# ShopHub 🛒

A production-grade, full-stack e-commerce application built with React, Node.js, Express, and PostgreSQL. Inspired by Amazon's shopping experience, ShopHub demonstrates real-world software engineering: role-based auth, transactional checkout, admin analytics, and clean API design.

---

## ✨ Features

**Customer**
- JWT-authenticated registration and login
- Product browsing with search, category filter, and sort
- Persistent cart (synced to database, not just localStorage)
- Transactional checkout — stock is decremented atomically
- Full order lifecycle: pending → processing → shipped → delivered
- Order history with item-level detail

**Admin**
- Dashboard with revenue, order, and user metrics
- Add, edit, and soft-delete products
- Update order statuses
- View all users and orders

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, TypeScript, Vite, Tailwind CSS |
| State | Zustand, TanStack Query |
| Backend | Node.js, Express, TypeScript |
| Database | PostgreSQL (with UUID, triggers, JSON columns) |
| Auth | JWT (jsonwebtoken + bcryptjs) |
| Validation | Zod |
| Security | Helmet, CORS, express-rate-limit |
| Payments | Stripe (optional) |
| Logging | Winston |
| CI | GitHub Actions |

---

## 📁 Project Structure

```
shophub/
├── backend/
│   ├── src/
│   │   ├── config/        # DB connection pool
│   │   ├── controllers/   # Route handlers (auth, products, cart, orders, admin)
│   │   ├── middleware/    # JWT auth, error handler
│   │   ├── routes/        # Express router
│   │   ├── types/         # Shared TypeScript interfaces
│   │   └── utils/         # Logger
│   ├── tests/             # Integration tests (supertest + jest)
│   └── schema.sql         # Full PostgreSQL schema with indexes & triggers
│
└── frontend/
    └── src/
        ├── components/    # Navbar, ProductCard, Footer, UI primitives
        ├── pages/         # All route-level page components
        ├── services/      # Axios client with interceptors
        └── store/         # Zustand stores (auth, cart)
```

---

## 🚀 Local Setup

### Prerequisites
- Node.js 20+
- PostgreSQL 14+
- (Optional) Stripe account for payments

### 1. Clone and set up the database

```bash
git clone https://github.com/rachan-98/shophub.git
cd shophub

# Create database and run schema
createdb shophub
psql -d shophub -f backend/schema.sql
```

### 2. Configure environment

```bash
cp backend/.env.example backend/.env
# Edit backend/.env with your DB credentials and JWT secret
```

### 3. Start the backend

```bash
cd backend
npm install
npm run dev        # http://localhost:5000
```

### 4. Start the frontend

```bash
cd frontend
npm install
npm run dev        # http://localhost:5173
```

---

## 🔌 API Overview

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | — | Register new user |
| POST | `/api/auth/login` | — | Login, returns JWT |
| GET | `/api/products` | — | List products (search, filter, sort, paginate) |
| GET | `/api/products/:id` | — | Single product detail |
| POST | `/api/products` | Admin | Create product |
| GET | `/api/cart` | User | Get user's cart |
| POST | `/api/cart` | User | Add item to cart |
| POST | `/api/orders/checkout` | User | Place order (transactional) |
| GET | `/api/orders` | User | Order history |
| PATCH | `/api/orders/:id/cancel` | User | Cancel order |
| GET | `/api/admin/dashboard` | Admin | Metrics and stats |
| PATCH | `/api/admin/orders/:id/status` | Admin | Update order status |

---

## 🧪 Testing

```bash
cd backend
npm test
```

Integration tests cover auth (register, login, protected routes) using Supertest + Jest.

---

## 🌐 Deployment

| Service | Platform |
|---------|----------|
| Backend | Render / Railway |
| Frontend | Vercel |
| Database | Neon / Supabase (managed PostgreSQL) |

---

## 🔑 Key Engineering Decisions

**Transactional checkout** — Stock decrement and order creation happen inside a PostgreSQL transaction with `FOR UPDATE` locks, preventing overselling under concurrent load.

**Soft deletes on products** — `is_active = false` instead of hard deletes preserves order history integrity (foreign key references stay valid).

**Zod validation** — All request bodies are validated with Zod schemas before any DB call, giving precise error messages and full type safety.

**Role-based middleware** — `authenticate` and `requireRole()` middleware are composable and applied at the route level, keeping controllers clean.

---

## 📸 Screenshots

> <img width="1893" height="863" alt="Screenshot (293)" src="https://github.com/user-attachments/assets/191fdfe7-f10e-4135-9925-ad2b7b81f11f" />
<img width="1892" height="872" alt="Screenshot (292)" src="https://github.com/user-attachments/assets/91c904c5-b02a-4a61-9ef4-60f48dd5a0e0" />

---

## 📄 License

MIT
 



