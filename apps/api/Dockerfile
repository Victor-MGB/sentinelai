# syntax=docker/dockerfile:1

FROM node:20-alpine AS build

WORKDIR /app

COPY package.json package-lock.json tsconfig.base.json ./
COPY apps/api/package.json apps/api/package.json
COPY apps/web/package.json apps/web/package.json

RUN --mount=type=cache,target=/root/.npm,sharing=locked \
  npm ci --workspace api --include-workspace-root --no-audit --no-fund

COPY apps/api ./apps/api

RUN npm run build --workspace api \
  && npm prune --omit=dev --workspace api --include-workspace-root


FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV NODE_OPTIONS=--enable-source-maps

RUN addgroup -S nodejs && adduser -S sentinel -G nodejs

COPY --chown=sentinel:nodejs --from=build /app/node_modules ./node_modules
COPY --chown=sentinel:nodejs --from=build /app/package.json ./package.json
COPY --chown=sentinel:nodejs --from=build /app/apps/api/package.json ./apps/api/package.json
COPY --chown=sentinel:nodejs --from=build /app/apps/api/dist ./apps/api/dist
COPY --chown=sentinel:nodejs --from=build /app/apps/api/drizzle ./apps/api/drizzle

USER sentinel

EXPOSE 3001

CMD ["node", "apps/api/dist/index.js"]
