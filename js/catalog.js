const catalog = document.getElementById("catalog");
const pf = document.getElementById("peopleFilter");
const cf = document.getElementById("categoryFilter");
const params = new URLSearchParams(location.search);

if (params.get("people")) pf.value = params.get("people");
if (params.get("category")) cf.value = params.get("category");

function render() {
  const list = objects.filter(o =>
    (!pf.value || o.people === pf.value) && (!cf.value || o.category === cf.value)
  );

  catalog.innerHTML = list.map(o => `<article class="card">
    <a class="card-art${o.image ? " has-image" : ""}" href="item.html?id=${o.id}" aria-label="Открыть карточку: ${o.name}">${o.image ? `<img src="${o.image}" alt="${o.name}" loading="lazy">` : o.people[0]}</a>
    <div class="card-body">
      <span class="tag">${o.people} · ${o.category}</span>
      <h2><a href="item.html?id=${o.id}">${o.name}</a></h2>
      <p>${o.short}</p>
      <div class="card-actions">
        <button type="button" data-add="${o.id}">＋ В культурный чек</button>
        <a href="item.html?id=${o.id}">История товара →</a>
      </div>
    </div>
  </article>`).join("") || "<p class=\"empty\">Пока ничего не приглянулось по этому запросу. Попробуй выбрать другие товары.</p>";

  catalog.querySelectorAll("[data-add]").forEach(button => {
    button.addEventListener("click", () => addToReceipt(Number(button.dataset.add), button));
  });
}

function addToReceipt(id, button) {
  const ids = JSON.parse(localStorage.getItem("collection") || "[]");
  if (!ids.includes(id)) ids.push(id);
  localStorage.setItem("collection", JSON.stringify(ids));
  const original = button.textContent;
  button.textContent = "✓ Уже в чеке";
  button.classList.add("is-added");
  window.setTimeout(() => {
    button.textContent = original;
    button.classList.remove("is-added");
  }, 1300);
}

pf.addEventListener("change", render);
cf.addEventListener("change", render);
render();
