# ============================================
# OFICINA-OS API - Dockerfile para Coolify
# Monorepo pnpm + NestJS + Prisma
# ============================================

# ---- Builder ----
FROM node:20-alpine AS builder
WORKDIR /app

# Instala pnpm
RUN corepack enable && corepack prepare pnpm@9.0.0 --activate

# Copia arquivos de dependências primeiro (cache layer)
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./
COPY apps/api/package.json ./apps/api/
COPY packages/database/package.json ./packages/database/
COPY packages/shared/package.json ./packages/shared/

# Instala todas as dependências
RUN pnpm install --frozen-lockfile

# Copia código fonte
COPY apps/api ./apps/api
COPY packages ./packages

# Gera Prisma Client
RUN pnpm --filter @oficina-os/database db:generate

# Build dos packages e da API
RUN pnpm --filter @oficina-os/database build
RUN pnpm --filter @oficina-os/shared build
RUN pnpm --filter @oficina-os/api build

# ---- Runtime ----
FROM node:20-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production

# Instala pnpm
RUN corepack enable && corepack prepare pnpm@9.0.0 --activate

# Copia arquivos de dependências
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/api/package.json ./apps/api/
COPY packages/database/package.json ./packages/database/
COPY packages/shared/package.json ./packages/shared/

# Instala apenas dependências de produção
RUN pnpm install --frozen-lockfile --prod

# Copia builds
COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/packages/database/dist ./packages/database/dist
COPY --from=builder /app/packages/database/prisma ./packages/database/prisma
COPY --from=builder /app/packages/shared/dist ./packages/shared/dist

# Gera Prisma Client no runtime (necessário para binários nativos)
RUN pnpm --filter @oficina-os/database db:generate

# Expõe porta
EXPOSE 3333

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3333/api/health/live || exit 1

# Roda migrations e inicia a API
CMD ["sh", "-c", "cd packages/database && npx prisma migrate deploy && cd /app && node apps/api/dist/main.js"]
