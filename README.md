# OpsDesk — Mini ERP + CRM Operations Portal

A small ERP/CRM system for a wholesale/distribution company: customers, products, stock,
and sales challans, with role-based access for Admin, Sales, Warehouse and Accounts teams.

Built for the Full Stack Developer case study assignment.

---

## 1. Tech stack

| Layer      | Choice |
|------------|--------|
| Backend    | Node.js, TypeScript, Express.js, Prisma ORM, PostgreSQL |
| Auth       | JWT (role-based access control) |
| Validation | Zod |
| Frontend   | React 18, TypeScript, Vite, React Router, Tailwind CSS |
| HTTP       | Axios |

Prisma was chosen over a raw query builder because it gives compile-time-checked queries,
transaction support (critical for the stock/challan logic below), and a single schema file
that doubles as living documentation of the data model.

---

## 2. Project structure

```
mini-erp-crm/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma       # data model (users, customers, products, challans...)
│   │   └── seed.ts             # creates 4 demo users + sample customers/products
│   └── src/
│       ├── config/db.ts        # Prisma client singleton
│       ├── middleware/         # auth, role guard, validation, error handler
│       ├── controllers/        # business logic per module
│       ├── routes/             # Express routers
│       ├── validators/         # Zod schemas per module
│       └── utils/               # JWT, ApiError, challan-number generator
├── frontend/
│   └── src/
│       ├── api/                 # typed axios client + per-resource API calls
│       ├── context/AuthContext.tsx
│       ├── components/          # Layout, Sidebar, StatusBadge, Pagination...
│       └── pages/                # Dashboard, Customers, Products, Challans
├── docker-compose.yml            # optional local Postgres + backend + frontend
└── postman_collection.json
```

---

## 3. Core business logic (what to look at first)

The assignment's trickiest requirement is in **`backend/src/controllers/challan.controller.ts`**:

- Every challan line item stores a **snapshot** of the product (name, SKU, unit price) at
  the time it was added — not just a `productId` — so historical challans stay accurate
  even if the product catalog changes later.
- Challan numbers are auto-generated per calendar month (`CH-202608-0001`, `CH-202608-0002`, …)
  in `utils/generateChallanNumber.ts`.
- **Stock is only ever touched inside a Prisma `$transaction`.** Confirming a challan checks
  every line's stock availability and decrements it atomically; if any line is short, the
  whole transaction is rolled back and the API returns `400` with a clear message — stock
  can never go negative.
- Cancelling a **confirmed** challan restores the stock it had deducted (with its own stock
  movement log entries), while cancelling a **draft** is a no-op on stock, since nothing was
  ever deducted.
- The product `currentStock` field is never directly editable via `PUT /products/:id` — it
  can only change through `POST /products/:id/stock-movements`, so the movement log is always
  the source of truth (see `product.controller.ts`).

---

## 4. Roles & permissions

| Action                          | Admin | Sales | Warehouse | Accounts |
|----------------------------------|:---:|:---:|:---:|:---:|
| View customers/products/challans | ✅ | ✅ | ✅ | ✅ |
| Create/edit customers            | ✅ | ✅ | ❌ | ❌ |
| Create/edit products, adjust stock | ✅ | ❌ | ✅ | ❌ |
| Create challans                  | ✅ | ✅ | ❌ | ❌ |
| Confirm / cancel challans         | ✅ | ✅ | ✅ | ❌ |

Accounts currently has read-only access across all modules — a natural place to extend with
an invoicing module.

---

## 5. Local setup

### Prerequisites
- Node.js 18+
- A PostgreSQL database (local install, or a free hosted one — see §7)

### Backend

```bash
cd backend
cp .env.example .env        # then edit DATABASE_URL, JWT_SECRET
npm install
npx prisma migrate dev --name init   # creates tables
npm run seed                          # creates demo users + sample data
npm run dev                           # http://localhost:4000
```

### Frontend

```bash
cd frontend
cp .env.example .env        # VITE_API_URL=http://localhost:4000
npm install
npm run dev                 # http://localhost:5173
```

### Test login credentials

All demo accounts use the password `Password123!`

| Role      | Email |
|-----------|-------|
| Admin     | admin@erp.test |
| Sales     | sales@erp.test |
| Warehouse | warehouse@erp.test |
| Accounts  | accounts@erp.test |

---

## 6. Environment variables

**backend/.env**
```
DATABASE_URL=postgresql://user:pass@host:5432/dbname
JWT_SECRET=<long random string>
JWT_EXPIRES_IN=8h
PORT=4000
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173
```

**frontend/.env**
```
VITE_API_URL=http://localhost:4000
```

---

## 7. Deployment (free-tier friendly)

This was built to deploy without spending money:

1. **Database** — create a free Postgres instance on [Neon](https://neon.tech) or
   [Supabase](https://supabase.com). Copy the connection string into `DATABASE_URL`
   (Neon/Supabase URLs need `?sslmode=require`).
2. **Backend** — deploy `backend/` to [Render](https://render.com) or
   [Railway](https://railway.app) as a Node web service:
   - Build command: `npm install && npx prisma generate && npm run build`
   - Start command: `npx prisma migrate deploy && npm start`
   - Set the same env vars as above, with `CORS_ORIGIN` pointing at the deployed frontend URL.
3. **Frontend** — deploy `frontend/` to [Vercel](https://vercel.com) or
   [Netlify](https://netlify.com):
   - Build command: `npm run build`, output directory: `dist`
   - Set `VITE_API_URL` to the deployed backend URL.
4. After both are live, run `npm run seed` once against the production `DATABASE_URL`
   (e.g. via Render's shell) to create the four demo logins.

AWS deployment (EC2 + RDS, or ECS) is a bonus per the assignment brief and was not required
for this submission — the free-tier path above satisfies "working local setup" and gives a
live URL besides.

---

## 8. API overview

Base URL: `http://localhost:4000`

| Method | Endpoint | Roles | Notes |
|--------|----------|-------|-------|
| POST | `/auth/login` | public | returns JWT + user |
| GET  | `/auth/me` | any | current user |
| GET  | `/customers` | any | `?search=&status=&customerType=&page=&limit=` |
| GET  | `/customers/:id` | any | includes follow-ups + recent challans |
| POST | `/customers` | Admin, Sales | |
| PUT  | `/customers/:id` | Admin, Sales | |
| POST | `/customers/:id/follow-ups` | Admin, Sales | |
| GET  | `/products` | any | `?search=&category=&lowStock=true&page=&limit=` |
| GET  | `/products/:id` | any | includes stock movement log |
| POST | `/products` | Admin, Warehouse | |
| PUT  | `/products/:id` | Admin, Warehouse | `currentStock` not editable here |
| POST | `/products/:id/stock-movements` | Admin, Warehouse | `{ quantity, movementType, reason }` |
| GET  | `/challans` | any | `?search=&status=&customerId=&page=&limit=` |
| GET  | `/challans/:id` | any | |
| POST | `/challans` | Admin, Sales | `{ customerId, items: [{productId, quantity}], status }` |
| PATCH | `/challans/:id/status` | Admin, Sales, Warehouse | `{ status: "CONFIRMED" \| "CANCELLED" }` |

All list endpoints return `{ success, data, pagination }`. All errors return
`{ success: false, message, details? }` with the appropriate HTTP status code.

Import `postman_collection.json` into Postman for ready-to-run requests (set the
`baseUrl` and `token` collection variables after logging in).

---

## 9. Known limitations / not implemented

Being upfront about what's incomplete given the scope of a case study:

- **AWS deployment** was treated as the bonus it's described as in the brief; the app deploys
  instead to Render/Vercel/Neon as documented above.
- **Invoice PDF export** (bonus item) is not implemented.
- **Product image upload to S3** (bonus item) is not implemented.
- **Docker Compose** is included for local Postgres + services, but no GitHub Actions CI/CD
  pipeline is set up.
- The Accounts role currently has read-only access everywhere; a real system would likely
  give it its own invoicing/payments module.
- Product search/list endpoints don't yet support full-text search ranking — they use simple
  `contains` filters, fine at this scale but would need a proper search index at larger
  catalog sizes.
- No automated test suite (unit/integration tests) is included due to the 24-hour scope;
  the transaction-heavy challan logic in particular would benefit from tests before
  production use.

---

## 10. Architecture notes

- **Stateless JWT auth**: no server-side sessions, so the API scales horizontally without
  sticky sessions or a shared session store.
- **Prisma transactions** are used everywhere stock changes: this guarantees the "stock
  should not go negative" and "confirm reduces stock atomically" requirements hold even
  under concurrent requests, since Postgres enforces the transaction isolation.
- **Snapshot-on-write** for challan items means historical documents are immutable once
  created, matching how a real paper challan/invoice would work.
- The frontend keeps all cross-cutting concerns (auth token, 401 redirect, error message
  extraction) in `src/api/client.ts`, so individual pages stay focused on UI and don't
  repeat try/catch boilerplate.
