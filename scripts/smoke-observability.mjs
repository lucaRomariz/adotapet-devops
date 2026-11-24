import assert from "node:assert/strict";
import { setTimeout as delay } from "node:timers/promises";

const app = process.env.BASE_URL || "http://127.0.0.1:3000";
const grafana = process.env.GRAFANA_URL || "http://127.0.0.1:3001";
const credentials = Buffer.from(`admin:${process.env.GRAFANA_ADMIN_PASSWORD}`).toString("base64");
const headers = { Authorization: `Basic ${credentials}` };

async function readGrafana(path, params = {}) {
  const url = new URL(path, grafana);
  url.search = new URLSearchParams(params);
  const response = await fetch(url, { headers, signal: AbortSignal.timeout(3000) });
  assert.ok(response.ok, `Grafana respondeu HTTP ${response.status} para ${path}`);
  return response.json();
}

const response = await fetch(`${app}/api/animals`, { signal: AbortSignal.timeout(3000) });
assert.equal(response.status, 200);
const requestId = response.headers.get("x-request-id");
assert.match(requestId, /^[a-f0-9-]{36}$/);
await response.text();

for (let attempt = 0; ; attempt++) {
  try {
    const [dashboard, metrics, logs] = await Promise.all([
      readGrafana("/api/dashboards/uid/adotapet-a3"),
      readGrafana("/api/datasources/proxy/uid/prometheus/api/v1/query", {
        query: 'adotapet_http_requests_total{route="/api/animals",status="200"}',
      }),
      readGrafana("/api/datasources/proxy/uid/loki/loki/api/v1/query_range", {
        query: `{app="adotapet"} |= "${requestId}"`,
        since: "5m",
      }),
    ]);
    assert.equal(dashboard.dashboard.panels.length, 6);
    assert.ok(metrics.data.result.some(metric => Number(metric.value[1]) > 0), "Prometheus sem métrica HTTP");
    assert.ok(logs.data.result.length > 0, "Loki ainda não recebeu o log da requisição de teste");
    console.log(`Grafana validado: dashboard provisionado, métrica HTTP coletada e log localizado pelo ID ${requestId}.`);
    break;
  } catch (error) {
    if (attempt === 29) throw error;
    await delay(3000);
  }
}
