# Invex — Real-Time Inventory Management System

A modern, scalable inventory management platform with real-time updates via WebSocket, built with Go + React.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, TypeScript, Vite, Tailwind CSS, TanStack Query, Zustand |
| Backend | Go 1.22, Gin, GORM, gorilla/websocket |
| Database | PostgreSQL 16 |
| Cache & Queues | Redis 7 |
| Auth | JWT (bcrypt), RBAC |
| Runtime | Bun (frontend), Go (backend) |
| Containers | Docker, Docker Compose |

## Features

- **Real-time dashboard** — inventory levels, alerts, and movements update instantly via WebSocket
- **Products** — full CRUD with SKU, barcode-ready fields (EAN/UPC/QR)
- **Multiple locations** — Store, Warehouse, Branch, Distribution Center
- **Inventory movements** — Stock In, Stock Out, Location Transfer, Manual Adjustment (all transactional)
- **Suppliers** — manage vendors with tax IDs, contacts, and addresses
- **Purchase Orders** — manual and auto-generated from reorder points
- **Alert System** — low stock, reorder point, out of stock, delayed POs, suspicious adjustments
- **Role-based access** — Admin, Manager, Operator, Viewer
- **Audit logging** — all mutations tracked with before/after values

## Architecture

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   React SPA  │────▶│   Go (Gin)   │────▶│  PostgreSQL  │
│  (Vite + WS) │◀────│  + WebSocket │◀────│              │
└──────────────┘     └──────┬───────┘     └──────────────┘
                            │
                     ┌──────▼───────┐
                     │    Redis     │
                     │ Cache/PubSub │
                     │ / Queues     │
                     └──────────────┘
```

Real-time flow:
1. Inventory movement request → Go handler
2. PostgreSQL transaction (atomic balance update + history)
3. WebSocket broadcast via Hub → connected clients
4. Redis Pub/Sub bridge → other backend instances
5. Alert check → notification queue → email (configurable)

## Requirements

- [Docker](https://docs.docker.com/get-docker/) + [Docker Compose](https://docs.docker.com/compose/install/)
- [Bun](https://bun.sh/) (for frontend development outside Docker)
- [Go](https://go.dev/dl/) 1.22+ (for backend development outside Docker)

## Quick Start with Docker

```bash
# Clone and start everything
git clone <repo> invex
cd invex
cp .env.example .env
docker compose up -d

# Services:
#   Frontend: http://localhost:5173
#   Backend:  http://localhost:8080
#   Postgres: localhost:5432
#   Redis:    localhost:6379
```

## Local Development

### Backend

```bash
cd backend
cp ../.env.example ../.env

# Install tools & run
go mod tidy
go run ./cmd/server/main.go

# Tests
go test ./internal/...
```

### Frontend

```bash
cd frontend
bun install
bun run dev      # development server on :5173
bun run build    # production build
bun run test     # vitest
```

## Environment Variables

See `.env.example` for all options:

| Variable | Default | Description |
|---|---|---|
| `DB_HOST` | `postgres` | PostgreSQL host |
| `DB_PORT` | `5432` | PostgreSQL port |
| `DB_USER` | `invex` | Database user |
| `DB_PASSWORD` | `invex_secret` | Database password |
| `DB_NAME` | `invex` | Database name |
| `REDIS_HOST` | `redis` | Redis host |
| `REDIS_PORT` | `6379` | Redis port |
| `JWT_SECRET` | `change-me` | JWT signing key |
| `JWT_ACCESS_EXPIRY` | `15m` | Access token TTL |
| `JWT_REFRESH_EXPIRY` | `7d` | Refresh token TTL |
| `SMTP_HOST` | — | SMTP server (alerts) |
| `SMTP_PORT` | `587` | SMTP port |
| `APP_PORT` | `8080` | Backend port |

## Database Migrations

Run automatically via GORM AutoMigrate on startup. Manual SQL migrations in `backend/migrations/` for production deployments.

```bash
# Using golang-migrate CLI (production):
cd backend
migrate -path migrations -database "postgres://..." up
```

## Creating the First Administrator

The system seeds 4 roles on startup: `admin`, `manager`, `operator`, `viewer`. Create an admin user via the API:

```bash
# Register admin (endpoint example — implement as needed)
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Admin","email":"admin@invex.com","password":"admin123","role_id":"<admin-role-uuid>"}'
```

Or insert directly:
```sql
INSERT INTO users (name, email, password, role_id)
SELECT 'Admin', 'admin@invex.com', '$2a$10$...', id FROM roles WHERE name = 'admin';
```

## API Overview

Base URL: `http://localhost:8080/api`

### Authentication

| Method | Path | Description |
|---|---|---|
| `POST` | `/auth/login` | Login — returns JWT |
| `GET` | `/auth/me` | Current user info |

### Products

| Method | Path | Auth |
|---|---|---|
| `GET` | `/products` | All authenticated |
| `GET` | `/products/:id` | All authenticated |
| `POST` | `/products` | Manager+ |
| `PUT` | `/products/:id` | Manager+ |
| `DELETE` | `/products/:id` | Admin |

### Inventory

| Method | Path | Auth |
|---|---|---|
| `GET` | `/inventory?view=consolidated` | All authenticated |
| `GET` | `/inventory?view=by-location` | All authenticated |

### Movements

| Method | Path | Auth |
|---|---|---|
| `POST` | `/movements/in` | Operator+ |
| `POST` | `/movements/out` | Operator+ |
| `POST` | `/movements/transfer` | Operator+ |
| `POST` | `/movements/adjust` | Manager+ |

### Suppliers, Locations, Categories

Standard CRUD: `GET /list`, `GET /:id`, `POST`, `PUT /:id`, `DELETE /:id`

### Dashboard

| Method | Path | Auth |
|---|---|---|
| `GET` | `/dashboard` | All authenticated |

## Real-Time Architecture

Events are pushed via WebSocket at `ws://host/ws`.

Event format:
```json
{ "type": "stock.updated", "payload": { ... } }
```

### Event Types

| Event | Description |
|---|---|
| `stock.updated` | Inventory balance changed |
| `alert.created` | New alert triggered |
| `po.status_changed` | Purchase order status changed |

### Scaling

The Redis Pub/Sub bridge (`internal/websocket/redis_bridge.go`) forwards events between backend instances, enabling horizontal scaling behind a load balancer.

## Alert System

Alerts are checked automatically after every inventory movement.

| Alert Type | Trigger |
|---|---|
| `low_stock` | Quantity ≤ min_stock (and > 0) |
| `reorder_point` | Quantity ≤ reorder_point |
| `out_of_stock` | Quantity ≤ 0 |
| `po_delayed` | Purchase order past expected date |
| `suspicious_adjustment` | Large manual adjustment (configurable) |

Background worker runs every 5 minutes to:
- Generate auto purchase orders for products below reorder point
- Check delayed purchase orders

## Deployment Guide

### Production with Docker

```bash
cp .env.example .env
# Edit .env with production values (strong JWT_SECRET, real DB credentials)
docker compose up -d --build
```

### Cloudflare Workers

```bash
cd backend
bun run build    # builds static frontend
# Deploy API worker to Cloudflare
```

## Project Structure

```
invex/
├── backend/
│   ├── cmd/server/          # Entrypoint
│   ├── internal/
│   │   ├── auth/            # JWT + bcrypt
│   │   ├── background/      # Background workers
│   │   ├── config/          # Environment config
│   │   ├── database/        # PostgreSQL + Redis connections
│   │   ├── dto/             # Request/response types
│   │   ├── handlers/        # HTTP handlers
│   │   ├── middleware/      # Auth + RBAC + CORS
│   │   ├── migrations/      # Auto-migrate + seed
│   │   ├── models/          # GORM models
│   │   ├── router/          # Route setup
│   │   ├── services/        # Business logic
│   │   └── websocket/       # WS hub + Redis bridge
│   ├── migrations/          # SQL migration files
│   ├── Dockerfile
│   └── go.mod
├── frontend/
│   ├── src/
│   │   ├── api/             # Axios client
│   │   ├── components/      # UI + layout components
│   │   ├── hooks/           # Custom hooks + WS
│   │   ├── pages/           # Route pages
│   │   ├── stores/          # Zustand stores
│   │   └── types/           # TypeScript types
│   ├── Dockerfile
│   └── package.json
├── docker-compose.yml
├── .env.example
└── AGENTS.md
```
