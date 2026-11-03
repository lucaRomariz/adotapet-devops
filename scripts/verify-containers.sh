#!/usr/bin/env bash
set -euo pipefail
# Rodar com imagem já construída/publicada. Projeto Compose isolado do ambiente local.
export COMPOSE_PROJECT_NAME="${COMPOSE_PROJECT_NAME:-adotapet-check}"
export APP_PORT=3000
export APP_IMAGE="${APP_IMAGE:-adotapet:local}"
original_image="$APP_IMAGE"
cleanup() {
  docker compose logs --no-color || true
  docker compose down --volumes --remove-orphans
}
trap cleanup EXIT

docker compose up -d --no-build --wait --wait-timeout 90
node scripts/smoke.mjs
# Cadastrar e confirmar persistência após recriação do container.
node --input-type=module <<'JS'
import assert from 'node:assert/strict';
const response = await fetch('http://127.0.0.1:3000/api/animals', {
  method: 'POST', headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({name:'Persistencia A2',species:'Gato',age:2,city:'Brasília',description:'Animal cadastrado no teste de persistência da A2.'})
});
assert.equal(response.status, 201);
JS
docker compose up -d --no-build --force-recreate --wait --wait-timeout 90
node --input-type=module <<'JS'
import assert from 'node:assert/strict';
const animals = await (await fetch('http://127.0.0.1:3000/api/animals')).json();
assert.ok(animals.some(a => a.name === 'Persistencia A2'));
console.log('Persistência aprovada após recriar container.');
JS
# Criar imagem defeituosa para simular uma atualização que não inicia.
docker build -t adotapet:broken -f - . <<DOCKERFILE
FROM $original_image
CMD ["node", "-e", "process.exit(1)"]
DOCKERFILE
export APP_IMAGE=adotapet:broken
if docker compose up -d --no-build --wait --wait-timeout 20; then
  echo 'ERRO: a atualização defeituosa deveria falhar.' >&2
  exit 1
fi
echo 'Falha detectada; restaurando imagem anterior.'
export APP_IMAGE="$original_image"
docker compose up -d --no-build --force-recreate --wait --wait-timeout 90
node scripts/smoke.mjs
node --input-type=module <<'JS'
import assert from 'node:assert/strict';
const animals = await (await fetch('http://127.0.0.1:3000/api/animals')).json();
assert.ok(animals.some(a => a.name === 'Persistencia A2'));
console.log('Rollback aprovado com dados preservados.');
JS
