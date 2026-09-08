const list = document.querySelector("#animalList");
const count = document.querySelector("#animalCount");
const form = document.querySelector("#animalForm");
const message = document.querySelector("#formMessage");

function escapeHtml(text) { return String(text).replace(/[&<>'"]/g, (c) => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", "'":"&#39;", '"':"&quot;" })[c]); }
function card(animal) { return `<article class="card"><div class="pet-icon">${animal.species === "Gato" ? "🐈" : animal.species === "Cachorro" ? "🐕" : "🐾"}</div><span class="tag">${escapeHtml(animal.species)}</span><h3>${escapeHtml(animal.name)}</h3><p class="muted">${animal.age} ${animal.age === 1 ? "ano" : "anos"} · ${escapeHtml(animal.city)}</p><p>${escapeHtml(animal.description)}</p></article>`; }
async function loadAnimals() {
  const params = new URLSearchParams();
  const species = document.querySelector("#speciesFilter").value;
  const city = document.querySelector("#cityFilter").value;
  if (species) params.set("species", species); if (city) params.set("city", city);
  const response = await fetch(`/api/animals?${params}`); const animals = await response.json();
  count.textContent = `${animals.length} ${animals.length === 1 ? "animal encontrado" : "animais encontrados"}`;
  list.innerHTML = animals.length ? animals.map(card).join("") : "<p>Nenhum animal encontrado com esses filtros.</p>";
}
document.querySelector("#filterButton").addEventListener("click", loadAnimals);
form.addEventListener("submit", async (event) => {
  event.preventDefault(); message.textContent = "";
  const data = Object.fromEntries(new FormData(form)); data.age = Number(data.age);
  const response = await fetch("/api/animals", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
  const body = await response.json();
  if (!response.ok) { message.className = "error full"; message.textContent = body.errors.join(" "); return; }
  message.className = "success full"; message.textContent = `${body.name} foi cadastrado com sucesso!`; form.reset(); loadAnimals();
});
loadAnimals();
