const areaHost = document.getElementById("areaPage");
const params = new URLSearchParams(location.search);
const area = areas.find(function(item) { return item.id === params.get("area"); });

function escapeText(value) {
  return String(value || "").replace(/[&<>"']/g, function(char) {
    return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[char];
  });
}

function renderPlaceCards(list) {
  const seasonFilter = document.getElementById("seasonFilter");
  const season = seasonFilter.value;
  const filtered = season
    ? list.filter(function(place) { return (place.seasons || []).includes(season); })
    : list;
  const host = document.getElementById("placeList");
  host.className = "places-catalog-grid";

  host.innerHTML = filtered.map(function(place) {
    const summary = place.shortDescription || place.description || "";
    return '<article class="place-catalog-card">' +
      '<img class="place-catalog-image" src="' + escapeText(place.image) + '" alt="' + escapeText(place.imageAlt || place.title) + '" loading="lazy">' +
      '<div class="place-catalog-shade" aria-hidden="true"></div>' +
      '<div class="place-catalog-copy">' +
        '<span class="place-catalog-kind">' + escapeText(place.kind) + '</span>' +
        '<h2><a href="place.html?id=' + encodeURIComponent(place.id) + '">' + escapeText(place.title) + '</a></h2>' +
        '<p>' + escapeText(summary) + '</p>' +
        '<span class="place-catalog-location">' + escapeText(area.title) + ' · ' + escapeText(place.address) + '</span>' +
      '</div>' +
      '<div class="place-catalog-actions">' + placeSelectionButton(place) +
        '<a class="place-catalog-more" href="place.html?id=' + encodeURIComponent(place.id) + '">Подробнее <span aria-hidden="true">↗</span></a>' +
      '</div>' +
    '</article>';
  }).join("") || '<p class="place-catalog-empty">Для этого сезона мест пока нет. Выбери другое время поездки.</p>';

  bindPlaceSelectionButtons();
}

if (!area) {
  areaHost.innerHTML = '<section class="empty"><h1>Такого города или района пока нет</h1><a class="button" href="places.html">Посмотреть все места</a></section>';
} else {
  const list = places.filter(function(place) { return place.areaId === area.id; });
  document.title = area.title + " — Культурный код Кузбасса";
  areaHost.innerHTML = '<a class="back-link" href="places.html">Все места</a>' +
    '<p class="eyebrow">Места Кузбасса</p><h1>' + escapeText(area.title) + '</h1>' +
    '<p class="lead">' + escapeText(area.short) + '</p>' +
    '<div class="filters place-season-filter"><label for="seasonFilter">Сезон поездки</label>' +
    '<select id="seasonFilter"><option value="">Все сезоны</option><option value="summer">Лето</option><option value="winter">Зима</option></select></div>' +
    '<div id="placeList"></div>';
  document.getElementById("seasonFilter").value = ["summer", "winter"].includes(params.get("season")) ? params.get("season") : "";
  document.getElementById("seasonFilter").addEventListener("change", function() { renderPlaceCards(list); });
  renderPlaceCards(list);
}
