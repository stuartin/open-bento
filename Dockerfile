# ---------- Base stage ----------
FROM node:24-slim AS base

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

# ---------- Init stage ----------
FROM base as build

COPY . /build
WORKDIR /build

RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile

RUN pnpm --filter=@open-bento/website deploy /build/website
COPY apps/website/src/lib/server/db/migrations /build/website/migrations
RUN pnpm --dir /build/website install --prod --frozen-lockfile
RUN pnpm --dir /build/website run build

# ---------- Runtime stage ----------
FROM base as app

ENV PUBLIC_ORIGIN="http://localhost:3000"
ENV ORIGIN=${PUBLIC_ORIGIN}
ENV PUBLIC_DATABASE_PATH="file:/app/db/local.db"
ENV PUBLIC_DATABASE_MIGRATIONS_PATH="/app/migrations"

WORKDIR /app
RUN mkdir -p ./db
COPY --from=build /build/website/migrations ./migrations
COPY --from=build /build/website/node_modules ./build/node_modules
COPY --from=build /build/website/build ./build

EXPOSE 3000

CMD ["node", "build"]
