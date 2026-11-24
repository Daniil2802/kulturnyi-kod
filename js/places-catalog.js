const catalogHost = document.getElementById("placeCatalog");
const areaFilter = document.getElementById("placeAreaFilter");
const seasonFilter = document.getElementById("placeSeasonFilter");
const searchInput = document.getElementById("placeSearch");
const sortFilter = document.getElementById("placeSort");

function catalogEscape(value) {
  return String(value || "").replace(/[&<>"']/g, function(char) {
    return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[char];
  });
}

function populateCatalogFilters() {
  areaFilter.innerHTML += areas.map(function(area) {
    return '<option value="' + catalogEscape(area.id) + '">' + catalogEscape(area.title) + '</option>';
  }).join("");

}

function renderPlacesCatalog() {
  const query = searchInput.value.trim().toLocaleLowerCase("ru");
  let visiblePlaces = places.filter(function(place) {
    const areaMatches = !areaFilter.value || place.areaId === areaFilter.value;
    const seasonMatches = !seasonFilter.value || (place.seasons || []).includes(seasonFilter.value);
    const searchText = [place.title, place.kind, place.address, place.shortDescription, place.description]
      .join(" ").toLocaleLowerCase("ru");
    return areaMatches && seasonMatches && (!query || searchText.includes(query));
  });

  if (sortFilter.value === "title") {
    visiblePlaces.sort(function(a, b) { return a.title.localeCompare(b.title, "ru"); });
  }

  catalogHost.innerHTML = visiblePlaces.map(function(place) {
    const area = areas.find(function(item) { return item.id === place.areaId; });
    const summary = place.shortDescription || place.description || "";
    return '<article class="place-catalog-card">' +
      '<img class="place-catalog-image" src="' + catalogEscape(place.image) + '" alt="' + catalogEscape(place.imageAlt || place.title) + '" loading="lazy">' +
      '<div class="place-catalog-shade" aria-hidden="true"></div>' +
      '<div class="place-catalog-copy">' +
        '<span class="place-catalog-kind">' + catalogEscape(place.kind) + '</span>' +
        '<h2><a href="place.html?id=' + encodeURIComponent(place.id) + '">' + catalogEscape(place.title) + '</a></h2>' +
        '<p>' + catalogEscape(summary) + '</p>' +
        '<span class="place-catalog-location">' + catalogEscape(area ? area.title : "") + ' · ' + catalogEscape(place.address) + '</span>' +
      '</div>' +
      '<div class="place-catalog-actions">' + placeSelectionButton(place) +
        '<a class="place-catalog-more" href="place.html?id=' + encodeURIComponent(place.id) + '">Подробнее <span aria-hidden="true">↗</span></a>' +
      '</div>' +
    '</article>';
  }).join("") || '<p class="place-catalog-empty">По этим условиям мест пока нет. Попробуй изменить фильтры.</p>';

  bindPlaceSelectionButtons();
}

populateCatalogFilters();
[areaFilter, seasonFilter, sortFilter].forEach(function(control) {
  control.addEventListener("change", renderPlacesCatalog);
});
searchInput.addEventListener("input", renderPlacesCatalog);
renderPlacesCatalog();
