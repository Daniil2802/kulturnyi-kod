const container = document.getElementById("itemDetail");
const id = Number(new URLSearchParams(location.search).get("id"));
const item = objects.find(object => object.id === id);

if (!item) {
  container.innerHTML = `<section class="empty item-missing">
    <h1>Такого предмета пока нет в каталоге</h1>
    <p>Вернись к каталогу предметов и выбери другую историю.</p>
    <a class="button" href="catalog.html">К предметам</a>
  </section>`;
} else {
  container.innerHTML = `${renderCultureObjectCard(item, { detail: true })}
    <article class="item-copy">
      <p class="eyebrow">${item.people} · ${item.category}</p>
      ${item.id === 7 ? "" : `<p class="item-intro">${item.short}</p>`}
      <div class="item-story"><h2>История предмета</h2><p>${item.meaning}</p></div>
      <p class="item-source"><b>Откуда эта история:</b> ${item.source}</p>
    </article>`;
}
