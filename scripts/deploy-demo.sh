#!/usr/bin/env bash
set -euo pipefail

export COMPOSE_PROJECT_NAME=adotapet-demo
export APP_PORT=3000
export GRAFANA_PORT=3001
: "${APP_IMAGE:?Informe a imagem do GHCR por digest}"
: "${GRAFANA_ADMIN_PASSWORD:?Defina a senha do Grafana}"
[[ "$APP_IMAGE" =~ ^ghcr\.io/[a-z0-9._/-]+@sha256:[a-f0-9]{64}$ ]]

compose=(docker compose -f docker-compose.yml -f docker-compose.observability.yml)
previous_id=$("${compose[@]}" ps --all --quiet app)
previous_image=""
if [[ -n "$previous_id" ]]; then
  previous_image=$(docker inspect --format '{{.Image}}' "$previous_id")
fi

docker pull "$APP_IMAGE"
if "${compose[@]}" up -d --no-build --wait --wait-timeout 90 && node scripts/smoke.mjs && node scripts/smoke-observability.mjs; then
  printf 'Deploy em homologação concluído: %s\n' "$APP_IMAGE"
  if [[ -n "${GITHUB_STEP_SUMMARY:-}" ]]; then
    printf 'Imagem implantada: `%s`\n' "$APP_IMAGE" >> "$GITHUB_STEP_SUMMARY"
  fi
  exit 0
fi

echo 'Falha no deploy. Iniciando recuperação da aplicação.' >&2
if [[ -n "$previous_image" ]]; then
  # O ID local mantém disponível a imagem anterior, inclusive durante falhas no GHCR.
  docker tag "$previous_image" adotapet:previous
  APP_IMAGE=adotapet:previous "${compose[@]}" up -d --no-build --no-deps --wait --wait-timeout 90 app
  node scripts/smoke.mjs
  echo 'Versão anterior restaurada.'
else
  "${compose[@]}" stop app
fi
exit 1
