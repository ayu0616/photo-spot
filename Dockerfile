FROM oven/bun:slim AS base

# Stage 1: Install dependencies and build the Next.js application
FROM base AS builder

WORKDIR /app

# Install dependencies
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

# Copy source code and build
COPY . .
RUN bun run build

# Stage 2: Create the production-ready image
FROM base AS runner

WORKDIR /app

# Set environment variables for Next.js production
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Copy standalone output
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Copy public folder (if needed at runtime)
COPY --from=builder /app/public ./public

# Expose the port Next.js listens on
EXPOSE 3000

# Start the Next.js application using the standalone server
CMD ["bun", "run", "server.js"]
