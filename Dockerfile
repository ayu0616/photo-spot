FROM oven/bun:slim AS base

# Stage 1: Install dependencies and build the Next.js application
# Stage 1: Install dependencies and build the Next.js application
FROM base AS builder

# Define build arguments
ARG DATABASE_URL
ARG AUTH_SECRET
ARG AUTH_GOOGLE_ID
ARG AUTH_GOOGLE_SECRET
ARG AUTH_URL
ARG GCS_URL
ARG GCP_PROJECT_ID
ARG GCS_BUCKET_NAME
ARG NEXT_PUBLIC_API_BASE_URL

# Set runtime environment variables
ENV DATABASE_URL=$DATABASE_URL
ENV AUTH_SECRET=$AUTH_SECRET
ENV AUTH_GOOGLE_ID=$AUTH_GOOGLE_ID
ENV AUTH_GOOGLE_SECRET=$AUTH_GOOGLE_SECRET
ENV AUTH_URL=$AUTH_URL
ENV GCS_URL=$GCS_URL
ENV GCP_PROJECT_ID=$GCP_PROJECT_ID
ENV GCS_BUCKET_NAME=$GCS_BUCKET_NAME
ENV NEXT_PUBLIC_API_BASE_URL=$NEXT_PUBLIC_API_BASE_URL

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
