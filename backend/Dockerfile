# =========================
# Build stage
# =========================

FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

# Generate Prisma Client
RUN DATABASE_URL="mysql://dummy:dummy@localhost:3306/dummy" npx prisma generate

# Build TypeScript
RUN npm run build


# =========================
# Production stage
# =========================

FROM node:20-alpine AS production

WORKDIR /app

ENV NODE_ENV=production

COPY package*.json ./

RUN npm ci --omit=dev --legacy-peer-deps

COPY --from=builder /app/dist ./dist

COPY --from=builder /app/prisma ./prisma

COPY --from=builder /app/prisma.config.ts ./prisma.config.ts

# Generate Prisma Client for the production node_modules
RUN DATABASE_URL="mysql://dummy:dummy@localhost:3306/dummy" npx prisma generate

EXPOSE 5000

CMD ["node", "dist/server.js"]