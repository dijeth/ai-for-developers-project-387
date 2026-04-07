# AGENTS.md

## Project Overview

Monorepo for a Calendar Booking system (Cal.com-inspired). Uses **TypeSpec** for API-first design with code generation.

**Architecture**: API specification → OpenAPI → Mock server → Frontend consuming mocks.

## Repository Structure

```
apps/
  api/           # NestJS backend (port 3001) - empty scaffold
  web/           # Vue 3 + PrimeVue frontend (port 3000)
packages/
  api-spec/      # TypeSpec API definition (source of truth)
  contracts/     # Generated OpenAPI 3.1.0 spec + Prism mock server
```

## Essential Commands

```bash
# Install dependencies (root only, workspaces handled automatically)
npm install

# Start all dev servers (turbo runs these in parallel)
npm run dev
# - API spec watch mode (recompiles .tsp → openapi.yaml)
# - Prism mock server starts on port 4010
# - Vite dev server on port 3000 (proxies /api → :4010)

# Build everything for production
npm run build

# Type-check all packages
npm run typecheck
```

## Build Pipeline (Turbo)

Order matters due to dependencies:

1. `tsp:compile` (packages/api-spec) → generates `packages/contracts/openapi.yaml`
2. `build` depends on `^tsp:compile` (upstream task completion)

**Never modify `packages/contracts/openapi.yaml` manually** — it's generated from TypeSpec.

## Package Details

### packages/api-spec
- **Entry**: `main.tsp`
- **Config**: `tspconfig.yaml` (outputs to `../contracts`)
- **Key commands**:
  - `npm run build` - one-time compile
  - `npm run watch` - watch mode (also `npm run dev`)

### packages/contracts
- **Generated**: `openapi.yaml` (OpenAPI 3.1.0)
- **Mock server**: Prism serves mock responses from the spec
- **Key commands**:
  - `npm run mock` - start Prism on port 4010
  - `npm run dev` - alias for mock

### apps/web
- **Entry**: `src/main.ts`
- **Framework**: Vue 3 (Composition API, `<script setup>`)
- **UI**: PrimeVue with Lara Light Blue theme
- **Config**: `vite.config.ts` proxies `/api` → `http://localhost:4010`
- **Key commands**:
  - `npm run dev` - Vite dev server with HMR
  - `npm run build` - `vue-tsc && vite build`

### apps/api
- **Entry**: `src/main.ts`
- **Framework**: NestJS (empty scaffold, not connected to frontend)
- **Note**: Currently runs independently on port 3001. Frontend talks to Prism mock (4010), not this.

## Development Workflow

```bash
# Terminal 1: Start all dev infrastructure
npm run dev

# Terminal 2: Work on API spec
vim packages/api-spec/main.tsp
# Changes auto-recompile openapi.yaml, Prism auto-reloads

# Terminal 3: Work on frontend
vim apps/web/src/App.vue
# Hot reload via Vite
```

## API Design Notes

- **TypeSpec is the source of truth** — all models, routes, validation defined in `main.tsp`
- Uses `@typespec/http`, `@typespec/rest`, `@typespec/openapi3`
- Key patterns: `@route`, `@tag`, `@error`, `@pattern`, `@minLength`, etc.
- Current API surface: Admin endpoints (`/api/admin/*`) + Public endpoints (`/api/*`)
- Error codes defined in `ErrorResponse` model: NOT_FOUND, VALIDATION_ERROR, CONFLICT, SLOT_UNAVAILABLE, etc.

## Constraints & Gotchas

1. **No linting configured** — no ESLint, Prettier, or similar tools found
2. **API is mock-only** — real NestJS backend exists but frontend doesn't use it
3. **TypeScript strictness varies**:
   - `apps/api`: `strictNullChecks: false`, `noImplicitAny: false`
   - `apps/web`: `strict: true`, `noUnusedLocals: true`
4. **npm@10.0.0** — pinned package manager version
5. **Node targets**: ES2021 (API), ES2020 (Web)

## CI / Testing

- **Hexlet workflow**: `.github/workflows/hexlet-check.yml` — runs on every push
- **Do not modify** the hexlet-check.yml file (marked as auto-generated)
- Tests appear to be external (run by Hexlet platform)

## When Adding Features

1. **API changes**: Edit `packages/api-spec/main.tsp` → recompiles automatically → mocks update
2. **Frontend changes**: Edit `apps/web/src/**/*.vue` → hot reload
3. **Backend implementation**: Edit `apps/api/src/` → runs on :3001 (not yet integrated)
