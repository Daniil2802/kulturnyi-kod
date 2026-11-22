const areaHost = document.getElementById("areaPage");
const params = new URLSearchParams(location.search);
const area = areas.find(function(item) { return item.id === params.get("area"); });

function escapeText(value) {
  return String(value).replace(/[&<>"']/g, function(char) {
    return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[char];
  });
}

function mapSearchUrl(place) {
  return "https://yandex.ru/maps/?text=" + encodeURIComponent(place.title + ", " + place.address);
}

if (!area) {
  areaHost.innerHTML = '<section class="empty"><h1>Такого направления пока нет</h1><a class="button" href="places.html">Посмотреть все места</a></section>';
} else {
  const list = places.filter(function(place) { return place.areaId === area.id; });
  document.title = area.title + " — Культурный код Кузбасса";
  areaHost.innerHTML = '<a class="back-link" href="places.html">← Все направления</a>' +
    '<p class="eyebrow">Места Кузбасса</p><h1>' + escapeText(area.title) + '</h1>' +
    '<p class="lead">' + escapeText(area.short) + '</p>' +
    '<div class="place-list">' + list.map(function(place) {
      return '<article class="place-card">' +
        '<img src="' + place.image + '" alt="' + escapeText(place.imageAlt) + '" loading="lazy">' +
        '<div class="place-card-copy"><span class="tag">' + escapeText(place.kind) + '</span><h2><a href="place.html?id=' + encodeURIComponent(place.id) + '">' + escapeText(place.title) + '</a></h2>' +
        '<p>' + escapeText(place.description) + '</p><div class="place-card-location"><span class="place-location-label">Местоположение:</span><span>' + escapeText(place.address) + '</span>' +
        '<a class="place-map-link" href="' + mapSearchUrl(place) + '" target="_blank" rel="noopener">Открыть в Яндекс Картах ↗</a></div><a class="place-card-open" href="place.html?id=' + encodeURIComponent(place.id) + '">Открыть место →</a></div></article>';
    }).join("") + '</div>';
}
