export const SPECIES = ["Cachorro", "Gato", "Outro"];

export function validateAnimal(input) {
  const animal = {
    name: String(input.name ?? "").trim(),
    species: String(input.species ?? "").trim(),
    age: Number(input.age),
    city: String(input.city ?? "").trim(),
    description: String(input.description ?? "").trim()
  };

  const errors = [];
  if (animal.name.length < 2) errors.push("Informe um nome com ao menos 2 caracteres.");
  if (!SPECIES.includes(animal.species)) errors.push("Selecione uma espécie válida.");
  if (!Number.isInteger(animal.age) || animal.age < 0 || animal.age > 30) {
    errors.push("Informe uma idade entre 0 e 30 anos.");
  }
  if (animal.city.length < 2) errors.push("Informe a cidade.");
  if (animal.description.length < 10) {
    errors.push("A descrição deve ter ao menos 10 caracteres.");
  }

  return { valid: errors.length === 0, errors, animal };
}

export function filterAnimals(animals, filters = {}) {
  const species = String(filters.species ?? "").trim();
  const city = String(filters.city ?? "").trim().toLocaleLowerCase("pt-BR");

  return animals.filter((animal) =>
    (!species || animal.species === species) &&
    (!city || animal.city.toLocaleLowerCase("pt-BR").includes(city))
  );
}
