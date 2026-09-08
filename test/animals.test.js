import test from "node:test";
import assert from "node:assert/strict";
import { filterAnimals, validateAnimal } from "../src/domain/animals.js";

const validAnimal = { name: "Luna", species: "Cachorro", age: 3, city: "Brasília", description: "Muito carinhosa e pronta para adoção responsável." };

test("valida um animal com dados completos", () => {
  const result = validateAnimal(validAnimal);
  assert.equal(result.valid, true);
  assert.deepEqual(result.errors, []);
});

test("rejeita animal com campos inválidos", () => {
  const result = validateAnimal({ name: "", species: "Peixe", age: 40, city: "", description: "curta" });
  assert.equal(result.valid, false);
  assert.equal(result.errors.length, 5);
});

test("filtra animais por espécie e cidade", () => {
  const animals = [validAnimal, { ...validAnimal, name: "Mingau", species: "Gato", city: "Goiânia" }];
  assert.deepEqual(filterAnimals(animals, { species: "Gato" }).map((a) => a.name), ["Mingau"]);
  assert.deepEqual(filterAnimals(animals, { city: "bras" }).map((a) => a.name), ["Luna"]);
});
