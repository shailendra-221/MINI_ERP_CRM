# Mini ERP + CRM

A full-stack ERP and CRM portal for sales, stock, customer management, and challan processing.

Live demo:
- Frontend: https://mini-erp-crm-blond.vercel.app/
- Backend API: https://mini-erp-crm-backend-14an.onrender.com

---

## Overview

This project is designed for a wholesale/distribution business workflow and includes:

- Customer management
- Product catalog and stock monitoring
- Stock movement tracking
- Challan creation and status changes
- Role-based access for Admin, Sales, Warehouse, and Accounts
- JWT authentication and protected routes
- Prisma + PostgreSQL database
- React + Vite frontend with Tailwind styling

---

## Tech stack

### Backend
- Node.js
- TypeScript
- Express.js
- Prisma ORM
- PostgreSQL
- JWT authentication
- Zod validation

### Frontend
- React 18
- TypeScript
- Vite
- React Router
- Tailwind CSS
- Axios

---

## Project structure

```bash
mini-erp-crm/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma
│   │   ├── seed.ts
│   │   └── migrations/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── routes/
│   │   ├── utils/
│   │   └── validators/
│   ├── .env
│   ├── .env.example
│   ├── package.json
│   ├── tsconfig.json
│   └── nodemon.json
├── frontend/
│   ├── src/
│   ├── .env
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   └── index.html
├── docker-compose.yml
├── postman_collection.json
├── render.yaml
├── README.md
└── .gitignore
```

---

## Features

### Customer module
- Create, update, and view customers
- Track follow-ups and statuses
- Search and filter customer records

### Product module
- Manage products and pricing
- Track current stock
- Record stock movement entries
- Low-stock alerts and product filtering

### Challan module
- Create challans with line items
- Save draft and confirmed statuses
- Keep historical product snapshots on each challan item
- Enforce stock validation during confirmation

### Roles and permissions
| Role | Access |
|------|--------|
| Admin | Full access |
| Sales | Customer and challan management |
| Warehouse | Product and stock management |
| Accounts | Read-only access |

---

## Demo credentials

All demo users use the password: `Password123!`

| Role | Email |
|------|-------|
| Admin | admin@erp.test |
| Sales | sales@erp.test |
| Warehouse | warehouse@erp.test |
| Accounts | accounts@erp.test |

---

## Local setup

### 1. Clone the repository

```bash
git clone <your-repository-url>
cd mini-erp-crm
```

### 2. Backend setup

```bash
cd backend
npm install
cp .env.example .env
```

Update the backend environment with your PostgreSQL database URL and JWT secret.

Then run:

```bash
npx prisma generate
npx prisma migrate dev
npm run seed
npm run dev
```

Backend runs on:
- http://localhost:4000

### 3. Frontend setup

```bash
cd ../frontend
npm install
cp .env.example .env
npm run dev
```

Frontend runs on:
- http://localhost:5173

---

## Environment variables

### Backend .env

```env
DATABASE_URL=postgresql://user:pass@host:5432/dbname
JWT_SECRET=your-long-random-secret
JWT_EXPIRES_IN=8h
PORT=4000
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173
```

### Frontend .env

```env
VITE_API_URL=http://localhost:4000
```

For deployed versions, use the deployed Render backend URL and Vercel frontend URL instead of localhost.

---

## Deployment

This project is configured for free-tier deployment using:

- Render for the backend API
- Vercel for the frontend
- Neon or Supabase for PostgreSQL

### Backend on Render
- Root directory: `backend`
- Build command:
  `npm install && npx prisma generate && npm run build`
- Start command:
  `npx prisma migrate deploy && npm start`
- Health check route:
  `/health`

### Frontend on Vercel
- Root directory: `frontend`
- Build command:
  `npm run build`
- Output directory:
  `dist`
- Environment variable:
  `VITE_API_URL=https://mini-erp-crm-backend-14an.onrender.com`

---

## Notes

- The project uses Prisma transactions for stock validation to prevent negative stock.
- Challan data stores a frozen product snapshot so historical records remain accurate.
- The app is ready for a production-friendly deployment flow with PostgreSQL and JWT auth.

---

## API and collection

You can import the Postman collection from:
- [postman_collection.json](postman_collection.json)

The API base URL is:
- https://mini-erp-crm-backend-14an.onrender.com

---

## License

This project is for educational and portfolio use.
