import { randomUUID } from "node:crypto";
import { performance } from "node:perf_hooks";

const routes = new Set(["/", "/api/animals", "/health", "/styles.css", "/app.js"]);
const bounds = [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5];
const requests = new Map();
const buckets = bounds.map(() => 0);
let count = 0;
let sum = 0;

export function observeRequest(request, response, pathname) {
  const start = performance.now();
  const requestId = randomUUID();
  const route = routes.has(pathname) ? pathname : "other";
  const method = ["GET", "POST", "HEAD", "OPTIONS"].includes(request.method) ? request.method : "OTHER";
  response.setHeader("X-Request-Id", requestId);

  response.once("finish", () => {
    const durationMs = performance.now() - start;
    const seconds = durationMs / 1000;
    const status = response.statusCode;
    const labels = `method="${method}",route="${route}",status="${status}"`;
    requests.set(labels, (requests.get(labels) ?? 0) + 1);
    for (const [index, bound] of bounds.entries()) {
      if (seconds <= bound) buckets[index]++;
    }
    count++;
    sum += seconds;
    console.log(JSON.stringify({ event: "http_request", requestId, method, route, status, durationMs }));
  });
}

export function serveMetrics(response) {
  const cpu = process.cpuUsage();
  const lines = [
    "# TYPE adotapet_http_requests_total counter",
    ...Array.from(requests, ([labels, value]) => `adotapet_http_requests_total{${labels}} ${value}`),
    "# TYPE adotapet_http_request_duration_seconds histogram",
    ...bounds.map((bound, index) => `adotapet_http_request_duration_seconds_bucket{le="${bound}"} ${buckets[index]}`),
    `adotapet_http_request_duration_seconds_bucket{le="+Inf"} ${count}`,
    `adotapet_http_request_duration_seconds_count ${count}`,
    `adotapet_http_request_duration_seconds_sum ${sum}`,
    "# TYPE process_cpu_seconds_total counter",
    `process_cpu_seconds_total ${(cpu.user + cpu.system) / 1e6}`,
    "# TYPE process_resident_memory_bytes gauge",
    `process_resident_memory_bytes ${process.memoryUsage.rss()}`,
  ];
  response.writeHead(200, { "Content-Type": "text/plain; version=0.0.4; charset=utf-8" });
  response.end(lines.join("\n") + "\n");
}
