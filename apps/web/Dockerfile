# Stage 1 — build
FROM node:20-alpine AS builder
WORKDIR /workspace

# Install build tools
RUN apk add --no-cache python3 make g++ git

# Copy monorepo manifests (optimize layer caching)
COPY package.json pnpm-lock.yaml ./
COPY apps/web/package.json apps/web/package.json
COPY packages/database/package.json packages/database/package.json
COPY turbo.json ./

# Install pnpm and dependencies (workspace)
RUN npm i -g pnpm@8
RUN pnpm install --frozen-lockfile

# Copy source
COPY . .

# Build web app
WORKDIR /workspace/apps/web
RUN pnpm -w build --filter=apps/web...

# Stage 2 — runtime
FROM node:20-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production

# Create non-root user
RUN addgroup -S app && adduser -S app -G app
# Copy production build from builder
COPY --from=builder /workspace/apps/web/dist ./dist
COPY --from=builder /workspace/apps/web/package.json ./package.json
COPY --from=builder /workspace/node_modules ./node_modules
# Copy public assets
COPY --from=builder /workspace/apps/web/public ./public

# Expose port used by Next.js production server (if using next start)
EXPOSE 3000

USER app
ENV PORT=3000

# Default command — use your start script defined in apps/web/package.json ("start": "next start .")
CMD ["pnpm", "start"]
