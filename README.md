---
title: Calendar Booking MVP
emoji: 📅
colorFrom: blue
colorTo: indigo
sdk: docker
app_port: 7860
pinned: false
license: mit
---

# Calendar Booking MVP

### Hexlet tests and linter status:

[![Actions Status](https://github.com/dijeth/ai-for-developers-project-386/actions/workflows/hexlet-check.yml/badge.svg)](https://github.com/dijeth/ai-for-developers-project-386/actions)

A calendar booking application built with NestJS, Vue 3, and TypeSpec.

**Live Demo**: https://dijeth-ai-for-dev.hf.space/

## Features

- Book appointments with calendar owners
- Owner dashboard to manage availability
- TypeSpec-first API design with OpenAPI
- E2E testing with Playwright

## Architecture

```
TypeSpec → OpenAPI → Prism proxy → NestJS backend → Vue frontend
```

Monorepo structure:
- `apps/api` — NestJS backend (port 3001)
- `apps/web` — Vue 3 frontend (port 3000)
- `apps/e2e` — Playwright tests
- `packages/api-contracts` — TypeSpec + OpenAPI + Prism proxy (port 4010)
- `packages/date-utils` — Shared UTC helpers

## Quick Start

```bash
# Install dependencies
npm install

# Start all dev services (Docker Compose)
npm run dev

# Run E2E tests
npm run e2e

# Type check all packages
npm run typecheck
```

## Production

```bash
# Build and run locally
docker build -t calendar-booking .
docker run -p 7860:7860 -v $(pwd)/data:/data calendar-booking

# Or use npm
npm run start
```

SQLite database is stored in `/data` for persistence.

## Details

See [AGENTS.md](./AGENTS.md) for full project documentation.
