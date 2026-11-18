#!/usr/bin/env bash
set -euo pipefail
umask 077

: "${APP_IMAGE:?Informe o digest publicado}"
: "${DEMO_SSH_TARGET:?Configure DEMO_SSH_TARGET}"
: "${DEMO_SSH_KEY:?Configure DEMO_SSH_KEY}"
: "${DEMO_SSH_KNOWN_HOSTS:?Configure DEMO_SSH_KNOWN_HOSTS}"
: "${GRAFANA_ADMIN_PASSWORD:?Configure GRAFANA_ADMIN_PASSWORD}"
[[ "$DEMO_SSH_TARGET" =~ ^[a-zA-Z0-9_][a-zA-Z0-9_-]*@[a-zA-Z0-9][a-zA-Z0-9.-]*$ ]]
[[ "$APP_IMAGE" =~ ^ghcr\.io/[a-z0-9._/-]+@sha256:[a-f0-9]{64}$ ]]
[[ "$GRAFANA_ADMIN_PASSWORD" != *$'\n'* ]]

ssh_files=$(mktemp -d)
trap 'rm -rf "$ssh_files"' EXIT
printf '%s\n' "$DEMO_SSH_KEY" > "$ssh_files/key"
printf '%s\n' "$DEMO_SSH_KNOWN_HOSTS" > "$ssh_files/known_hosts"

# A senha trafega pelo stdin do SSH e a chave do host é verificada antes da conexão.
{
  printf '%s\n' "$GRAFANA_ADMIN_PASSWORD"
  tar -czf - docker-compose.yml docker-compose.observability.yml observability \
    scripts/deploy-demo.sh scripts/smoke.mjs scripts/smoke-observability.mjs
} | ssh -T -i "$ssh_files/key" -o IdentitiesOnly=yes -o BatchMode=yes -o ConnectTimeout=15 \
  -o StrictHostKeyChecking=yes -o UserKnownHostsFile="$ssh_files/known_hosts" "$DEMO_SSH_TARGET" \
  "bash -c 'set -euo pipefail
    umask 077
    IFS= read -r GRAFANA_ADMIN_PASSWORD
    export GRAFANA_ADMIN_PASSWORD APP_IMAGE=\"$APP_IMAGE\"
    mkdir -p ~/adotapet-releases
    release=\$(mktemp -d ~/adotapet-releases/deploy.XXXXXXXX)
    cd \"\$release\"
    chmod 755 \"\$release\"
    umask 022
    tar -xzf -
    bash scripts/deploy-demo.sh'"

printf 'Imagem implantada: `%s`\n' "$APP_IMAGE" >> "$GITHUB_STEP_SUMMARY"
