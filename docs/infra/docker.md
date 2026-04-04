---
title: Docker
description: Docker setup for the tss-elysia application
---

## Docker

This document covers Docker setup for the tss-elysia application.

## What's New (v2.0)

The Docker setup has been optimized for:

- **Smaller image size** - Multi-stage builds reduce final image
- **Faster builds** - Better layer caching with .dockerignore
- **Better security** - Runs as non-root user (UID 1000)
- **Resource limits** - Memory constraints in production
- **Health checks** - Improved container health monitoring

## Prerequisites

- [Docker](https://docs.docker.com/get-docker/) installed
- [Docker Compose](https://docs.docker.com/compose/install/) installed
- Enable [BuildKit](https://docs.docker.com/build/buildkit/) for faster builds:

```bash
export DOCKER_BUILDKIT=1
```

## Quick Start

### Production

```bash
# Build and run
docker-compose -f docker/docker-compose.yml up app --build

# Or use docker directly
docker build -f docker/Dockerfile -t tss-elysia .
docker run -p 3000:3000 -e AUTH_SECRET=your-secret-key-min-32chars tss-elysia
```

### Development

```bash
# Start development server with hot reload
docker-compose -f docker/docker-compose.yml up dev --build

# Start in background
docker-compose -f docker/docker-compose.yml up -d dev

# View logs
docker-compose -f docker/docker-compose.yml logs -f dev
```

## Dockerfile Architecture

### Production (Dockerfile)

Multi-stage build for minimal image size:

```bash
┌─────────────────┐
│   oven/bun      │  Stage 1: Dependencies
│  (deps layer)   │  Install all packages
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   oven/bun      │  Stage 2: Builder
│  (builder)      │  Build application
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   oven/bun      │  Stage 3: Production
│  (production)   │  Minimal runtime + non-root user
└─────────────────┘
```

**Optimizations:**

- Multi-stage build (smaller final image)
- Non-root user (security)
- Layer caching (faster rebuilds)
- Health checks (reliability)

### Development (Dockerfile.dev)

Single-stage for quick iteration:

**Optimizations:**

- Non-root user (matches production)
- Volume mounts for hot reload
- Node modules cached

## Docker Compose Services

### app (Production)

```yaml
app:
  build:
    context: ..
    dockerfile: docker/Dockerfile
  ports:
    - "3000:3000"
  environment:
    - HOST=0.0.0.0
    - PORT=3000
    - NODE_ENV=production
    - AUTH_SECRET=${AUTH_SECRET}
    - DATABASE_PATH=.artifacts
    - DATABASE_NAME=tss-elysia.db
  volumes:
    - app-data:/app/.artifacts
  deploy:
    resources:
      limits:
        memory: 512M
      reservations:
        memory: 256M
  restart: unless-stopped
  healthcheck:
    test: ["CMD", "wget", "-q", "--spider", "http://localhost:3000/api/health"]
    interval: 30s
    timeout: 10s
    retries: 3
```

### dev (Development)

```yaml
dev:
  build:
    context: ..
    dockerfile: docker/Dockerfile.dev
  ports:
    - "3000:3000"
  environment:
    - HOST=0.0.0.0
    - PORT=3000
    - NODE_ENV=development
    - AUTH_SECRET=${AUTH_SECRET:-dev-secret-min-32-chars-here}
  volumes:
    - ..:/app
    - bun-cache:/root/.bun
    - node-modules:/app/node_modules
  restart: on-failure
```

## Environment Variables

| Variable        | Default                     | Description        |
| --------------- | --------------------------- | ------------------ |
| `HOST`          | `0.0.0.0`                   | Server host        |
| `PORT`          | `3000`                      | Server port        |
| `NODE_ENV`      | `production`                | Environment mode   |
| `AUTH_SECRET`   | **Required** (min 32 chars) | Session secret     |
| `DATABASE_PATH` | `.artifacts`                | Database directory |
| `DATABASE_NAME` | `tss-elysia.db`             | Database filename  |

## Usage Examples

### Production with Docker Compose

```bash
# Create .env file
cat > .env << EOF
AUTH_SECRET=your-production-secret-min-32-chars
EOF

# Build and start
docker-compose -f docker/docker-compose.yml up app --build -d

# View logs
docker-compose -f docker/docker-compose.yml logs -f app

# Stop
docker-compose -f docker/docker-compose.yml down
```

### Development with Docker Compose

```bash
# Start with hot reload
docker-compose -f docker/docker-compose.yml up dev --build

# Run in background
docker-compose -f docker/docker-compose.yml up -d dev

# View logs
docker-compose -f docker/docker-compose.yml logs -f dev

# Stop
docker-compose -f docker/docker-compose.yml down

# Full reset (remove volumes too)
docker-compose -f docker/docker-compose.yml down -v
```

### Direct Docker Run

```bash
# Build
docker build -f docker/Dockerfile -t tss-elysia .

# Run
docker run -d \
  --name tss-elysia \
  -p 3000:3000 \
  -e AUTH_SECRET=my-super-secret-key-32chars \
  -v tss-elysia-data:/app/.artifacts \
  tss-elysia
```

### Database Operations in Container

```bash
# Run migrations
docker-compose -f docker/docker-compose.yml exec app bun run db:migrate

# Seed database
docker-compose -f docker/docker-compose.yml exec app bun run db:seed

# Open database studio
docker-compose -f docker/docker-compose.yml exec app bun run db:studio
```

## Health Checks

Production containers include health checks:

```bash
# Check health status
docker inspect --format='{{.State.Health.Status}}' tss-elysia-prod

# Manual health check
docker exec tss-elysia-prod wget -q --spider http://localhost:3000/api/health
```

## Performance Optimization

### BuildKit (Required for best results)

```bash
# Enable BuildKit globally
export DOCKER_BUILDKIT=1

# Or per-build
docker build --build-arg BUILDKIT_INLINE_CACHE=1 -f docker/Dockerfile .
```

### Build Cache

The optimized Dockerfile uses layer caching:

1. Dependencies (package.json, bun.lock) - cached unless changed
2. Source code - cached unless changed
3. Build step - only runs when source changes

### Memory Limits

Production containers have memory limits:

- Limit: 512MB
- Reservation: 256MB

Adjust in docker-compose.yml:

```yaml
deploy:
  resources:
    limits:
      memory: 1G
    reservations:
      memory: 512M
```

## Troubleshooting

### Container Won't Start

1. Check AUTH_SECRET is set:

   ```bash
   docker logs tss-elysia-prod
   ```

2. Verify port is available:

   ```bash
   lsof -i :3000
   ```

3. Check health status:

   ```bash
   docker inspect --format='{{.State.Health.Status}}' tss-elysia-prod
   ```

### Database Issues

1. Check volume is mounted:

   ```bash
   docker volume ls | grep tss-elysia
   docker inspect tss-elysia-prod | grep -A 10 Mounts
   ```

2. Check permissions:

   ```bash
   docker exec tss-elysia-prod ls -la .artifacts/
   ```

### Build Issues

1. Clear BuildKit cache:

   ```bash
   docker builder prune
   ```

2. Rebuild without cache:

   ```bash
   docker build --no-cache -f docker/Dockerfile .
   ```

### Performance Issues

1. Enable BuildKit:

   ```bash
   export DOCKER_BUILDKIT=1
   ```

2. Check memory usage:

   ```bash
   docker stats tss-elysia-prod
   ```

3. Increase memory limit in docker-compose.yml

## Security Features

1. **Non-root user** - Runs as `appuser` (UID 1000)
2. **Minimal image** - Multi-stage build reduces attack surface
3. **Resource limits** - Prevents DoS from runaway processes
4. **Health checks** - Automatic container health monitoring

## Advanced: Custom Production Setup

### With nginx Reverse Proxy

```yaml
# docker-compose.production.yml
services:
  app:
    build:
      context: ..
      dockerfile: docker/Dockerfile
    restart: unless-stopped

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
    depends_on:
      - app
```

### With PostgreSQL (Production)

```yaml
# docker-compose.production.yml
services:
  app:
    build:
      context: ..
      dockerfile: docker/Dockerfile
    environment:
      - DATABASE_URL=postgresql://user:pass@db:5432/tss
    depends_on:
      - db

  db:
    image: postgres:16-alpine
    environment:
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=pass
      - POSTGRES_DB=tss
    volumes:
      - pg-data:/var/lib/postgresql/data
```

## Image Size Comparison

| Version  | Image Size | Notes                  |
| -------- | ---------- | ---------------------- |
| v1 (old) | ~300MB+    | Single stage           |
| v2 (new) | ~180MB     | Multi-stage, optimized |

Run `docker images tss-elysia` to check your image size.