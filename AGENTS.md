# AGENTS.md

## Project Overview

Calendar booking monorepo using **TypeSpec** for API-first design. Architecture: TypeSpec → OpenAPI → Prism (proxy/validation layer) → NestJS backend → Vue frontend.

## Repository Structure

```
apps/
  api/           # NestJS + Prisma backend (port 3001) - scaffold only, not used by frontend
  web/           # Vue 3 + PrimeVue frontend (port 3000) → proxies /api to :4010
packages/
  api-spec/      # TypeSpec source files (main.tsp)
  contracts/     # Generated openapi.yaml + Prism proxy on port 4010 (forwards to :3001)
```

## Essential Commands

```bash
# Install (workspaces handled automatically)
npm install

# Start all dev servers (turbo parallel)
npm run dev
# - api-spec watch mode: recompiles .tsp → openapi.yaml
# - Prism proxy on port 4010 (forwards to NestJS on :3001)
# - Vite dev server on port 3000

# Build for production (tsp:compile → build pipeline)
npm run build

# Type-check all packages
npm run typecheck
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
- **Proxy**: `/api` → `http://localhost:4010` (vite.config.ts)
- **Commands**:
  - `npm run dev` - Vite dev server with HMR on port 3000
  - `npm run build` - `vue-tsc && vite build`
  - `npm run copy-themes` - copies PrimeVue themes to public/

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

1. **No linting configured** — turbo has `lint` task but packages don't implement it
2. **Prism runs in proxy mode** — frontend → Vite proxy (3000) → Prism (4010) → NestJS backend (3001). Prism validates requests/responses against OpenAPI spec and simulates errors.
3. **TypeScript strictness**:
   - `apps/api`: `strict: true`, target ES2021
   - `apps/web`: `strict: true`, `noUnusedLocals: true`, target ES2020
4. **npm@10.0.0** — pinned package manager version
5. **Theme files** — PrimeVue themes copied on `npm install` via `postinstall` hook; if themes missing, run `npm run copy-themes`

## CI / Testing

- **Hexlet workflow**: `.github/workflows/hexlet-check.yml` — auto-generated, runs on every push
- **Do not modify** hexlet-check.yml (marked as auto-generated)
- Tests run externally by Hexlet platform

## When Adding Features

1. **API changes**: Edit `packages/api-spec/main.tsp` → auto-recompiles → mocks update
2. **Frontend changes**: Edit `apps/web/src/**/*.vue` → hot reload via Vite
3. **Backend changes**: Edit `apps/api/src/` → NestJS on port 3001 (frontend accesses via Prism proxy on :4010)

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

## Other Notes

- Write in Russian in the chat, but code and comments in English
