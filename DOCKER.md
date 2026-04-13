# Docker Deployment Guide

## Quick Reference

```bash
# Local development
npm run docker:up          # Build and start
docker-compose down        # Stop
npm run docker:clean       # Stop and remove volumes

# Railway deployment
railway login              # Login to CLI
railway link               # Link project
railway up                 # Deploy

# Hugging Face Spaces deployment
# Auto-deploys on push to main via GitHub Actions
# Or manual deploy with HF CLI:
huggingface-cli login      # Login to Hugging Face
huggingface-cli repo create my-space --type space --sdk docker
```

## Local Development

### Prerequisites
- Docker & Docker Compose

### Commands

```bash
# Build and start all services
docker-compose up --build

# Or use npm script
npm run docker:up

# Access the app
open http://localhost:3000
```

### Useful Commands

```bash
# Stop containers
docker-compose down

# View logs
docker-compose logs -f app

# Rebuild after code changes
docker-compose up --build

# Clean up everything including database (WARNING: data loss!)
npm run docker:clean

# Shell into container
docker-compose exec app sh

# Check database
docker-compose exec app ls -la /app/api/data/
```

## Railway Deployment

### Option 1: GitHub Integration (Recommended)

1. Push code to GitHub repository
2. Go to [Railway dashboard](https://railway.app)
3. Click "New Project" → "Deploy from GitHub repo"
4. Select your repository
5. Railway auto-detects `Dockerfile` and `railway.toml`
6. Every push to `main` triggers auto-deployment

### Option 2: Railway CLI

```bash
# Install CLI
npm install -g @railway/cli

# Login (opens browser)
railway login

# Link to project
railway link

# Deploy current directory
railway up

# View logs
railway logs

# Open deployed app
railway open
```

### Configuration

Railway settings are in `railway.toml`:

```toml
[deploy]
healthcheckPath = "/api/owner"    # Health check endpoint
healthcheckPort = 80              # Nginx port
restartPolicyType = "on_failure"
```

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `NODE_ENV` | `production` | Runtime environment |
| `PORT` | `3001` | Internal API port (inside container) |
| `DATABASE_URL` | `file:./data/prod.db` | SQLite database path |

Override in Railway dashboard if needed.

### Persistent Storage (Important!)

SQLite database must persist across deploys:

1. Go to Railway Dashboard → Your Service → Settings
2. Add Volume:
   - Mount Path: `/app/api/data`
   - Size: 1GB (or as needed)
3. Redeploy

Without this volume, database resets on every deployment!

## Architecture

```
┌─────────────────────────────────────────────────────┐
│              Nginx (Port 80)                        │
│  ┌─────────────────┐    ┌──────────────────────────┐  │
│  │ Static Files    │    │ API Proxy                │  │
│  │ (Vue.js build)  │    │ /api/* → localhost:3001 │  │
│  │                 │    │                          │  │
│  │ • index.html    │    │ Health: /api/owner       │  │
│  │ • assets/       │    │                          │  │
│  │ • themes/       │    │                          │  │
│  └─────────────────┘    └──────────────────────────┘  │
└─────────────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────┐
│           NestJS API (Port 3001)                    │
│                                                      │
│  • Prisma ORM (SQLite)                              │
│  • TypeSpec-generated API contracts                 │
│  • Database: /app/api/data/prod.db                 │
│                                                      │
└─────────────────────────────────────────────────────┘
```

## Build Process (Multi-stage)

```
Stage 1: deps
  └── Install npm dependencies

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
├── nginx.conf          # Nginx configuration
└── start.sh            # Container startup script

Dockerfile              # Multi-stage build
.dockerignore           # Files excluded from build
docker-compose.yml      # Local development
railway.toml            # Railway deployment config
DOCKER.md               # This file
```

## Troubleshooting

### Container won't start

```bash
# Check logs
docker-compose logs -f app

# Test locally with shell
docker run -it --rm calendar-booking sh
```

### Database permission errors

```bash
# Check permissions inside container
docker-compose exec app ls -la /app/api/data/

# Should show: drwxrwxrwx (777)
```

### Health check failures (Railway)

Common causes:
1. Database not migrated → Check startup logs
2. Port misconfiguration → Verify `EXPOSE 80` in Dockerfile
3. Backend crash → Check `railway logs`

### Rebuild everything

```bash
# Nuclear option: remove all and rebuild
docker-compose down -v
docker system prune -a
docker-compose up --build
```

## Security Notes

- SQLite file has 777 permissions (required for container user)
- CORS enabled for all origins (`origin: true`)
- No authentication in MVP (as per requirements)
- Health endpoint is public (`GET /api/owner`)

## Hugging Face Spaces Deployment

### Setup (One-time)

1. **Create Hugging Face Account**: https://huggingface.co/join

2. **Create Space**:
   - Go to https://huggingface.co/spaces
   - Click "Create new Space"
   - Name: `calendar-booking` (or your choice)
   - SDK: **Docker**
   - Hardware: **Free** (or upgrade as needed)
   - Visibility: **Public** or **Private**

3. **Configure GitHub Secrets** (for auto-deploy):
   - Go to your GitHub repo → Settings → Secrets and variables → Actions
   - Add `HF_TOKEN`: Your Hugging Face access token (get from https://huggingface.co/settings/tokens)
   - Add `HF_SPACE_NAME`: Your space name (e.g., `username/calendar-booking`)

4. **Enable Persistent Storage** (important!):
   - Go to Space Settings → "Enable persistent storage"
   - This ensures SQLite database persists across restarts

### Deployment

**Option 1: GitHub Actions (Auto-deploy)** ⭐ Recommended
- Push to `main` branch → automatic deployment to Hugging Face Spaces
- Configured in `.github/workflows/huggingface-deploy.yml`

**Option 2: Manual CLI**
```bash
# Install Hugging Face CLI
pip install huggingface-hub

# Login
huggingface-cli login

# Add remote and push
git remote add hf https://huggingface.co/spaces/YOUR_USERNAME/YOUR_SPACE_NAME
git push hf main
```

### Architecture Differences (vs Railway)

| Feature | Railway | Hugging Face Spaces |
|---------|---------|---------------------|
| Default Port | 80 | 7860 |
| Persistent Storage | `/app/api/data` | `/data` (symlinked) |
| Health Check | `/api/owner` on :80 | Built-in on :7860 |
| Auto-deploy | Railway CLI / GitHub | GitHub Actions |
| Config File | `railway.toml` | `README.md` metadata |

### URLs

- **Railway**: `https://your-app.up.railway.app`
- **Hugging Face**: `https://huggingface.co/spaces/YOUR_USERNAME/YOUR_SPACE_NAME`

## CI/CD (GitHub Actions)

- **Hexlet Check**: `.github/workflows/hexlet-check.yml` (auto-generated, runs on every push)
- **Docker Build Test**: `.github/workflows/docker.yml` (tests Docker build on PRs)
- **Hugging Face Deploy**: `.github/workflows/huggingface-deploy.yml` (deploys to HF Spaces on push to main)
