#!/usr/bin/env bash
set -euo pipefail

export COMPOSE_PROJECT_NAME=adotapet-observability-check
export APP_IMAGE="${APP_IMAGE:-adotapet:local}"
export APP_PORT=3000
export GRAFANA_PORT=3001
export GRAFANA_ADMIN_PASSWORD
GRAFANA_ADMIN_PASSWORD=$(openssl rand -hex 24)
compose=(docker compose -f docker-compose.yml -f docker-compose.observability.yml)

cleanup() {
  if [[ "$1" != 0 ]]; then
    "${compose[@]}" logs --no-color || true
  fi
  "${compose[@]}" down --volumes --remove-orphans
}
trap 'cleanup "$?"' EXIT

"${compose[@]}" config --quiet
"${compose[@]}" up -d --no-build --wait --wait-timeout 90
node scripts/smoke-observability.mjs
