import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createAnimal, listAnimals } from "./database.js";
import { filterAnimals, validateAnimal } from "./domain/animals.js";

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

const server = http.createServer((request, response) => {
  const url = new URL(request.url, `http://${request.headers.host}`);

  if (request.method === "GET" && url.pathname === "/api/animals") {
    const animals = filterAnimals(listAnimals(), Object.fromEntries(url.searchParams));
    return sendJson(response, 200, animals);
  }

  if (request.method === "POST" && url.pathname === "/api/animals") {
    let rawBody = "";
    request.on("data", (chunk) => { rawBody += chunk; });
    request.on("end", () => {
      try {
        const validation = validateAnimal(JSON.parse(rawBody || "{}"));
        if (!validation.valid) return sendJson(response, 400, { errors: validation.errors });
        return sendJson(response, 201, createAnimal(validation.animal));
      } catch {
        return sendJson(response, 400, { errors: ["Envie um JSON válido."] });
      }
    });
    return;
  }

  if (request.method === "GET" && url.pathname === "/") return serveFile(response, "index.html", "text/html; charset=utf-8");
  if (request.method === "GET" && url.pathname === "/styles.css") return serveFile(response, "styles.css", "text/css; charset=utf-8");
  if (request.method === "GET" && url.pathname === "/app.js") return serveFile(response, "app.js", "application/javascript; charset=utf-8");
  return sendJson(response, 404, { error: "Rota não encontrada." });
});

server.listen(port, () => console.log(`AdotaPet disponível em http://localhost:${port}`));
