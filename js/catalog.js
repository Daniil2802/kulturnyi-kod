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

  catalog.innerHTML = list.map(o => renderCultureObjectCard(o)).join("") || "<p class=\"empty\">Пока ничего не приглянулось по этому запросу. Попробуй выбрать другие товары.</p>";

}

pf.addEventListener("change", render);
cf.addEventListener("change", render);
render();
