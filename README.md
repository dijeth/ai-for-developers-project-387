---
title: Calendar Booking MVP
emoji: 📅
colorFrom: blue
colorTo: indigo
sdk: docker
app_port: 7860
---

# Calendar Booking MVP

### Hexlet tests and linter status:
[![Actions Status](https://github.com/dijeth/ai-for-developers-project-386/actions/workflows/hexlet-check.yml/badge.svg)](https://github.com/dijeth/ai-for-developers-project-386/actions)

A calendar booking application built with NestJS, Vue 3, and TypeSpec.

## Features

- Book appointments with calendar owners
- Owner dashboard to manage availability
- Real-time booking validation
- Responsive UI with PrimeVue

## API Endpoints

- `GET /api/owner` - Health check & owner info
- `GET /api/booking-slots` - Get available slots
- `POST /api/bookings` - Create new booking
- `GET /api/admin/bookings` - List all bookings
- `GET /api/admin/event-types` - Get event types

## Persistent Storage

SQLite database is stored in `/data` for persistence across restarts.

## Local Development

```bash
# Install dependencies
npm install

# Start all dev servers
npm run dev
```

## Docker

```bash
# Build and run locally
docker build -t calendar-booking .
docker run -p 7860:7860 -v $(pwd)/data:/data calendar-booking
```
