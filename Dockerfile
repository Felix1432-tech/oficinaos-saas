# ============================================
# OFICINA-OS API - Dockerfile para Coolify
# Monorepo pnpm + NestJS + Prisma
# ============================================

# ---- Builder ----
FROM node:20-alpine AS builder
WORKDIR /app

# Instala pnpm
RUN corepack enable && corepack prepare pnpm@9.0.0 --activate

# Copia arquivos de dependencias primeiro (cache layer)
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./
COPY apps/api/package.json ./apps/api/
COPY packages/database/package.json ./packages/database/
COPY packages/shared/package.json ./packages/shared/

# Instala todas as dependencias (dev + prod)
RUN pnpm install --frozen-lockfile

# Copia codigo fonte
COPY apps/api ./apps/api
COPY packages ./packages

# Build (database build ja roda prisma generate internamente)
RUN pnpm --filter @oficina-os/database build
RUN pnpm --filter @oficina-os/shared build
RUN pnpm --filter @oficina-os/api build

# ---- Runtime ----
FROM node:20-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production

# Instala pnpm
RUN corepack enable && corepack prepare pnpm@9.0.0 --activate

# Copia arquivos de dependencias
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/api/package.json ./apps/api/
COPY packages/database/package.json ./packages/database/
COPY packages/shared/package.json ./packages/shared/

# Instala dependencias de producao
RUN pnpm install --frozen-lockfile --prod

# Instala prisma CLI separado (necessario para migrate deploy)
RUN pnpm --filter @oficina-os/database add -D prisma

# Copia builds
COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/packages/database/dist ./packages/database/dist
COPY --from=builder /app/packages/database/prisma ./packages/database/prisma
COPY --from=builder /app/packages/shared/dist ./packages/shared/dist

# Gera Prisma Client no runtime (binarios nativos para alpine)
RUN cd packages/database && npx prisma generate

EXPOSE 3333

HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3333/api/health/live || exit 1

# Migrations + start
CMD ["sh", "-c", "cd packages/database && npx prisma migrate deploy && cd /app && node apps/api/dist/main.js"]
