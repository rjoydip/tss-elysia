# Docker

This document covers Docker setup for the tss-elysia application.

## Prerequisites

- [Docker](https://docs.docker.com/get-docker/) installed
- [Docker Compose](https://docs.docker.com/compose/install/) installed
- Bun (for local development)

## Quick Start

### Production

```bash
# Build the image
docker build -t tss-elysia .

# Run the container
docker run -p 3000:3000 \
  -e AUTH_SECRET=your-secret-key \
  -e DATABASE_NAME=data/.db \
  tss-elysia
```

### Development

```bash
# Start development server
docker-compose up dev

# Start in background
docker-compose up -d dev
```

## Dockerfile Variants

### Production (Dockerfile)

- Uses `oven/bun:1.3.11-debian` base image
- Runs `bun run build` for production build
- Starts with `bun run start`
- Health checks enabled

### Development (Dockerfile.dev)

- Uses `oven/bun:1.3.11-debian` base image
- Mounts source code for hot reload
- Runs `bun run dev`
- Volume caching for Bun

## Docker Compose Services

### app (Production)

```yaml
app:
  build: .
  ports:
    - "3000:3000"
  environment:
    - HOST=0.0.0.0
    - PORT=3000
    - NODE_ENV=production
    - AUTH_SECRET=${AUTH_SECRET}
    - DATABASE_NAME=data/.db
  volumes:
    - db-data:/app/data
  restart: unless-stopped
  healthcheck:
    test: ["CMD", "wget", "-q", "--spider", "http://localhost:3000/api/health"]
```

### dev (Development)

```yaml
dev:
  build:
    context: .
    dockerfile: Dockerfile.dev
  ports:
    - "3000:3000"
  environment:
    - HOST=0.0.0.0
    - PORT=3000
    - NODE_ENV=development
    - AUTH_SECRET=${AUTH_SECRET:-dev-secret-min-32-characters-long}
    - DATABASE_NAME=data/.db
  volumes:
    - .:/app
    - bun-cache:/root/.bun
  command: bun run dev
  restart: on-failure
```

## Environment Variables

Configure via `.env` file or environment:

| Variable        | Default      | Description      |
| --------------- | ------------ | ---------------- |
| `HOST`          | `0.0.0.0`    | Server host      |
| `PORT`          | `3000`       | Server port      |
| `NODE_ENV`      | `production` | Environment mode |
| `AUTH_SECRET`   | Required     | Session secret   |
| `DATABASE_NAME` | `data/.db`   | Database path    |

## Usage Examples

### Basic Production Run

```bash
docker run -d \
  --name tss-elysia \
  -p 3000:3000 \
  -e AUTH_SECRET=my-super-secret-key-32chars \
  tss-elysia
```

### With Custom Database

```bash
docker run -d \
  --name tss-elysia \
  -p 3000:3000 \
  -e AUTH_SECRET=my-super-secret-key-32chars \
  -e DATABASE_NAME=/data/custom.db \
  -v custom-data:/data \
  tss-elysia
```

### Development with Docker Compose

```bash
# Create .env file
cat > .env << EOF
AUTH_SECRET=dev-secret-min-32-characters-long
EOF

# Start development
docker-compose up dev

# View logs
docker-compose logs -f dev

# Stop
docker-compose down
```

### Run Migrations in Container

```bash
# Run migrations
docker-compose exec dev bun run db:migrate

# Seed database
docker-compose exec dev bun run db:seed
```

### Production with Docker Compose

```bash
# Create production .env
cat > .env << EOF
AUTH_SECRET=your-production-secret-key-min-32-chars
EOF

# Build and start
docker-compose build app
docker-compose up -d app

# View logs
docker-compose logs -f app

# Stop
docker-compose down
```

## Health Checks

The production container includes health checks:

```bash
# Check health status
docker inspect --format='{{.State.Health.Status}}' tss-elysia-app-1

# Check health from inside container
docker exec tss-elysia-app-1 wget -q --spider http://localhost:3000/api/health
```

## Troubleshooting

### Container Won't Start

1. Check AUTH_SECRET is set:

   ```bash
   docker logs tss-elysia
   ```

2. Verify port is available:
   ```bash
   lsof -i :3000
   ```

### Database Issues

1. Ensure volume is mounted:

   ```bash
   docker volume ls | grep tss-elysia_db-data
   ```

2. Check permissions:
   ```bash
   docker exec tss-elysia ls -la data/
   ```

### Performance Issues

1. Increase memory for Bun:

   ```yaml
   environment:
     - BUN_CONFIG_MEMORY_LIMIT=2048
   ```

2. Enable BuildKit for faster builds:
   ```bash
   DOCKER_BUILDKIT=1 docker build .
   ```

## Security Considerations

1. **Never commit secrets** - Use environment variables
2. **Use strong AUTH_SECRET** - Minimum 32 characters
3. **Run as non-root** - User is bun (UID 1000)
4. **Use TLS in production** - Add reverse proxy (nginx, traefik)
5. **Regular updates** - Keep base image updated

## Production Deployment

For production, consider:

- Using a reverse proxy (nginx, traefik)
- Adding TLS/HTTPS
- Setting up log aggregation
- Configuring resource limits
- Using secrets management
- Implementing backup strategy

Example with nginx proxy:

```yaml
# docker-compose.production.yml
version: "3.8"

services:
  app:
    build: .
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
