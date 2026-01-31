# OficinaOS

Sistema de Gestão para Oficinas Mecânicas - SaaS Multi-tenant

## Stack

- **Frontend**: Next.js 14 (App Router) + TypeScript + Tailwind + shadcn/ui
- **Backend**: NestJS + TypeScript (REST) + Zod
- **Database**: PostgreSQL + Prisma ORM
- **Auth**: NextAuth + JWT
- **Queue**: BullMQ + Redis
- **Storage**: MinIO (S3 compatible)
- **Monorepo**: Turborepo + pnpm

## Requisitos

- Node.js 18+
- pnpm 9+
- Docker e Docker Compose

## Início Rápido

### 1. Clone e Instale

```bash
cd meu-projeto
pnpm install
```

### 2. Configure Variáveis de Ambiente

```bash
# Copie os arquivos de exemplo
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env
cp packages/database/.env.example packages/database/.env
```

### 3. Suba a Infraestrutura

```bash
# Sobe PostgreSQL, Redis, MinIO e Mailhog
docker-compose up -d
```

### 4. Execute Migrations e Seed

```bash
# Gera o client Prisma
pnpm db:generate

# Executa migrations
pnpm db:migrate

# Popula com dados de exemplo
pnpm db:seed
```

### 5. Inicie o Desenvolvimento

```bash
pnpm dev
```

## URLs

| Serviço | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| API | http://localhost:3001 |
| API Docs (Swagger) | http://localhost:3001/docs |
| MinIO Console | http://localhost:9001 |
| Mailhog (Email) | http://localhost:8025 |

## Credenciais de Demonstração

**Admin da Oficina Demo:**
- Email: `admin@oficina-demo.com`
- Password: `admin123`

**Super Admin:**
- Email: `superadmin@oficina-os.com`
- Password: `admin123`

**Tenant Demo Slug:** `oficina-demo`

## Estrutura do Projeto

```
oficina-os/
├── apps/
│   ├── web/          # Next.js Frontend
│   └── api/          # NestJS Backend
├── packages/
│   ├── database/     # Prisma schema + client
│   └── shared/       # Types, utils, zod schemas
├── docker/
└── docs/
```

## Módulos Principais

- **CRM Kanban**: Pipeline de leads com drag-and-drop
- **Clientes**: Cadastro e histórico de clientes
- **Veículos**: Gerenciamento de veículos
- **Orçamentos**: Criação e envio de propostas
- **Catálogo**: Peças, serviços e fornecedores
- **OS**: Ordens de serviço
- **Media Library**: Upload e organização de mídias
- **Landing Pública**: Página pública por oficina
- **Orçamento Online**: Wizard gamificado

## API Endpoints

### Auth
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Perfil do usuário

### CRM
- `GET /api/crm/kanban` - Board completo
- `GET /api/crm/stages` - Listar estágios
- `GET /api/crm/cards` - Listar cards
- `POST /api/crm/cards` - Criar card
- `PUT /api/crm/cards/:id/move` - Mover card

### Customers
- `GET /api/customers` - Listar clientes
- `POST /api/customers` - Criar cliente
- `GET /api/customers/:id/history` - Histórico

### Proposals
- `GET /api/proposals` - Listar orçamentos
- `POST /api/proposals` - Criar orçamento
- `POST /api/proposals/:id/send` - Enviar

### Public
- `GET /api/public/:slug/config` - Config da landing
- `POST /api/public/:slug/quote` - Submeter orçamento

## Scripts

```bash
# Desenvolvimento
pnpm dev              # Inicia todos os apps

# Build
pnpm build            # Build de produção

# Database
pnpm db:generate      # Gera Prisma Client
pnpm db:migrate       # Executa migrations
pnpm db:seed          # Popula dados
pnpm db:studio        # Abre Prisma Studio

# Docker
pnpm docker:up        # Sobe containers
pnpm docker:down      # Para containers
pnpm docker:logs      # Ver logs
```

## Multi-Tenancy

O sistema usa isolamento por `tenant_id` em todas as tabelas:

- Cada oficina é um tenant
- Usuários pertencem a um tenant
- Super admins (`tenant_id = null`) acessam tudo
- Guards garantem isolamento no backend

## Timeline / Auditoria

Todas as ações importantes são registradas na tabela `timeline_events`:

```typescript
{
  tenantId: string;
  entityType: 'card' | 'customer' | 'proposal' | ...;
  entityId: string;
  action: 'CREATED' | 'UPDATED' | 'MOVED' | ...;
  actorUserId: string;
  metadata: { old_value, new_value, ... };
  createdAt: Date;
}
```

## Evoluções Futuras

- [ ] Lookup de placa (FIPE)
- [ ] Integração WhatsApp Business
- [ ] Cotação online de peças
- [ ] App mobile
- [ ] Dashboard com IA

---

**OficinaOS** - Desenvolvido com Synkra AIOS
