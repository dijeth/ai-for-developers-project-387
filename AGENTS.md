# AGENTS.md

## Project Overview

Calendar booking monorepo using **TypeSpec** for API-first design. Architecture: TypeSpec → OpenAPI → Prism (proxy/validation layer) → NestJS backend → Vue frontend.

## Repository Structure

```
apps/
  api/           # NestJS + Prisma backend (port 3001) - scaffold only, not used by frontend
  web/           # Vue 3 + PrimeVue frontend (port 3000) → proxies /api to :4010
  e2e/           # Playwright E2E tests (port 3000 via Playwright)
packages/
  api-spec/      # TypeSpec source files (main.tsp)
  contracts/     # Generated openapi.yaml + Prism proxy on port 4010 (forwards to :3001)
```

## Essential Commands

```bash
# Install (workspaces handled automatically)
npm install

# Development (Docker Compose with all services)
npm run dev
# - TypeSpec watcher: .tsp → openapi.yaml
# - TypeScript types watcher: openapi.yaml → generated types
# - API server (:3001) with auto-migrations and seeding
# - Prism proxy (:4010) for OpenAPI validation
# - Vite dev server (:3000) with HMR

# E2E Testing
npm run e2e      # Start E2E services and run tests
npm run e2e:ui   # Interactive UI mode

# Production (Hugging Face deployment)
npm run start    # Production container on port 7860

# Build for production (tsp:compile → build pipeline)
npm run build

# Type-check all packages
npm run typecheck

# Cleanup
npm run docker:clean  # Stop all containers and remove volumes
```

## Build Pipeline (Turbo)

Order matters:

1. `tsp:compile` (packages/api-spec) → generates `packages/contracts/openapi.yaml`
2. `build` depends on `^tsp:compile` (upstream completion)

**Never modify `packages/contracts/openapi.yaml` manually** — generated from TypeSpec.

## Package Details

### packages/api-spec

- **Entry**: `main.tsp`
- **Output**: `../contracts/openapi.yaml` (configured in `tspconfig.yaml`)
- **Commands**: `npm run build` (once), `npm run watch` / `npm run dev` (watch mode)

### packages/contracts

- **Generated**: `openapi.yaml` (OpenAPI 3.1.0)
- **Commands**:
  - `npm run mock` - Prism mock server on port 4010
  - `npm run dev` - Prism **proxy** mode (forwards to localhost:3001) with error simulation

### apps/web

- **Framework**: Vue 3 (Composition API, `<script setup>`)
- **UI**: PrimeVue with Lara Light Blue theme (copied to `public/themes/` via `postinstall`)
- **Proxy**: `/api` → `http://localhost:4010` (Prism proxy, vite.config.ts)
- **Commands**:
  - `npm run dev` - Vite dev server with HMR on port 3000
  - `npm run build` - `vue-tsc && vite build`
  - `npm run copy-themes` - copies PrimeVue themes to public/
  - `npm run generate:types` - regenerate TypeScript types from OpenAPI spec
  - `npm run watch:types` - auto-regenerate types when `openapi.yaml` changes (run in parallel with `npm run dev`)

**API Target Configuration:**
The Vite dev server proxy target can be configured via `VITE_API_TARGET` environment variable:
- Default: `http://localhost:4010` (Prism proxy for dev with OpenAPI validation)
- For E2E: `http://localhost:3001` (direct to backend)

```typescript
// vite.config.ts - uses VITE_API_TARGET env var
const API_TARGET = process.env.VITE_API_TARGET || 'http://localhost:4010'
```

#### API Client Architecture

All HTTP requests must go through the centralized API clients. Never use raw `fetch` directly in composables or components.

**Location**: `apps/web/src/api/`

```typescript
// Import from centralized API module
import { publicApi, adminApi } from '@/api'

// Public API (no auth required)
const eventTypes = await publicApi.listEventTypes()
const slots = await publicApi.getAvailableSlots(eventTypeId, dateFrom, dateTo)

// Admin API
const bookings = await adminApi.listBookings({ dateFrom, dateTo })
await adminApi.deleteBooking(id)
```

**Adding new API types**:
1. Generate types from updated OpenAPI: `npm run generate:types`
2. If needed, add type alias in `src/api/types.ts` for cleaner naming
3. Add new API method in `src/api/public.ts` or `src/api/admin.ts`

**Files**:
- `src/api/client.ts` - HTTP client factory with error handling
- `src/api/types.ts` - Type aliases from generated OpenAPI types
- `src/api/public.ts` - Public API methods
- `src/api/admin.ts` - Admin API methods
- `src/types/generated/api-types.ts` - Auto-generated from OpenAPI (DO NOT EDIT)

### apps/api

- **Framework**: NestJS with Prisma ORM
- **Commands**:
  - `npm run dev` - NestJS watch mode on port 3001
  - `npm run db:generate` - Prisma client generation
  - `npm run db:migrate` - Run migrations
  - `npm run db:push` - Push schema changes
  - `npm run db:studio` - Prisma Studio GUI
  - `npm run db:seed` - Run seed script

## Constraints & Gotchas

1. **No linting configured** — lint task exists but packages don't implement it
2. **Prism runs in proxy mode** — frontend → Vite proxy (3000) → Prism (4010) → NestJS backend (3001). Prism validates requests/responses against OpenAPI spec and simulates errors.
3. **TypeScript strictness**:
   - `apps/api`: `strict: true`, target ES2021
   - `apps/web`: `strict: true`, `noUnusedLocals: true`, target ES2020
4. **npm@10.0.0** — pinned package manager version
5. **Theme files** — PrimeVue themes copied on `npm install` via `postinstall` hook; if themes missing, run `npm run copy-themes`
6. **Docker required** — All development happens inside Docker containers via `docker compose` profiles

## CI / Testing

- **Hexlet workflow**: `.github/workflows/hexlet-check.yml` — auto-generated, runs on every push
- **Do not modify** hexlet-check.yml (marked as auto-generated)
- Tests run externally by Hexlet platform

## E2E Testing (Playwright)

**Location**: `apps/e2e/`

### Quick Commands

```bash
# Run tests (starts E2E services automatically)
npm run e2e

# Interactive UI mode
npm run e2e:ui

# Stop E2E services
npm run e2e:down
```

### Architecture

E2E tests use Docker compose profile `e2e` which starts:
- API server (`api-e2e`) on port 3001 with production build
- Nginx (`web-e2e`) on port 3000 serving built frontend
- Test database (isolated SQLite)

**Test execution flow:**
```
Playwright → Chromium → http://localhost:3000 → Nginx → /api → NestJS (:3001)
```

Note: E2E tests proxy directly to backend (no Prism) to match production behavior. Prism is only used in development for OpenAPI validation.

**Files:**
- `apps/e2e/tests/` - Test specs
  - `smoke.spec.ts` - Infrastructure and connectivity tests
  - `booking.spec.ts` - User booking flow tests
  - `admin.spec.ts` - Admin dashboard tests
- `apps/e2e/fixtures/` - Test helpers
  - `db.ts` - Database reset/seed helpers
  - `test-data.ts` - Test data generators
- `apps/e2e/playwright.config.ts` - Playwright configuration

### Fast Debug Mode

For debugging without full Docker rebuild:

```bash
# 1. Build locally first
npm run build -w api
npm run build -w web

# 2. Start with override (mounts local builds)
npm run e2e:local

# Or with UI mode
npm run e2e:local:ui

# Cleanup
npm run e2e:local:down
```

### Writing Tests

**Basic smoke test example:**
```typescript
import { test, expect } from '@playwright/test'
import { setupTestDatabase } from '../fixtures/db.js'

test.describe('My Feature', () => {
  // Reset DB once per test file
  test.beforeAll(async () => {
    await setupTestDatabase()
  })

  test('user can view booking page', async ({ page }) => {
    await page.goto('/booking')
    await expect(page.locator('body')).toBeVisible()
  })
})
```

**Test patterns:**
- Use `test.beforeAll` for per-file data seeding (faster than per-test)
- Use unique identifiers (timestamps/random) to avoid data conflicts
- Single worker (`workers: 1`) for SQLite safety
- Screenshots and videos captured on failure
- API helpers in `fixtures/db.ts` for creating test data via HTTP

### Configuration

- **Browser**: Chromium only (for speed)
- **Workers**: 1 (SQLite concurrency safety)
- **Parallel**: Disabled (`fullyParallel: false`)
- **WebServer**: Managed externally via Docker Compose (see `playwright.config.ts`)

## When Adding Features

1. **API changes**: Edit `packages/api-spec/main.tsp` → TypeSpec watcher recompiles → openapi.yaml updates
2. **Frontend changes**: Edit `apps/web/src/**/*.vue` → hot reload via Vite (inside Docker container)
3. **Backend changes**: Edit `apps/api/src/` → NestJS dev server auto-restarts (inside Docker container)

All development happens inside Docker containers. Code is mounted from host, so changes are immediately reflected.

## Date/Time Handling (UTC-Only Policy)

**IMPORTANT: Shared UTC logic lives in `packages/date-utils`. Backend only works with UTC dates. Frontend handles local↔UTC conversion and local display.**

### Shared UTC Core (`packages/date-utils`)

**File**: `packages/date-utils/src/index.ts`

```typescript
// Shared UTC/timezone helpers used by both backend and frontend:
utcNow();
fromISO(string);
toISO(date);
startOfUTCDay(date);
endOfUTCDay(date);
startOfUTCWeek(date);
addUTCDays(date, n);
addUTCMonths(date, n);
formatUTCDate(date);
formatUTCTime(date);
isUTCBefore(a, b);
isUTCAfter(a, b);
isSameUTCDay(a, b);
convertLocalTimeToUTC(date, time, timezone);
getDayOfWeekInTimezone(date, timezone);
```

**Rules:**

1. Put reusable UTC-only and timezone-aware date logic in `packages/date-utils`
2. Use `dayjs`-based helpers from the shared package instead of reimplementing UTC math in `api` or `web`
3. Keep browser-local formatting and UI-specific conversions out of the shared package

### Backend (apps/api)

**File**: `src/common/utils/date.utils.ts`

```typescript
// Backend date utils file re-exports shared UTC helpers:
export { utcNow, fromISO, startOfUTCDay, ... } from '@calendar/date-utils';
```

**Rules:**

1. Backend services should import shared UTC helpers from `@calendar/date-utils` or from the local re-export file when appropriate
2. Never implement local-time business logic in backend date calculations unless timezone handling is explicit
3. All persisted and API-level datetimes remain UTC and are returned via `.toISOString()`
4. Use timezone-aware helpers like `convertLocalTimeToUTC()` and `getDayOfWeekInTimezone()` for owner timezone logic

### Frontend (apps/web)

**File**: `src/utils/date.utils.ts`

```typescript
// Keep frontend-specific helpers here.

// For API calls (convert local→UTC):
toUTCDateString(date); // YYYY-MM-DDT00:00:00.000Z
toUTCEndOfDayString(date); // YYYY-MM-DDT23:59:59.999Z

// For display (uses browser timezone):
formatLocalDate(date); // "пт, 9 апр"
formatLocalTime(isoString); // "14:30"
formatTimeRange(start, end); // "14:30 - 15:30"

// For parsing/current UTC time (re-exported from shared package):
fromISO(isoString); // Parse API date
utcNow(); // Current UTC time
```

**Rules:**

1. Calendar shows local dates (PrimeVue Calendar uses browser TZ)
2. API calls convert to UTC using `toUTCDateString()`
3. Display functions use `toLocaleString()` for local formatting
4. Reuse shared UTC helpers from `@calendar/date-utils` instead of duplicating parsing/comparison logic in frontend
5. Never send bare `Date` objects to API — always convert to ISO string

### Flow

```
User selects date in Calendar (local timezone)
        ↓
toUTCDateString() converts to UTC
        ↓
API call with UTC ISO string
        ↓
Backend processes in UTC via shared helpers, returns ISO strings
        ↓
formatLocalTime() converts to local for display
```

## Style Notes

- Comments: Write only in English
- CSS: Avoid `!important`, use CSS variables instead

## Docker Deployment

Monolithic container for MVP (Nginx + Node.js + SQLite). See `DOCKER.md` for full details.

### Quick Commands

```bash
# Development (Docker Compose with profiles)
npm run dev          # Start dev environment
npm run dev:down     # Stop dev environment

# E2E Testing
npm run e2e          # Start E2E services and run tests
npm run e2e:down     # Stop E2E services

# Production / Hugging Face
npm run start        # Start production container
npm run start:down   # Stop production container

# Cleanup
npm run docker:clean # Stop all containers and remove volumes (clears DB!)
```

### Architecture

All environments use unified `docker-compose.yml` with profiles:

**Development Profile (`--profile dev`):**
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

**E2E Profile (`--profile e2e`):**
```
┌─────────────┐      ┌─────────────┐
│  web-e2e    │─────▶│   api-e2e   │
│  (nginx)    │      │   (:3001)   │
│  (:3000)    │      │   SQLite    │
└─────────────┘      └─────────────┘
```

**Production Profile (`--profile prod`):**
```
┌─────────────────────────────────────────────┐
│              Nginx (Port 7860)              │
│  ┌──────────────┐      ┌──────────────────┐ │
│  │ Static files │      │ Proxy /api/*     │ │
│  │ (Vue build)  │──────│ → Node.js:3001   │ │
│  └──────────────┘      └──────────────────┘ │
└─────────────────────────────────────────────┘
```

### Important Notes

- **Unified compose file**: `docker-compose.yml` with profiles for dev/e2e/prod
- **SQLite persistence**: Mount volume at `/data` (Hugging Face Spaces compatible)
- **Health check**: `GET /api/owner` on port 7860
- **Multi-stage build**: Optimized for production (see `Dockerfile`)

## Other Notes

- Write in Russian in the chat, but code and comments in English
