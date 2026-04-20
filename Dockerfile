# Production-focused multi-stage build for Calendar Booking MVP
# This file intentionally excludes e2e and dev-only build stages.

# Stage 1: Install dependencies once using workspace manifests
FROM node:20-alpine AS deps

WORKDIR /app

COPY package*.json ./
COPY apps/api/package*.json ./apps/api/
COPY apps/web/package*.json ./apps/web/
COPY packages/api-contracts/package*.json ./packages/api-contracts/
COPY packages/date-utils/package*.json ./packages/date-utils/
COPY packages/date-utils/tsconfig.json ./packages/date-utils/

# Prisma schema is needed for api postinstall (prisma generate)
COPY apps/api/prisma ./apps/api/prisma

RUN mkdir -p /app/packages/api-contracts/node_modules
RUN mkdir -p /app/packages/date-utils/node_modules
RUN npm ci

# Stage 2: Build production artifacts
FROM node:20-alpine AS build

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/package*.json ./
COPY --from=deps /app/apps/api/package*.json ./apps/api/
COPY --from=deps /app/apps/web/package*.json ./apps/web/
COPY --from=deps /app/packages/date-utils/package*.json ./packages/date-utils/
COPY --from=deps /app/packages/api-contracts/package*.json ./packages/api-contracts/

COPY apps/api ./apps/api
COPY apps/web ./apps/web
COPY packages/api-contracts ./packages/api-contracts
COPY packages/date-utils ./packages/date-utils

RUN npm run compile -w api-contracts
RUN npm run build -w @calendar/date-utils
RUN npm run build -w api
RUN npm run copy-themes -w web
RUN npm run build -w web

# Stage 3: Production runtime image
FROM nginx:alpine AS production

# Node.js is required to run NestJS API in the same container.
RUN apk add --no-cache nodejs tzdata gettext wget

ENV TZ=UTC
WORKDIR /app

COPY --from=build /app/apps/api/dist ./apps/api/dist
COPY --from=build /app/apps/api/prisma ./apps/api/prisma
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/packages/date-utils/dist ./packages/date-utils/dist
COPY --from=build /app/packages/date-utils/package.json ./packages/date-utils/package.json

COPY --from=build /app/apps/web/dist /usr/share/nginx/html
COPY --from=build /app/apps/web/public/themes /usr/share/nginx/html/themes

RUN mkdir -p /data && chmod 777 /data
RUN ln -sf /data /app/apps/api/data

VOLUME ["/data"]

COPY docker/nginx.conf.template /etc/nginx/conf.d/default.conf.template
COPY docker/start.sh /app/start.sh
RUN chmod +x /app/start.sh

ENV NODE_ENV=production
ENV PORT=7860
ENV API_PORT=3001
ENV DATABASE_URL="file:/data/prod.db"

EXPOSE 7860

HEALTHCHECK --interval=60s --timeout=5s --retries=3 --start-period=40s \
  CMD wget -q -O - "http://127.0.0.1:${API_PORT}/health" || exit 1

CMD ["/app/start.sh"]
