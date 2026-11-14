# syntax=docker/dockerfile:1

FROM node:20-alpine AS build

WORKDIR /app

ENV NEXT_TELEMETRY_DISABLED=1

COPY package.json package-lock.json ./
COPY apps/api/package.json apps/api/package.json
COPY apps/web/package.json apps/web/package.json

RUN --mount=type=cache,target=/root/.npm,sharing=locked \
  npm ci --workspace web --include-workspace-root --no-audit --no-fund

COPY apps/web ./apps/web

RUN npm run build --workspace web \
  && npm prune --omit=dev --workspace web --include-workspace-root


FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup -S nodejs && adduser -S sentinel -G nodejs

COPY --chown=sentinel:nodejs --from=build /app/node_modules ./node_modules
COPY --chown=sentinel:nodejs --from=build /app/package.json ./package.json
COPY --chown=sentinel:nodejs --from=build /app/apps/web/package.json ./apps/web/package.json
COPY --chown=sentinel:nodejs --from=build /app/apps/web/next.config.ts ./apps/web/next.config.ts
COPY --chown=sentinel:nodejs --from=build /app/apps/web/next-env.d.ts ./apps/web/next-env.d.ts
COPY --chown=sentinel:nodejs --from=build /app/apps/web/tsconfig.json ./apps/web/tsconfig.json
COPY --chown=sentinel:nodejs --from=build /app/apps/web/public ./apps/web/public
COPY --chown=sentinel:nodejs --from=build /app/apps/web/.next ./apps/web/.next

USER sentinel

EXPOSE 3000

CMD ["npm", "run", "start", "--workspace", "web", "--", "-H", "0.0.0.0", "-p", "3000"]
