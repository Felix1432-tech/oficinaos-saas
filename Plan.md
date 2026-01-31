# OficinaOS - Plano de Implementação

## 📋 Sumário Executivo

**OficinaOS** é um SaaS multi-tenant para gestão de oficinas mecânicas automotivas, com CRM Kanban como coração do sistema, gestão de propostas/orçamentos, catálogo de peças/serviços, e landing pages públicas com orçamento gamificado.

---

## 🔧 Assumptions (Decisões Tomadas)

### Arquitetura
1. **Monorepo Structure**: Turborepo com workspaces (`apps/web`, `apps/api`, `packages/*`)
2. **PDF Engine**: Playwright (mais estável que Puppeteer, já usado em testes)
3. **File Storage**: MinIO (S3-compatible) em dev, configurável para AWS S3/R2 em prod
4. **Email**: Nodemailer com SMTP mock (Mailhog) em dev
5. **Rate Limiting**: @nestjs/throttler com Redis store
6. **Session Strategy**: JWT stateless com refresh tokens (7d access, 30d refresh)

### Multi-Tenancy
1. **Estratégia**: Row-Level Security via `tenant_id` em todas as tabelas
2. **Resolução**: Header `X-Tenant-ID` ou subdomain parsing
3. **Superadmin**: Usuários com `tenant_id = NULL` têm acesso cross-tenant

### Domínio
1. **Moeda**: BRL (Real brasileiro) com 2 decimais
2. **Timezone**: America/Sao_Paulo como default, configurável por tenant
3. **Idioma**: pt-BR como default
4. **Placa Veículo**: Formato Mercosul (ABC1D23) e antigo (ABC-1234)

### Catálogo
1. **Markup/Margem**: Stored como percentual (0-100+)
2. **Custo Médio**: Calculado via média ponderada nas entradas
3. **Preço Sugerido**: `custo_medio * (1 + markup/100)`

### CRM
1. **Pipeline**: Uma pipeline por tenant (MVP), múltiplas (futuro)
2. **Stage Order**: Definido por campo `position` (drag reorder)
3. **SLA**: Configurável por stage (horas)

### Timeline/Auditoria
1. **Granularidade**: Toda mutação em entidades críticas
2. **Metadata**: JSON com diff (old_value, new_value)
3. **Retenção**: Sem limite (compliance)

---

## 🏗️ Arquitetura

```
┌─────────────────────────────────────────────────────────────────────┐
│                           CLIENTS                                    │
├──────────────────┬──────────────────┬───────────────────────────────┤
│   Dashboard UI   │   Landing Page   │   Orçamento Público           │
│   (Next.js SSR)  │   (Next.js SSG)  │   (Next.js Client)            │
└────────┬─────────┴────────┬─────────┴─────────────┬─────────────────┘
         │                  │                       │
         ▼                  ▼                       ▼
┌─────────────────────────────────────────────────────────────────────┐
│                        API GATEWAY (NestJS)                          │
├─────────────────────────────────────────────────────────────────────┤
│  Auth Module  │  CRM Module  │  Catalog Module  │  Public Module    │
│  Tenant Guard │  RBAC Guard  │  Rate Limiter    │  Validation (Zod) │
└────────┬──────┴──────┬───────┴────────┬─────────┴─────────┬─────────┘
         │             │                │                   │
         ▼             ▼                ▼                   ▼
┌─────────────────────────────────────────────────────────────────────┐
│                         WORKER LAYER (BullMQ)                        │
├─────────────────────────────────────────────────────────────────────┤
│  PDF Queue  │  Email Queue  │  Invoice Queue  │  FollowUp Queue     │
└──────┬──────┴───────┬───────┴────────┬────────┴──────────┬──────────┘
       │              │                │                   │
       ▼              ▼                ▼                   ▼
┌─────────────────────────────────────────────────────────────────────┐
│                        DATA LAYER                                    │
├──────────────────┬──────────────────┬───────────────────────────────┤
│   PostgreSQL     │      Redis       │         MinIO (S3)            │
│   (Prisma ORM)   │   (Cache/Queue)  │       (File Storage)          │
└──────────────────┴──────────────────┴───────────────────────────────┘
```

### Estrutura do Monorepo

```
oficina-os/
├── apps/
│   ├── web/                    # Next.js 14 (App Router)
│   │   ├── app/
│   │   │   ├── (auth)/         # Login, register
│   │   │   ├── (dashboard)/    # CRM, customers, etc
│   │   │   └── p/[tenantSlug]/ # Landing pública
│   │   ├── components/
│   │   ├── hooks/
│   │   └── lib/
│   │
│   └── api/                    # NestJS Backend
│       ├── src/
│       │   ├── modules/
│       │   │   ├── auth/
│       │   │   ├── tenants/
│       │   │   ├── crm/
│       │   │   ├── customers/
│       │   │   ├── vehicles/
│       │   │   ├── proposals/
│       │   │   ├── catalog/
│       │   │   ├── invoices/
│       │   │   ├── media/
│       │   │   ├── work-orders/
│       │   │   ├── public/
│       │   │   └── dashboard/
│       │   ├── common/
│       │   │   ├── guards/
│       │   │   ├── decorators/
│       │   │   ├── interceptors/
│       │   │   └── filters/
│       │   ├── jobs/
│       │   └── prisma/
│       └── test/
│
├── packages/
│   ├── database/               # Prisma schema + client
│   ├── shared/                 # Types, utils, zod schemas
│   ├── ui/                     # Shared UI components
│   └── config/                 # ESLint, TSConfig, Tailwind
│
├── docker/
│   ├── docker-compose.yml
│   ├── docker-compose.prod.yml
│   └── Dockerfile.*
│
├── docs/
│   ├── api/
│   └── architecture/
│
├── scripts/
│   ├── seed.ts
│   └── migrate.sh
│
├── turbo.json
├── package.json
└── pnpm-workspace.yaml
```

---

## 📊 ERD (Entity Relationship Diagram)

### Core Entities

```
┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐
│     TENANTS     │       │      USERS      │       │   CRM_STAGES    │
├─────────────────┤       ├─────────────────┤       ├─────────────────┤
│ id (UUID) PK    │       │ id (UUID) PK    │       │ id (UUID) PK    │
│ name            │◄──────│ tenant_id FK    │       │ tenant_id FK    │
│ slug (unique)   │       │ email (unique)  │       │ name            │
│ plan            │       │ name            │       │ position        │
│ settings (JSON) │       │ role (enum)     │       │ color           │
│ created_at      │       │ password_hash   │       │ sla_hours       │
│ updated_at      │       │ avatar_url      │       │ is_final        │
└─────────────────┘       │ created_at      │       │ created_at      │
                          └─────────────────┘       └─────────────────┘
                                                            │
                                                            ▼
┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐
│    CUSTOMERS    │       │    VEHICLES     │       │   CRM_CARDS     │
├─────────────────┤       ├─────────────────┤       ├─────────────────┤
│ id (UUID) PK    │       │ id (UUID) PK    │       │ id (UUID) PK    │
│ tenant_id FK    │◄──────│ tenant_id FK    │       │ tenant_id FK    │
│ name            │       │ customer_id FK  │◄──────│ stage_id FK     │
│ email           │       │ plate           │       │ customer_id FK  │
│ phone           │       │ brand           │       │ vehicle_id FK   │
│ document (CPF)  │       │ model           │       │ assigned_to FK  │
│ address (JSON)  │       │ version         │       │ title           │
│ tags (array)    │       │ year            │       │ channel         │
│ source          │       │ engine          │       │ estimated_value │
│ deleted_at      │       │ mileage         │       │ complaint       │
│ created_at      │       │ fuel_type       │       │ diagnosis       │
└─────────────────┘       │ transmission    │       │ sla_deadline    │
                          │ photos (array)  │       │ tags (array)    │
                          │ damages (JSON)  │       │ position        │
                          │ deleted_at      │       │ status          │
                          │ created_at      │       │ deleted_at      │
                          └─────────────────┘       │ created_at      │
                                                    └─────────────────┘
```

### Proposals & Work Orders

```
┌─────────────────┐       ┌─────────────────────┐       ┌─────────────────┐
│    PROPOSALS    │       │   PROPOSAL_ITEMS    │       │ PROPOSAL_TMPLS  │
├─────────────────┤       ├─────────────────────┤       ├─────────────────┤
│ id (UUID) PK    │       │ id (UUID) PK        │       │ id (UUID) PK    │
│ tenant_id FK    │◄──────│ proposal_id FK      │       │ tenant_id FK    │
│ card_id FK      │       │ type (enum)         │       │ name            │
│ customer_id FK  │       │ catalog_item_id FK  │       │ template (JSON) │
│ vehicle_id FK   │       │ description         │       │ is_default      │
│ template_id FK  │       │ quantity            │       │ created_at      │
│ number (seq)    │       │ unit_price          │       └─────────────────┘
│ status          │       │ cost_price          │
│ subtotal        │       │ markup_percent      │       ┌─────────────────┐
│ discount        │       │ discount            │       │   WORK_ORDERS   │
│ taxes           │       │ total               │       ├─────────────────┤
│ total           │       │ notes               │       │ id (UUID) PK    │
│ margin          │       │ created_at          │       │ tenant_id FK    │
│ profit          │       └─────────────────────┘       │ proposal_id FK  │
│ validity_days   │                                     │ card_id FK      │
│ warranty        │                                     │ customer_id FK  │
│ payment_terms   │                                     │ vehicle_id FK   │
│ notes           │                                     │ number (seq)    │
│ pdf_url         │                                     │ status          │
│ sent_at         │                                     │ started_at      │
│ approved_at     │                                     │ finished_at     │
│ deleted_at      │                                     │ entry_photos    │
│ created_at      │                                     │ exit_photos     │
└─────────────────┘                                     │ notes           │
                                                        │ total_cost      │
                                                        │ total_revenue   │
                                                        │ margin          │
                                                        │ terms_accepted  │
                                                        │ created_at      │
                                                        └─────────────────┘
```

### Catalog

```
┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐
│  CATALOG_PARTS  │       │CATALOG_SERVICES │       │CATALOG_CONSUM.  │
├─────────────────┤       ├─────────────────┤       ├─────────────────┤
│ id (UUID) PK    │       │ id (UUID) PK    │       │ id (UUID) PK    │
│ tenant_id FK    │       │ tenant_id FK    │       │ tenant_id FK    │
│ code            │       │ code            │       │ code            │
│ name            │       │ name            │       │ name            │
│ description     │       │ description     │       │ unit            │
│ category        │       │ category        │       │ cost_avg        │
│ unit            │       │ default_time_hrs│       │ suggested_price │
│ cost_avg        │       │ labor_rate_id   │       │ stock_qty       │
│ suggested_price │       │ suggested_price │       │ min_stock       │
│ markup_default  │       │ markup_default  │       │ created_at      │
│ supplier_id FK  │       │ checklist (JSON)│       └─────────────────┘
│ stock_qty       │       │ parts (array FK)│
│ min_stock       │       │ consumables []  │       ┌─────────────────┐
│ deleted_at      │       │ media_url       │       │    SUPPLIERS    │
│ created_at      │       │ execution_mode  │       ├─────────────────┤
└─────────────────┘       │ deleted_at      │       │ id (UUID) PK    │
                          │ created_at      │       │ tenant_id FK    │
                          └─────────────────┘       │ name            │
                                                    │ document        │
┌─────────────────┐       ┌─────────────────┐       │ contact_name    │
│  LABOR_RATES    │       │SERVICE_CHECKLIST│       │ phone           │
├─────────────────┤       ├─────────────────┤       │ email           │
│ id (UUID) PK    │       │ id (UUID) PK    │       │ address (JSON)  │
│ tenant_id FK    │       │ service_id FK   │       │ notes           │
│ name            │       │ item            │       │ created_at      │
│ category        │       │ position        │       └─────────────────┘
│ rate_per_hour   │       │ required        │
│ is_default      │       │ created_at      │
│ created_at      │       └─────────────────┘
└─────────────────┘
```

### Invoice Import & Inventory

```
┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐
│ INVOICE_IMPORTS │       │INVOICE_ITEMS_IMP│       │INVENTORY_ENTRIES│
├─────────────────┤       ├─────────────────┤       ├─────────────────┤
│ id (UUID) PK    │       │ id (UUID) PK    │       │ id (UUID) PK    │
│ tenant_id FK    │       │ import_id FK    │       │ tenant_id FK    │
│ supplier_id FK  │       │ code            │       │ part_id FK      │
│ file_url        │       │ description     │       │ consumable_id FK│
│ file_type       │       │ quantity        │       │ import_id FK    │
│ invoice_number  │       │ unit_price      │       │ type (IN/OUT)   │
│ invoice_date    │       │ total           │       │ quantity        │
│ status          │       │ unit            │       │ unit_cost       │
│ raw_data (JSON) │       │ matched_part FK │       │ total_cost      │
│ processed_at    │       │ status          │       │ reference       │
│ created_at      │       │ created_at      │       │ notes           │
└─────────────────┘       └─────────────────┘       │ created_at      │
                                                    └─────────────────┘
```

### Public & Media

```
┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐
│PUBLIC_PAGE_CFG  │       │  MEDIA_ASSETS   │       │ FOLLOWUP_RULES  │
├─────────────────┤       ├─────────────────┤       ├─────────────────┤
│ id (UUID) PK    │       │ id (UUID) PK    │       │ id (UUID) PK    │
│ tenant_id FK UQ │       │ tenant_id FK    │       │ tenant_id FK    │
│ template        │       │ type (enum)     │       │ trigger         │
│ logo_url        │       │ url             │       │ delay_hours     │
│ hero_media_url  │       │ thumbnail_url   │       │ channel         │
│ primary_color   │       │ mime_type       │       │ message_template│
│ secondary_color │       │ size_bytes      │       │ is_active       │
│ hero_title      │       │ customer_id FK  │       │ created_at      │
│ hero_subtitle   │       │ vehicle_id FK   │       └─────────────────┘
│ sections (JSON) │       │ service_id FK   │
│ social_links    │       │ work_order_id FK│       ┌─────────────────┐
│ cta_text        │       │ usage           │       │ SCHEDULED_JOBS  │
│ cta_url         │       │ ai_generated    │       ├─────────────────┤
│ services_visible│       │ ai_prompt       │       │ id (UUID) PK    │
│ is_published    │       │ created_at      │       │ tenant_id FK    │
│ updated_at      │       └─────────────────┘       │ type            │
└─────────────────┘                                 │ target_id       │
                                                    │ scheduled_for   │
┌─────────────────┐                                 │ status          │
│PUBLIC_SVC_VISIB │                                 │ attempts        │
├─────────────────┤                                 │ result (JSON)   │
│ id (UUID) PK    │                                 │ created_at      │
│ config_id FK    │                                 └─────────────────┘
│ service_id FK   │
│ display_name    │
│ display_price   │
│ position        │
│ created_at      │
└─────────────────┘
```

### Audit & Timeline

```
┌─────────────────────────────────────────────────────────────────────┐
│                        TIMELINE_EVENTS                               │
├─────────────────────────────────────────────────────────────────────┤
│ id (UUID) PK                                                        │
│ tenant_id FK                                                        │
│ entity_type (enum: card, customer, vehicle, proposal, work_order)   │
│ entity_id (UUID)                                                    │
│ action (enum: created, updated, deleted, moved, sent, approved...)  │
│ actor_user_id FK (nullable for system)                              │
│ actor_role                                                          │
│ metadata (JSON: { old_value, new_value, details })                  │
│ ip_address                                                          │
│ user_agent                                                          │
│ created_at                                                          │
├─────────────────────────────────────────────────────────────────────┤
│ INDEXES: (tenant_id, entity_type, entity_id), (tenant_id, created_at)│
└─────────────────────────────────────────────────────────────────────┘
```

---

## 🗺️ Roadmap de Implementação

### Etapa 1: Scaffold + Infraestrutura (2-3h)
- [x] Criar estrutura monorepo com Turborepo + pnpm
- [x] Configurar docker-compose (Postgres, Redis, MinIO, Mailhog)
- [x] Setup NestJS com módulos base
- [x] Setup Next.js 14 com App Router
- [x] Configurar Prisma schema base
- [x] Health checks funcionais
- [x] Scripts de desenvolvimento

### Etapa 2: Auth + RBAC + Tenant Context (2-3h)
- [ ] Prisma schema: tenants, users
- [ ] NestJS Auth module (JWT)
- [ ] Guards: TenantGuard, RolesGuard
- [ ] Decorators: @CurrentUser, @Tenant
- [ ] NextAuth integration
- [ ] Login UI + protected routes

### Etapa 3: CRM Kanban + Timeline (3-4h)
- [ ] Prisma schema: stages, cards, timeline
- [ ] CRUD API stages + cards
- [ ] Move card API com timeline event
- [ ] Kanban UI com dnd-kit
- [ ] Card drawer com tabs
- [ ] Timeline component

### Etapa 4: Customers + Vehicles (2h)
- [ ] Prisma schema: customers, vehicles
- [ ] CRUD APIs
- [ ] Customer list + detail pages
- [ ] Vehicle forms com fotos
- [ ] Histórico no customer detail

### Etapa 5: Proposals + PDF (3-4h)
- [ ] Prisma schema: proposals, items, templates
- [ ] Proposal builder API
- [ ] Cálculo margem/lucro
- [ ] PDF generation com Playwright
- [ ] Email sending (mock)
- [ ] UI: proposal builder, preview, send

### Etapa 6: Catalog + Invoice Import (3h)
- [ ] Prisma schema: parts, services, consumables, suppliers
- [ ] CRUD APIs catálogo
- [ ] Invoice upload + parsing (stub)
- [ ] Tela conferência
- [ ] Inventory entries

### Etapa 7: Landing + Wizard + Follow-up (3-4h)
- [ ] Prisma schema: public config, followup rules
- [ ] Landing page dinâmica
- [ ] Wizard orçamento multi-step
- [ ] Criação automática card CRM
- [ ] Jobs follow-up
- [ ] Seed script completo

---

## ✅ Checklist de Qualidade

### Segurança
- [ ] Tenant isolation em todas queries
- [ ] Input validation com Zod
- [ ] Rate limiting rotas públicas
- [ ] Password hashing (bcrypt/argon2)
- [ ] CORS configurado
- [ ] Headers de segurança
- [ ] Soft delete em entidades críticas

### Multi-Tenancy
- [ ] tenant_id em todas tabelas
- [ ] TenantGuard em rotas autenticadas
- [ ] Índices compostos (tenant_id, *)
- [ ] Superadmin bypass funcional

### Observabilidade
- [ ] Structured logging (pino)
- [ ] Health checks
- [ ] Request tracing
- [ ] Error handling global

### Testes
- [ ] Smoke tests API
- [ ] Auth flow test
- [ ] Multi-tenant isolation test

---

## 🔮 Evoluções Futuras

### Fase 2
1. **Lookup Placa**: Integração API FIPE + serviços de consulta
2. **WhatsApp Business API**: Notificações reais
3. **Cotação Peças Online**: Marketplace integrations

### Fase 3
1. **App Mobile**: React Native
2. **Integrações Contábeis**: NFe, ERP
3. **IA Avançada**: Diagnóstico preditivo

### Fase 4
1. **Marketplace Peças**: Entre oficinas
2. **Agendamento Online**: Booking público
3. **Analytics Avançado**: ML insights

---

## 🚀 Como Executar

### Desenvolvimento

```bash
# Clone e instale
pnpm install

# Suba infraestrutura
docker-compose up -d

# Migrations
pnpm db:migrate

# Seed
pnpm db:seed

# Dev
pnpm dev
```

### URLs

- **Frontend**: http://localhost:3000
- **API**: http://localhost:3001
- **API Docs**: http://localhost:3001/docs
- **MinIO Console**: http://localhost:9001
- **Mailhog**: http://localhost:8025

---

*OficinaOS - Plan v1.0 - Synkra AIOS*
