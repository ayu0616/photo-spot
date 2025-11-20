# Stage 1: Install dependencies and build the Next.js application
FROM oven/bun:1.1.20 as base

WORKDIR /app

# Install dependencies
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

# Copy source code and build
COPY . .
RUN bun run build

# Stage 2: Create the production-ready image
FROM oven/bun:1.1.20 as runner

WORKDIR /app

# Set environment variables for Next.js production
ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

# Copy only necessary files from the build stage
COPY --from=base /app/.next ./.next
COPY --from=base /app/node_modules ./node_modules
COPY --from=base /app/public ./public
COPY --from=base /app/src ./src
COPY --from=base /app/package.json ./package.json
COPY --from=base /app/bun.lock ./bun.lock
COPY --from=base /app/next.config.ts ./next.config.ts
COPY --from=base /app/tsconfig.json ./tsconfig.json
COPY --from=base /app/postcss.config.mjs ./postcss.config.mjs
COPY --from=base /app/biome.json ./biome.json
COPY --from=base /app/components.json ./components.json
COPY --from=base /app/drizzle.config.ts ./drizzle.config.ts

# Expose the port Next.js listens on
EXPOSE 3000

# Start the Next.js application
CMD ["bun", "run", "start"]
