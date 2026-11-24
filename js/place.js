const placeHost = document.getElementById("placePage");
const params = new URLSearchParams(location.search);
const place = places.find(function(item) { return item.id === params.get("id"); });

function escapePlaceText(value) {
  return String(value).replace(/[&<>"']/g, function(char) {
    return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[char];
  });
}

function formatPlaceTitle(value) {
  return escapePlaceText(value).replace(/«([^»]+)»/g, '<span style="white-space:nowrap;font-family:inherit!important;font-size:inherit!important;font-weight:inherit!important;font-style:inherit!important;letter-spacing:inherit!important;text-transform:inherit!important">«$1»</span>');
}

function mapSearchUrl(place) {
  return "https://yandex.ru/maps/?text=" + encodeURIComponent(place.title + ", " + place.address);
}

function renderPartnerTour(tour) {
  if (!tour) return "";
  const details = (tour.details || []).map(function(detail) {
    return "<li>" + escapePlaceText(detail) + "</li>";
  }).join("");
  return '<section class="place-panel place-tour-panel"><p class="eyebrow">Партнёр путешествия</p>' +
    '<h2>' + escapePlaceText(tour.title) + '</h2><p class="place-tour-partner">' + escapePlaceText(tour.partner) + '</p>' +
    '<p>' + escapePlaceText(tour.intro) + '</p><ul class="place-tour-details">' + details + '</ul>' +
    '<div class="place-tour-pricing"><p><strong>Стоимость экскурсии:</strong> ' + escapePlaceText(tour.price) + '</p>' +
    '<p>' + escapePlaceText(tour.priceNote) + '</p></div>' +
    '<p><strong>Бронирование:</strong> <a href="tel:' + escapePlaceText(tour.phone.replace(/[^+\d]/g, "")) + '">' + escapePlaceText(tour.phone) + '</a> · ' + escapePlaceText(tour.address) + '</p>' +
    '<div class="place-tour-links"><a href="' + escapePlaceText(tour.routeUrl) + '" target="_blank" rel="noopener">Маршрут на сайте парка ↗</a>' +
    '<a href="' + escapePlaceText(tour.servicesUrl) + '" target="_blank" rel="noopener">Услуги и цены ↗</a>' +
    '<a href="' + escapePlaceText(tour.rulesUrl) + '" target="_blank" rel="noopener">Правила посещения пещер ↗</a>' +
    '<a href="' + escapePlaceText(tour.contactUrl) + '" target="_blank" rel="noopener">Контакты парка ↗</a></div></section>';
}

if (!place) {
  placeHost.innerHTML = '<section class="empty"><h1>Такого места пока нет</h1><a class="button" href="places.html">Вернуться к местам</a></section>';
} else {
  const area = areas.find(function(item) { return item.id === place.areaId; });
  const selectedObjects = (place.objects || []).map(function(id) {
    return objects.find(function(object) { return object.id === id; });
  }).filter(Boolean);
  document.title = place.title + " — Культурный код Кузбасса";
  placeHost.innerHTML = '<a class="back-link" href="area.html?area=' + encodeURIComponent(place.areaId) + '">← ' + escapePlaceText(area ? area.title : "Все места") + '</a>' +
    '<section class="place-hero"><img src="' + place.image + '" alt="' + escapePlaceText(place.imageAlt) + '">' +
    '<div class="place-hero-caption"><span class="tag">' + escapePlaceText(place.kind) + '</span><h1>' + formatPlaceTitle(place.title) + '</h1><div class="place-location"><span class="place-location-label">Местоположение:</span><span>' + escapePlaceText(place.address) + '</span><a class="place-map-link" href="' + mapSearchUrl(place) + '" target="_blank" rel="noopener">Открыть в Яндекс Картах ↗</a></div>' + placeSelectionButton(place) + '</div></section>' +
    '<div class="place-panels"><section class="place-panel"><p class="eyebrow">История места</p><h2>Описание</h2>' +
    '<p>' + escapePlaceText(place.description) + '</p>' + (place.extra ? '<p>' + escapePlaceText(place.extra) + '</p>' : '') +
    '<p class="source-line">Источник: <a href="' + place.sourceUrl + '" target="_blank" rel="noopener">' + escapePlaceText(place.source) + '</a></p>' +
    '<p class="source-line">Фото: <a href="' + place.photoSource + '" target="_blank" rel="noopener">' + escapePlaceText(place.photoCredit) + '</a></p></section>' +
    '<section class="place-panel"><p class="eyebrow">Культурная связь</p><h2>' + escapePlaceText(place.itemsTitle || "Предметы этого места") + '</h2>' +
    (place.itemsNote ? '<p class="items-note">' + escapePlaceText(place.itemsNote) + '</p>' : '') +
    (selectedObjects.length ? '<div class="place-object-list">' + selectedObjects.map(function(object) {
      return '<article class="place-object">' + (object.image ? '<a class="place-object-image" href="item.html?id=' + object.id + '" aria-label="Открыть карточку: ' + escapePlaceText(object.name) + '"><img src="' + escapePlaceText(object.image) + '" alt="' + escapePlaceText(object.name) + '" loading="lazy"></a>' : '') + '<span class="tag">' + escapePlaceText(object.people) + ' · ' + escapePlaceText(object.category) + '</span>' +
        '<h3><a href="item.html?id=' + object.id + '">' + escapePlaceText(object.name) + '</a></h3><p>' + escapePlaceText(object.short) + '</p>' +
        '<div class="place-object-actions"><a href="item.html?id=' + object.id + '">История предмета →</a></div></article>';
    }).join("") + '</div>' : '<p class="items-note">' + escapePlaceText(place.emptyObjects || "Список предметов этого места скоро появится.") + '</p>') +
    '</section></div>' + renderPartnerTour(place.partnerTour);
  bindPlaceSelectionButtons();
}
