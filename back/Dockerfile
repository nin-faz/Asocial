# Stage 1: Build
FROM node:18 AS builder

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma
RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/* \
    && npm install \
    && npx prisma generate \
    && mkdir -p prisma/migrations
COPY . .
RUN npm run build

# Stage 2: Production
FROM node:18-slim AS production

WORKDIR /app

RUN apt-get update && apt-get install -y libssl3 && rm -rf /var/lib/apt/lists/*

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/prisma ./prisma

ENV NODE_ENV=production
ENV PORT=8080

EXPOSE 8080

CMD ["node", "dist/src/index.js"]
