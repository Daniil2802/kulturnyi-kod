const container = document.getElementById("itemDetail");
const id = Number(new URLSearchParams(location.search).get("id"));
const item = objects.find(object => object.id === id);

if (!item) {
  container.innerHTML = `<section class="empty item-missing">
    <h1>Такого товара пока нет на полке</h1>
    <p>Вернись в лавку — там ещё много историй.</p>
    <a class="button" href="catalog.html">Открыть лавку</a>
  </section>`;
} else {
  container.innerHTML = `<div class="item-art" aria-hidden="true"><span>${item.people[0]}</span><small>КУЛЬТУРНАЯ ЛАВКА КУЗБАССА</small></div>
    <article class="item-copy">
      <p class="eyebrow">${item.people} · ${item.category}</p>
      <h1>${item.name}</h1>
      ${item.id === 7 ? "" : `<p class="item-intro">${item.short}</p>`}
      <div class="item-story"><h2>История товара</h2><p>${item.meaning}</p></div>
      <p class="item-source"><b>Откуда эта история:</b> ${item.source}</p>
      <button class="button" type="button" id="addItem">＋ Положить в культурный чек</button>
      <p class="item-confirmation" id="confirmation" aria-live="polite"></p>
    </article>`;

  document.getElementById("addItem").addEventListener("click", () => {
    const ids = JSON.parse(localStorage.getItem("collection") || "[]");
    if (!ids.includes(item.id)) ids.push(item.id);
    localStorage.setItem("collection", JSON.stringify(ids));
    document.getElementById("confirmation").textContent = "Товар в чеке. Можно продолжить выбор или посмотреть чек.";
  });
}
