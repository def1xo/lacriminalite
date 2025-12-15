# Build stage (optional for TypeScript build)
FROM node:18-alpine AS builder
WORKDIR /app
COPY apps/bot/package.json apps/bot/pnpm-lock.yaml* ./ 
# if monorepo uses workspace build, adjust accordingly
RUN npm i -g pnpm
RUN pnpm install --frozen-lockfile
COPY . .
# build TypeScript to dist (assumes package.json script "build": "tsc -p tsconfig.json")
WORKDIR /app/apps/bot
RUN pnpm build

# Production image
FROM node:18-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/apps/bot/dist ./dist
COPY apps/bot/package.json ./package.json
RUN npm i -g pnpm
RUN pnpm install --prod
# Expose port (webhook mode)
EXPOSE 3002
CMD ["node", "dist/index.js"]
