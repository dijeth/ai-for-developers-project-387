# Multi-stage build for Calendar Booking MVP
# Stage 1: Dependencies (used as base for development services via docker compose)
FROM node:20-alpine AS deps

WORKDIR /app

# Copy root package.json for workspace resolution
COPY package*.json ./
COPY apps/api/package*.json ./apps/api/
COPY apps/web/package*.json ./apps/web/
COPY packages/api-contracts/package*.json ./packages/api-contracts/
COPY packages/date-utils/package*.json ./packages/date-utils/
COPY packages/date-utils/tsconfig.json ./packages/date-utils/

# Copy Prisma schema (required for postinstall hook)
COPY apps/api/prisma ./apps/api/prisma

# Create empty node_modules for packages to ensure reliability of next stages 
RUN mkdir -p /app/packages/api-contracts/node_modules
RUN mkdir -p /app/packages/date-utils/node_modules

# Install dependencies
RUN npm ci

# Stage 2: Build API Spec (TypeSpec -> OpenAPI)
FROM node:20-alpine AS spec-builder

WORKDIR /app
COPY packages/api-contracts ./packages/api-contracts
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/packages/api-contracts/node_modules ./packages/api-contracts/node_modules
COPY --from=deps /app/package*.json ./

# Generate OpenAPI from TypeSpec
RUN npm run compile -w api-contracts

# Stage 3: Build all applications
FROM node:20-alpine AS builder

WORKDIR /app

# Copy all source code
COPY apps/api ./apps/api
COPY apps/web ./apps/web
COPY packages/date-utils ./packages/date-utils

COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/package*.json ./
COPY --from=deps /app/apps/api/package*.json ./apps/api/
COPY --from=deps /app/apps/web/package*.json ./apps/web/
COPY --from=deps /app/packages/date-utils/package*.json ./packages/date-utils/

COPY --from=spec-builder /app/packages/api-contracts ./packages/api-contracts

# Build all packages and applications
RUN npm run build -w @calendar/date-utils
RUN npm run build -w api
RUN npm run copy-themes -w web
RUN npm run build -w web

# Stage 4: E2E web image (prebuilt static frontend + nginx)
FROM nginx:alpine AS e2e-web

COPY --from=builder /app/apps/web/dist /usr/share/nginx/html
COPY --from=builder /app/apps/web/public/themes /usr/share/nginx/html/themes
COPY docker/nginx-e2e.conf /etc/nginx/conf.d/default.conf

EXPOSE 3000

# Stage 5: Production image
FROM nginx:alpine AS production

# Install Node.js, timezone data and gettext for envsubst
RUN apk add --no-cache nodejs tzdata gettext

# Set timezone to UTC for consistent date parsing across environments
ENV TZ=UTC

WORKDIR /app

# Copy API build and runtime dependencies
COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/apps/api/prisma ./apps/api/prisma
COPY --from=builder /app/node_modules ./node_modules
# Copy only compiled date-utils (workspace symlink in node_modules points here)
COPY --from=builder /app/packages/date-utils/dist ./packages/date-utils/dist
COPY --from=builder /app/packages/date-utils/package.json ./packages/date-utils/package.json

# Copy frontend build to nginx html
COPY --from=builder /app/apps/web/dist /usr/share/nginx/html

# Copy themes from public folder
COPY --from=builder /app/apps/web/public/themes /usr/share/nginx/html/themes

# Create data directory for SQLite with proper permissions
# Hugging Face Spaces uses /data for persistent storage
RUN mkdir -p /data && chmod 777 /data
RUN ln -sf /data /app/apps/api/data

# Named volume for persistent SQLite storage
VOLUME ["/data"]

# Copy nginx configuration template
COPY docker/nginx.conf.template /etc/nginx/conf.d/default.conf.template

# Copy startup script
COPY docker/start.sh /app/start.sh
RUN chmod +x /app/start.sh

# Environment variables
ENV NODE_ENV=production
ENV PORT=7860
ENV API_PORT=3001
ENV DATABASE_URL="file:/data/prod.db"

# Expose ports (PORT is Hugging Face Spaces standard port, configurable via env)
EXPOSE ${PORT}

# Start both backend and nginx
CMD ["/app/start.sh"]
