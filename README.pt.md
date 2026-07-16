> **🌐 Idioma / Language**
> [🇺🇸 English](./README.md) · [🇧🇷 Português](./README.pt.md)

# Invex — Sistema de Gerenciamento de Estoque em Tempo Real

Plataforma moderna e escalável de gerenciamento de estoque com atualizações em tempo real via WebSocket, construída com Go + React.

## Stack Tecnológica

| Camada | Tecnologia |
|---|---|
| Frontend | React 18, TypeScript, Vite, Tailwind CSS, TanStack Query, Zustand |
| Backend | Go 1.22, Gin, GORM, gorilla/websocket |
| Banco de Dados | PostgreSQL 16 |
| Cache & Filas | Redis 7 |
| Autenticação | JWT (bcrypt), RBAC |
| Runtime | Bun (frontend), Go (backend) |
| Containers | Docker, Docker Compose |

## Funcionalidades

- **Dashboard em tempo real** — níveis de estoque, alertas e movimentações atualizam instantaneamente via WebSocket
- **Produtos** — CRUD completo com SKU e campos prontos para código de barras (EAN/UPC/QR)
- **Múltiplos locais** — Loja, Armazém, Filial, Centro de Distribuição
- **Movimentações de estoque** — Entrada, Saída, Transferência entre locais, Ajuste Manual (todas transacionais)
- **Fornecedores** — gestão com CNPJ/CPF, contatos e endereços
- **Pedidos de Compra** — manuais e gerados automaticamente a partir de ponto de ressuprimento
- **Sistema de Alertas** — estoque baixo, ponto de ressuprimento, sem estoque, POs atrasados, ajustes suspeitos
- **Controle de acesso por função** — Admin, Gerente, Operador, Visualizador
- **Auditoria** — todas as mutações registradas com valores anteriores/posteriores

## Arquitetura

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   React SPA  │────▶│   Go (Gin)   │────▶│  PostgreSQL  │
│  (Vite + WS) │◀────│  + WebSocket │◀────│              │
└──────────────┘     └──────┬───────┘     └──────────────┘
                            │
                     ┌──────▼───────┐
                     │    Redis     │
                     │ Cache/PubSub │
                     │ / Filas      │
                     └──────────────┘
```

Fluxo em tempo real:
1. Requisição de movimentação → handler Go
2. Transação PostgreSQL (atualização atômica + histórico)
3. Broadcast WebSocket via Hub → clientes conectados
4. Ponte Redis Pub/Sub → outras instâncias do backend
5. Verificação de alertas → fila de notificações → email (configurável)

## Requisitos

- [Docker](https://docs.docker.com/get-docker/) + [Docker Compose](https://docs.docker.com/compose/install/)
- [Bun](https://bun.sh/) (para desenvolvimento frontend fora do Docker)
- [Go](https://go.dev/dl/) 1.22+ (para desenvolvimento backend fora do Docker)

## Início Rápido com Docker

```bash
# Clone e inicie tudo
git clone <repo> invex
cd invex
cp .env.example .env
docker compose up -d

# Serviços:
#   Frontend: http://localhost:5173
#   Backend:  http://localhost:8080
#   Postgres: localhost:5432
#   Redis:    localhost:6379
```

## Desenvolvimento Local

### Backend

```bash
cd backend
cp ../.env.example ../.env

# Instale dependências e execute
go mod tidy
go run ./cmd/server/main.go

# Testes
go test ./internal/...
```

### Frontend

```bash
cd frontend
bun install
bun run dev      # servidor de desenvolvimento na :5173
bun run build    # build de produção
bun run test     # vitest
```

## Variáveis de Ambiente

Veja `.env.example` para todas as opções:

| Variável | Padrão | Descrição |
|---|---|---|
| `DB_HOST` | `postgres` | Host do PostgreSQL |
| `DB_PORT` | `5432` | Porta do PostgreSQL |
| `DB_USER` | `invex` | Usuário do banco |
| `DB_PASSWORD` | `invex_secret` | Senha do banco |
| `DB_NAME` | `invex` | Nome do banco |
| `REDIS_HOST` | `redis` | Host do Redis |
| `REDIS_PORT` | `6379` | Porta do Redis |
| `JWT_SECRET` | `change-me` | Chave de assinatura JWT |
| `JWT_ACCESS_EXPIRY` | `15m` | TTL do token de acesso |
| `JWT_REFRESH_EXPIRY` | `7d` | TTL do token de renovação |
| `SMTP_HOST` | — | Servidor SMTP (alertas) |
| `SMTP_PORT` | `587` | Porta SMTP |
| `APP_PORT` | `8080` | Porta do backend |

## Migrações de Banco de Dados

Executadas automaticamente via GORM AutoMigrate na inicialização. Migrations SQL manuais em `backend/migrations/` para deploys em produção.

```bash
# Usando CLI golang-migrate (produção):
cd backend
migrate -path migrations -database "postgres://..." up
```

## Criando o Primeiro Administrador

O sistema cria 4 funções na inicialização: `admin`, `manager`, `operator`, `viewer`. Crie um usuário admin via API:

```bash
# Registrar admin (exemplo de endpoint — implemente conforme necessário)
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Admin","email":"admin@invex.com","password":"admin123","role_id":"<uuid-da-funcao-admin>"}'
```

Ou insira diretamente:
```sql
INSERT INTO users (name, email, password, role_id)
SELECT 'Admin', 'admin@invex.com', '$2a$10$...', id FROM roles WHERE name = 'admin';
```

## Visão Geral da API

URL Base: `http://localhost:8080/api`

### Autenticação

| Método | Caminho | Descrição |
|---|---|---|
| `POST` | `/auth/login` | Login — retorna JWT |
| `GET` | `/auth/me` | Informações do usuário atual |

### Produtos

| Método | Caminho | Autenticação |
|---|---|---|
| `GET` | `/products` | Todos autenticados |
| `GET` | `/products/:id` | Todos autenticados |
| `POST` | `/products` | Gerente+ |
| `PUT` | `/products/:id` | Gerente+ |
| `DELETE` | `/products/:id` | Admin |

### Estoque

| Método | Caminho | Autenticação |
|---|---|---|
| `GET` | `/inventory?view=consolidated` | Todos autenticados |
| `GET` | `/inventory?view=by-location` | Todos autenticados |

### Movimentações

| Método | Caminho | Autenticação |
|---|---|---|
| `POST` | `/movements/in` | Operador+ |
| `POST` | `/movements/out` | Operador+ |
| `POST` | `/movements/transfer` | Operador+ |
| `POST` | `/movements/adjust` | Gerente+ |

### Fornecedores, Locais, Categorias

CRUD padrão: `GET /list`, `GET /:id`, `POST`, `PUT /:id`, `DELETE /:id`

### Dashboard

| Método | Caminho | Autenticação |
|---|---|---|
| `GET` | `/dashboard` | Todos autenticados |

## Arquitetura em Tempo Real

Eventos são enviados via WebSocket em `ws://host/ws`.

Formato do evento:
```json
{ "type": "stock.updated", "payload": { ... } }
```

### Tipos de Evento

| Evento | Descrição |
|---|---|
| `stock.updated` | Saldo de estoque alterado |
| `alert.created` | Novo alerta disparado |
| `po.status_changed` | Status do pedido de compra alterado |

### Escalabilidade

A ponte Redis Pub/Sub (`internal/websocket/redis_bridge.go`) encaminha eventos entre instâncias do backend, permitindo escalabilidade horizontal atrás de um balanceador de carga.

## Sistema de Alertas

Alertas são verificados automaticamente após cada movimentação de estoque.

| Tipo de Alerta | Gatilho |
|---|---|
| `low_stock` | Quantidade ≤ min_stock (e > 0) |
| `reorder_point` | Quantidade ≤ ponto de ressuprimento |
| `out_of_stock` | Quantidade ≤ 0 |
| `po_delayed` | Pedido de compra após data prevista |
| `suspicious_adjustment` | Ajuste manual grande (configurável) |

O worker em segundo plano executa a cada 5 minutos para:
- Gerar pedidos de compra automáticos para produtos abaixo do ponto de ressuprimento
- Verificar pedidos de compra atrasados

## Guia de Implantação

### Produção com Docker

```bash
cp .env.example .env
# Edite .env com valores de produção (JWT_SECRET forte, credenciais DB reais)
docker compose up -d --build
```

### Cloudflare Workers

```bash
cd backend
bun run build    # compila frontend estático
# Faça deploy do worker API para Cloudflare
```

## Estrutura do Projeto

```
invex/
├── backend/
│   ├── cmd/server/          # Ponto de entrada
│   ├── internal/
│   │   ├── auth/            # JWT + bcrypt
│   │   ├── background/      # Workers em segundo plano
│   │   ├── config/          # Configuração de ambiente
│   │   ├── database/        # Conexões PostgreSQL + Redis
│   │   ├── dto/             # Tipos de requisição/resposta
│   │   ├── handlers/        # Handlers HTTP
│   │   ├── middleware/      # Auth + RBAC + CORS
│   │   ├── migrations/      # Auto-migrate + seed
│   │   ├── models/          # Modelos GORM
│   │   ├── router/          # Configuração de rotas
│   │   ├── services/        # Lógica de negócio
│   │   └── websocket/       # Hub WS + ponte Redis
│   ├── migrations/          # Arquivos SQL de migração
│   ├── Dockerfile
│   └── go.mod
├── frontend/
│   ├── src/
│   │   ├── api/             # Cliente Axios
│   │   ├── components/      # Componentes de UI + layout
│   │   ├── hooks/           # Hooks customizados + WS
│   │   ├── pages/           # Páginas de rota
│   │   ├── stores/          # Stores Zustand
│   │   └── types/           # Tipos TypeScript
│   ├── Dockerfile
│   └── package.json
├── docker-compose.yml
├── .env.example
└── AGENTS.md
```
