# Multi-stage Dockerfile for Minimal RAG Engine
# Stage 1: Build Frontend React
FROM node:22-alpine AS client-builder
WORKDIR /app/client
COPY client/package*.json ./
RUN npm install
COPY client/ ./
RUN npm run build

# Stage 2: Build Backend Node.js
FROM node:22-alpine AS server-builder
WORKDIR /app/server
COPY server/package*.json ./
RUN npm install --legacy-peer-deps
COPY server/ ./
RUN npm run build || true

# Stage 3: Production Runner
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=5000

# Copy server dependencies and source
COPY --from=server-builder /app/server /app/server

# Copy client dist into server public or static
COPY --from=client-builder /app/client/dist /app/server/public

WORKDIR /app/server

EXPOSE 5000

CMD ["npx", "tsx", "src/main.ts"]
