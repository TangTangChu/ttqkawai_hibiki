#!/usr/bin/env bash

set -euo pipefail

if ! command -v docker >/dev/null 2>&1; then
    echo "[deploy] docker 未安装或不在 PATH 中"
    exit 1
fi

if ! docker compose version >/dev/null 2>&1; then
    echo "[deploy] docker compose 不可用，请安装 Docker Compose v2"
    exit 1
fi

GIT_HASH="dev"
if command -v git >/dev/null 2>&1 && git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
    GIT_HASH="$(git rev-parse HEAD)"
fi

export GIT_HASH

echo "[deploy] 使用 GIT_HASH=${GIT_HASH}"
echo "[deploy] 开始构建并重启服务..."

docker compose up -d --build

echo "[deploy] 部署完成"