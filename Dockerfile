# ──────────────────────────────────────────────
# Backend
# ──────────────────────────────────────────────
FROM node:20-alpine AS backend-deps
WORKDIR /app/backend
COPY backend/package.json backend/package-lock.json* ./
RUN npm ci --only=production && npm cache clean --force

FROM node:20-alpine AS backend-build
WORKDIR /app/backend
COPY backend/package.json backend/package-lock.json* ./
RUN npm ci
COPY backend/ .
RUN npm run build

FROM node:20-alpine AS backend
RUN addgroup -g 1001 -S nodejs && adduser -S nestjs -u 1001
WORKDIR /app
COPY --from=backend-deps --chown=nestjs:nodejs /app/backend/node_modules ./node_modules
COPY --from=backend-build --chown=nestjs:nodejs /app/backend/dist ./dist
COPY --chown=nestjs:nodejs backend/package.json .
RUN mkdir -p /app/uploads && chown nestjs:nodejs /app/uploads
USER nestjs
EXPOSE 4000
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD wget -qO- http://localhost:4000/api/v1/health || exit 1
CMD ["node", "dist/main"]

# ──────────────────────────────────────────────
# Frontend
# ──────────────────────────────────────────────
FROM node:20-alpine AS frontend-build
WORKDIR /app/frontend
COPY frontend/package.json frontend/package-lock.json* ./
RUN npm ci
COPY frontend/ .
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

FROM node:20-alpine AS frontend
RUN addgroup -g 1001 -S nodejs && adduser -S nextjs -u 1001
WORKDIR /app
COPY --from=frontend-build --chown=nextjs:nodejs /app/frontend/.next ./.next
COPY --from=frontend-build --chown=nextjs:nodejs /app/frontend/public ./public
COPY --from=frontend-build --chown=nextjs:nodejs /app/frontend/node_modules ./node_modules
COPY --chown=nextjs:nodejs frontend/package.json .
USER nextjs
EXPOSE 3000
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD wget -qO- http://localhost:3000 || exit 1
CMD ["npm", "start"]
