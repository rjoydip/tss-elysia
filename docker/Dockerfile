# =============================================================================
# Production Dockerfile - Optimized for small size and fast builds
# =============================================================================
# Stage 1: Dependencies - Install only production dependencies
# =============================================================================
FROM oven/bun:alpine AS deps

WORKDIR /app

# Copy only lockfile and package files first for better layer caching
COPY package.json bun.lock* ./

# Install production dependencies only (no devDependencies)
RUN bun install --frozen-lockfile --omit=dev --ignore-scripts

# =============================================================================
# Stage 2: Builder - Build the application
# =============================================================================
FROM oven/bun:alpine AS builder

WORKDIR /app

# Copy node_modules from deps stage (production only)
COPY --from=deps /app/node_modules ./node_modules
COPY package.json bun.lock* ./

# Install all dependencies needed for building (vite, tailwind, typescript, etc.)
RUN bun install --frozen-lockfile --ignore-scripts

# Copy source code
COPY . .

# Generate Drizzle schema
RUN bun run db:generate 2>/dev/null || true

# Build the application
RUN bun run build

# =============================================================================
# Stage 3: Production - Minimal runtime image
# =============================================================================
FROM oven/bun:alpine AS production

WORKDIR /app

# Install wget for health check
RUN apk add --no-cache wget

# Install only runtime dependencies needed for the app
COPY package.json bun.lock* ./
RUN bun install --frozen-lockfile --omit=dev --ignore-scripts

# Copy built artifacts from builder
COPY --from=builder /app/dist ./dist

# Create non-root user with proper group
RUN groupadd -r -g 1000 appgroup && useradd -r -u 1000 -g appgroup -d /app -s /bin/false appuser || true

# Create data directory with proper permissions
RUN mkdir -p /app/artifacts /app/.artifacts && chown -R 1000:1000 /app

# Switch to non-root user
USER appuser

# Environment variables
ENV HOST=0.0.0.0
ENV PORT=3000
ENV NODE_ENV=production

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD wget -q --spider http://localhost:3000/api/health || exit 1

# Start the application
CMD ["bun", "run", "start"]
