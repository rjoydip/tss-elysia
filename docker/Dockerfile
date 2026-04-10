# =============================================================================
# Production Dockerfile - Optimized for small size and fast builds
# =============================================================================
# Stage 1: Dependencies - Install only what's needed for production
# =============================================================================
FROM oven/bun:1.3-debian AS deps

WORKDIR /app

# Copy package files first (for better layer caching)
COPY package.json bun.lock* ./

# Install production dependencies only
# --production=false includes devDependencies needed for build
RUN bun install --frozen-lockfile --production=false --ignore-scripts

# =============================================================================
# Stage 2: Builder - Build the application
# =============================================================================
FROM deps AS builder

WORKDIR /app

# Copy node_modules from deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY package.json bun.lock* ./

# Copy source code
COPY . .

# Generate Drizzle schema (in case not generated)
RUN bun run db:generate 2>/dev/null || true

# Build the application
RUN bun run build

# =============================================================================
# Stage 3: Production - Minimal runtime image
# =============================================================================
FROM oven/bun:1.3-debian AS production

# Create non-root user for security (using groupadd/useradd if adduser not available)
RUN groupadd --system --gid 1000 appgroup 2>/dev/null || \
    (apt-get update && apt-get install -y --no-install-recommends shadow && groupadd --system --gid 1000 appgroup) && \
    useradd --system --uid 1000 --gid 1000 appuser 2>/dev/null || true

WORKDIR /app

# Copy built artifacts from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/.output ./.output
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./
COPY --from=builder /app/node_modules ./node_modules

# Copy database if exists (optional)
COPY --from=builder /app/.artifacts/ ./.artifacts/

# Create data directory with proper permissions
RUN mkdir -p .artifacts && chown -R appuser:appgroup .artifacts

# Switch to non-root user
USER appuser

# Environment variables
ENV HOST=0.0.0.0
ENV PORT=3000
ENV NODE_ENV=production

# Expose port
EXPOSE 3000

# Health check - lightweight curl alternative
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD bun run -e "await fetch('http://localhost:3000/api/health').then(r => { if (!r.ok) process.exit(1) })" 2>/dev/null || \
    wget -q --spider http://localhost:3000/api/health

# Start the application
CMD ["bun", "run", "start"]
