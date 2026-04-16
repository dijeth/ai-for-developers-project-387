# Docker Deployment Guide

## Quick Reference

```bash
# Development (Docker Compose with profiles)
npm run dev              # Start dev environment
npm run dev:down         # Stop dev environment

# E2E Testing
npm run e2e              # Start E2E services and run tests
npm run e2e:ui           # Interactive UI mode
npm run e2e:down         # Stop E2E services

# Production / Hugging Face
npm run start            # Production container on port 7860
npm run start:down       # Stop production container

# Cleanup
npm run docker:clean     # Stop all containers and remove volumes (clears DB!)
```

## Docker Compose Profiles

All environments use unified `docker-compose.yml` with profiles:

| Profile | Services | Usage |
|---------|----------|-------|
| `dev` | spec-watcher, type-watcher, api-dev, prism, web-dev | Local development |
| `e2e` | api-e2e, web-builder-e2e, web-e2e | E2E testing |
| `prod` | app | Production / Hugging Face |

## Development Profile

### Prerequisites
- Docker (with Docker Compose plugin)

### Commands

```bash
# Start development environment
npm run dev
# Or explicitly:
docker compose --profile dev up --build

# Stop
docker compose --profile dev down

# View logs
docker compose logs -f api-dev
docker compose logs -f web-dev
docker compose logs -f prism
```

### Development Architecture

```
┌─────────────┐   ┌─────────┐   ┌─────────┐   ┌─────────┐
│  spec-      │ → │ type-   │   │  api-   │   │  web-   │
│  watcher    │   │ watcher │   │  dev    │ ← │  dev    │
│ (:4010 tsp) │   │(types)  │   │ (:3001) │   │ (:3000) │
└─────────────┘   └─────────┘   └────▲────┘   └────┬────┘
                                     │              │
                                     └──────────────┘
                                           │
                                    ┌─────────────┐
                                    │   Prism     │
                                    │   (:4010)   │
                                    └─────────────┘
```

**Services:**
- `spec-watcher`: TypeSpec watch mode (compiles `.tsp` → `openapi.yaml`)
- `type-watcher`: Auto-regenerates TypeScript types from `openapi.yaml`
- `api-dev`: NestJS dev server (:3001) with auto-migrations and seeding
- `prism`: OpenAPI validation proxy (:4010)
- `web-dev`: Vite dev server (:3000) with HMR

## E2E Testing Profile

### Commands

```bash
# Run tests (starts services automatically)
npm run e2e

# Interactive UI mode
npm run e2e:ui

# Stop E2E services
npm run e2e:down
```

### Architecture

```
┌─────────────┐      ┌─────────────┐
│  web-e2e    │─────▶│   api-e2e   │
│  (nginx)    │      │   (:3001)   │
│  (:3000)    │      │   SQLite    │
└─────────────┘      └─────────────┘
```

**Services:**
- `api-e2e`: Production build of API on port 3001
- `web-builder-e2e`: Builds frontend for testing
- `web-e2e`: Nginx serving built frontend on port 3000

### Fast Debug Mode

For debugging without full Docker rebuild:

```bash
# 1. Build locally first
npm run build -w api
npm run build -w web

# 2. Start with override (mounts local builds)
docker compose -f docker-compose.yml -f docker-compose.override.local.yml --profile e2e up -d

# 3. Run tests
cd apps/e2e && npx playwright test
```

## Production Profile (Hugging Face)

### Architecture

```
┌─────────────────────────────────────────────┐
│              Nginx (Port 7860)              │
│  ┌──────────────┐      ┌──────────────────┐ │
│  │ Static files │      │ Proxy /api/*     │ │
│  │ (Vue build)  │──────│ → Node.js:3001   │ │
│  └──────────────┘      └──────────────────┘ │
└─────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────┐
│           NestJS API (Port 3001)            │
│                                              │
│  • Prisma ORM + SQLite                      │
│  • Database: /data/prod.db                 │
└─────────────────────────────────────────────┘
```

### Deployment

**Hugging Face Spaces** (recommended):
- Auto-deploys on push to `main` via GitHub Actions
- See `.github/workflows/huggingface-deploy.yml`

**Manual deploy:**
```bash
pip install huggingface-hub
huggingface-cli login
git remote add hf https://huggingface.co/spaces/YOUR_USERNAME/YOUR_SPACE_NAME
git push hf main
```

### Important Notes

- **Port**: 7860 (Hugging Face Spaces standard)
- **Persistent Storage**: Enable in Space Settings, uses `/data`
- **Health Check**: `GET /api/owner` on port 7860
- **SQLite**: Database at `/data/prod.db`

## Build Process (Multi-stage)

```
Stage 1: deps
  └── Install npm dependencies (used for development)

Stage 2: spec-builder
  └── Generate OpenAPI from TypeSpec

Stage 3: builder
  ├── Build shared packages (date-utils)
  ├── Build NestJS API
  ├── Generate Prisma client
  └── Build Vue.js frontend

Stage 4: production
  ├── Nginx (serves static files)
  ├── Node.js (runs API)
  └── SQLite volume (persistent data)
```

## File Structure

```
docker/
├── nginx.conf          # Production nginx configuration
├── nginx-e2e.conf      # E2E nginx configuration
└── start.sh            # Production container startup script

Dockerfile              # Multi-stage build
docker-compose.yml      # Unified compose with profiles
docker-compose.override.yml  # Optional override for E2E debug
docker-compose.yml      # Local development
DOCKER.md               # This file
```

## Troubleshooting

### Container won't start

```bash
# Check logs
docker compose logs -f <service-name>

# Check all services
docker compose ps
```

### Database permission errors

```bash
# Check permissions inside container
docker compose exec api-e2e ls -la /data/

# Should show: drwxrwxrwx (777)
```

### Health check failures

Common causes:
1. Database not migrated → Check startup logs
2. Port misconfiguration → Verify service ports
3. Backend crash → Check service logs

### Rebuild everything

```bash
# Nuclear option: remove all and rebuild
docker compose down -v
docker system prune -a
docker compose --profile <profile> up --build
```

## Security Notes

- SQLite file has 777 permissions (required for container user)
- CORS enabled for all origins (`origin: true`)
- No authentication in MVP (as per requirements)
- Health endpoint is public (`GET /api/owner`)

## CI/CD (GitHub Actions)

- **Hexlet Check**: `.github/workflows/hexlet-check.yml` (auto-generated, runs on every push)
- **E2E Tests**: `.github/workflows/e2e.yml` (runs E2E tests with browser caching)
- **Hugging Face Deploy**: `.github/workflows/huggingface-deploy.yml` (deploys to HF Spaces on push to main)
