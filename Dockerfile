FROM node:24-slim AS builder

WORKDIR /app

RUN npm config set registry https://registry.npmmirror.com && \
    npm install -g pnpm@11.10.0 && \
    pnpm config set registry https://registry.npmmirror.com && \
    pnpm config set store-dir /pnpm/store

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN --mount=type=cache,id=pnpm-store,target=/pnpm/store \
    pnpm install --frozen-lockfile

COPY . .

ARG GIT_HASH
ENV NUXT_PUBLIC_GIT_HASH=${GIT_HASH}

RUN pnpm run build

FROM node:24-slim

WORKDIR /app

ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=3000

COPY --from=builder --chown=node:node /app/.output .output

USER node

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD node -e "fetch('http://127.0.0.1:3000/').then(r => process.exit(r.ok ? 0 : 1)).catch(() => process.exit(1))"

CMD ["node", ".output/server/index.mjs"]
