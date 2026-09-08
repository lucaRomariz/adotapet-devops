import { DatabaseSync } from "node:sqlite";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const databaseDir = path.join(here, "..", "database");
fs.mkdirSync(databaseDir, { recursive: true });

const db = new DatabaseSync(path.join(databaseDir, "adota-pet.sqlite"));
db.exec(`
  CREATE TABLE IF NOT EXISTS animals (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    species TEXT NOT NULL,
    age INTEGER NOT NULL,
    city TEXT NOT NULL,
    description TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'disponível',
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  )
`);

const count = db.prepare("SELECT COUNT(*) AS total FROM animals").get().total;
if (count === 0) {
  const insert = db.prepare(
    "INSERT INTO animals (name, species, age, city, description) VALUES (?, ?, ?, ?, ?)"
  );
  insert.run("Luna", "Cachorro", 3, "Brasília", "Carinhosa, vacinada e pronta para encontrar uma família.");
  insert.run("Mingau", "Gato", 2, "Brasília", "Gato dócil, castrado e acostumado a viver em apartamento.");
}

export function listAnimals() {
  return db.prepare("SELECT * FROM animals WHERE status = 'disponível' ORDER BY id DESC").all();
}

export function createAnimal(animal) {
  const result = db.prepare(
    "INSERT INTO animals (name, species, age, city, description) VALUES (?, ?, ?, ?, ?)"
  ).run(animal.name, animal.species, animal.age, animal.city, animal.description);
  return db.prepare("SELECT * FROM animals WHERE id = ?").get(result.lastInsertRowid);
}
