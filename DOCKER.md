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

# Local E2E debug (host builds + override)
npm run e2e:local
npm run e2e:local:ui
npm run e2e:local:down

# Production / Hugging Face
npm run start            # Production container on port 7860
npm run start:down       # Stop production container

# Cleanup
npm run docker:clean     # Stop all containers and remove volumes (clears DB)
```

## Compose Profiles

All environments use a single compose file: docker-compose.app.yml.

| Profile | Services                                                 | Purpose                                   |
| ------- | -------------------------------------------------------- | ----------------------------------------- |
| dev     | contracts-watcher, api-dev-init, api-dev, prism, web-dev | Local development with OpenAPI validation |
| e2e     | api-e2e, web-e2e                                         | Deterministic Playwright environment      |
| prod    | app                                                      | Production runtime (Hugging Face Spaces)  |

## Development Profile

### Start and Stop

```bash
# Start
npm run dev

# Stop
docker compose -f docker-compose.app.yml --profile dev down
```

### Architecture

```text
contracts-watcher (TypeSpec + web types)
  ├─ generates packages/contracts/openapi.yaml
  └─ generates apps/web/src/types/generated/api-types.ts

api-dev-init (one-shot)
  └─ db push + seed to /data/dev.db

api-dev (:3001)
prism  (:4010) proxy -> api-dev
web-dev (:3000) proxy /api -> prism
```

### Service Notes

- contracts-watcher runs initial generation, then keeps both watchers alive.
- api-dev-init is a one-shot initializer and must complete successfully before api-dev starts.
- prism restarts automatically when packages/contracts/openapi.yaml changes via docker compose develop.watch.
- web-dev starts only after contracts-watcher is healthy and prism is running.

## E2E Profile

### Start and Stop

```bash
# Start + run tests
npm run e2e

# UI mode
npm run e2e:ui

# Stop
docker compose -f docker-compose.app.yml --profile e2e down -v
```

### Architecture

```text
web-e2e (:3000, nginx)
  └─ proxies /api -> api-e2e:3001

api-e2e (:3001)
  ├─ build date-utils + api
  ├─ prisma generate + db push
  └─ start prod server (no startup seed)
```

### Why Separate E2E Profile

- No Prism or dev watchers in the test path.
- Stable startup and health checks for CI.
- Database reset/seed is controlled by tests through api/testing/reset endpoint.

### Local E2E Debug Mode

Use docker-compose.app.override.local.yml to mount host-built artifacts:

```bash
# Build host artifacts first
npm run build -w api
npm run build -w web

# Start e2e with override and run tests
npm run e2e:local
```

In local debug mode:

- api-e2e uses mounted dist and prisma folders.
- web-e2e serves mounted apps/web/dist.
- API logs are written to volume api_logs.

## Production Profile

### Runtime Model

Single container image from Dockerfile:

- Nginx serves frontend on port 7860.
- Node.js runs NestJS API on port 3001 inside the same container.
- SQLite persistent data at /data/prod.db.

### Start and Stop

```bash
npm run start
npm run start:down
```

### Health and Readiness

- Compose healthcheck: GET http://localhost:3001/health.
- Startup readiness in docker/start.sh: waits for GET http://127.0.0.1:3001/api/owner.

## Dockerfile Stages

```text
deps       -> install workspace dependencies
build      -> compile contracts + build shared package + api + web
production -> nginx + node runtime image for production
```

## Key Files

- docker-compose.app.yml
- docker-compose.app.override.local.yml
- Dockerfile
- Dockerfile.app
- docker/nginx.conf
- docker/nginx-e2e.conf
- docker/start.sh

## Troubleshooting

### Validate compose config

```bash
docker compose -f docker-compose.app.yml --profile dev config
docker compose -f docker-compose.app.yml --profile e2e config
docker compose -f docker-compose.app.yml -f docker-compose.app.override.local.yml --profile e2e config
```

### Inspect logs

```bash
docker compose -f docker-compose.app.yml logs -f contracts-watcher
docker compose -f docker-compose.app.yml logs -f api-dev
docker compose -f docker-compose.app.yml logs -f prism
docker compose -f docker-compose.app.yml logs -f web-dev
docker compose -f docker-compose.app.yml logs -f api-e2e
docker compose -f docker-compose.app.yml logs -f web-e2e
```

### Full reset

```bash
docker compose -f docker-compose.app.yml down -v
docker compose -f docker-compose.app.yml --profile dev up --build
```

## Security Notes

- MVP setup keeps SQLite at permissive permissions for container compatibility.
- CORS is enabled for development and e2e workflows.
- No authentication layer is enabled in MVP by design.
