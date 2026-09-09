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
test("aceita animal com idade 0", () => {
  const result = validateAnimal({ ...validAnimal, age: 0 });
  assert.equal(result.valid, true);
});

test("aceita animal com idade 30", () => {
  const result = validateAnimal({ ...validAnimal, age: 30 });
  assert.equal(result.valid, true);
});

test("rejeita animal com idade 31", () => {
  const result = validateAnimal({ ...validAnimal, age: 31 });
  assert.equal(result.valid, false);
});

test("rejeita animal com espécie inválida", () => {
  const result = validateAnimal({ ...validAnimal, species: "Peixe" });
  assert.equal(result.valid, false);
});

test("rejeita animal com descrição menor que 10 caracteres", () => {
  const result = validateAnimal({ ...validAnimal, description: "curta" });
  assert.equal(result.valid, false);
});

test("filtra por cidade ignorando maiúsculas e minúsculas", () => {
  const animals = [validAnimal, { ...validAnimal, name: "Mingau", city: "Goiânia" }];
  assert.deepEqual(
    filterAnimals(animals, { city: "BRASÍLIA" }).map((a) => a.name),
    ["Luna"]
  );
  assert.deepEqual(
    filterAnimals(animals, { city: "brasília" }).map((a) => a.name),
    ["Luna"]
  );
});
