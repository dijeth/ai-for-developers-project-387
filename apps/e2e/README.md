# E2E Testing Debug Guide

## Quick Reference

### Regular Docker Test (slow, full rebuild)
```bash
npm run test:docker
```

### Fast Docker Test (no rebuild, use for debugging)
```bash
# First time only - build base images
npm run test:docker

# For subsequent runs with code changes:
npm run test:docker:fast
```

## Debugging 400 Errors from API

### View API logs in real-time
```bash
# Terminal 1: watch logs
npm run test:docker:logs

# Terminal 2: run tests
npm run test:docker:fast
```

### Check specific error in logs
```bash
cd apps/e2e
docker compose logs api | grep "400"
docker compose logs api | grep -A 5 "Bad Request"
```

### Manually test API endpoint
```bash
cd apps/e2e

# Get container IP
docker compose exec web wget -qO- http://api:3001/api/owner

# Or from host (port 3001 mapped)
curl http://localhost:3001/api/owner
```

## Fast Development Workflow

When you need to iterate quickly on test code or app code:

### 1. Initial setup (one time)
```bash
cd apps/e2e
docker compose up --build -d
```

### 2. Development loop
```bash
# Edit test code in apps/e2e/tests/
# OR edit app code in apps/api/src/ or apps/web/src/

# Rebuild host code (fast, no docker rebuild)
npm run build -w api
npm run build -w web

# Restart containers with new code
docker compose restart

# Run tests
WEB_SERVER_MODE=external npx playwright test
```

### 3. Full logs view
```bash
# All logs
docker compose logs -f

# Just API with timestamps
docker compose logs api -f -t
```

## Common Issues

### 400 errors on date endpoints

**Cause:** Alpine Linux without timezone data handles dates differently.

**Fix:** Added `TZ=UTC` and `tzdata` package (already done).

**Verify:**
```bash
docker compose exec api env | grep TZ
# Should show TZ=UTC
```

### Tests pass locally but fail in Docker

Check for environment differences:
1. `NODE_ENV` (local=development, Docker=production)
2. Timezone settings (see above)
3. Database state (seed data differences)

```bash
# Reset database in Docker
docker compose down -v
docker compose up -d
```

### Container not starting

Check healthcheck:
```bash
docker compose ps
docker compose logs api | tail -50
```

### Nginx proxy errors (502 Bad Gateway)

**Symptom:** Web returns 502 when accessing `/api/*`

**Cause:** API container not ready or not accessible

**Fix:**
```bash
# Check if API is healthy
docker compose ps

# Check API logs
docker compose logs api | tail -20

# Test API directly from web container
docker compose exec web wget -qO- http://api:3001/api/owner

# Restart if needed
docker compose restart api
```

## CI vs Local Differences

| Aspect | Local Dev | Docker (CI-like) |
|--------|-----------|------------------|
| NODE_ENV | development | production |
| TZ | System default | UTC |
| Database | SQLite file | SQLite in container |
| Frontend | Vite dev server | nginx (production-like) |
| Backend | NestJS dev | NestJS production |

## Advanced Debugging

### Enable verbose Playwright logging
```bash
DEBUG=pw:api WEB_SERVER_MODE=external npx playwright test
```

### Screenshot and trace on failure (enabled by default)
```bash
# View HTML report
npx playwright show-report

# Open trace viewer
npx playwright show-trace test-results/trace.zip
```

### Network inspection
```bash
# Capture HAR (HTTP Archive)
WEB_SERVER_MODE=external npx playwright test --project=chromium --reporter=line --grep="test name"
# Then check test-results/
```

## Environment Variables

Key env vars affecting E2E tests:

| Variable | Purpose | Default |
|----------|---------|---------|
| `WEB_SERVER_MODE` | Use external servers vs auto-start | undefined (auto) |
| `TZ` | Timezone for consistent dates | UTC |
| `LOG_LEVEL` | API logging verbosity | debug (in override) |
| `DEBUG` | Enable debug output | true (in override) |
| `CI` | CI mode (retries, forbidOnly) | false |
