import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { checkDatabase, createAnimal, listAnimals } from "./database.js";
import { filterAnimals, validateAnimal } from "./domain/animals.js";
import { observeRequest, serveMetrics } from "./telemetry.js";

const here = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.join(here, "..", "public");
const port = Number(process.env.PORT || 3000);

function sendJson(response, status, body) {
  response.writeHead(status, { "Content-Type": "application/json; charset=utf-8" });
  response.end(JSON.stringify(body));
}

function serveFile(response, filename, contentType) {
  fs.readFile(path.join(publicDir, filename), (error, data) => {
    if (error) return sendJson(response, 404, { error: "Arquivo não encontrado." });
    response.writeHead(200, { "Content-Type": contentType });
    response.end(data);
  });
}

function handleRequest(request, response, url) {

  if (request.method === "GET" && url.pathname === "/health") {
    try {
      return sendJson(response, checkDatabase() ? 200 : 503, { status: "ok" });
    } catch {
      return sendJson(response, 503, { status: "unavailable" });
    }
  }

  if (request.method === "GET" && url.pathname === "/api/animals") {
    return sendJson(response, 200, filterAnimals(listAnimals(), Object.fromEntries(url.searchParams)));
  }

  if (request.method === "POST" && url.pathname === "/api/animals") {
    let rawBody = "";
    request.on("data", (chunk) => { rawBody += chunk; });
    request.on("end", () => {
      let input;
      try {
        input = JSON.parse(rawBody || "{}");
      } catch {
        return sendJson(response, 400, { errors: ["Envie um JSON válido."] });
      }
      const validation = validateAnimal(input);
      if (!validation.valid) return sendJson(response, 400, { errors: validation.errors });
      try {
        return sendJson(response, 201, createAnimal(validation.animal));
      } catch {
        return sendJson(response, 500, { error: "Erro interno." });
      }
    });
    return;
  }

  if (request.method === "GET" && url.pathname === "/") return serveFile(response, "index.html", "text/html; charset=utf-8");
  if (request.method === "GET" && url.pathname === "/styles.css") return serveFile(response, "styles.css", "text/css; charset=utf-8");
  if (request.method === "GET" && url.pathname === "/app.js") return serveFile(response, "app.js", "application/javascript; charset=utf-8");
  return sendJson(response, 404, { error: "Rota não encontrada." });
}

const server = http.createServer((request, response) => {
  let url;
  try {
    url = new URL(request.url, "http://localhost");
  } catch {
    observeRequest(request, response, "other");
    return sendJson(response, 400, { error: "URL inválida." });
  }
  if (request.method === "GET" && url.pathname === "/metrics") return serveMetrics(response);
  observeRequest(request, response, url.pathname);
  try {
    return handleRequest(request, response, url);
  } catch {
    return sendJson(response, 500, { error: "Erro interno." });
  }
});

server.listen(port, () => console.log(`AdotaPet disponível em http://localhost:${server.address().port}`));

for (const signal of ["SIGTERM", "SIGINT"]) {
  process.on(signal, () => {
    server.close(() => process.exit(0));
    setTimeout(() => process.exit(1), 10000).unref();
  });
}
