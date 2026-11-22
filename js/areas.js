const areaList = document.getElementById("areaList");

areaList.innerHTML = areas.map(function(area) {
  const count = places.filter(function(place) { return place.areaId === area.id; }).length;
  return '<a class="region-card" href="area.html?area=' + encodeURIComponent(area.id) + '">' +
    '<img src="' + area.image + '" alt="" loading="lazy">' +
    '<div class="region-card-copy"><span class="eyebrow">Направление</span><h2>' + area.title + '</h2>' +
    '<p>' + area.short + '</p><span class="region-card-meta">' + count + ' ' + pluralPlaces(count) + ' →</span></div></a>';
}).join("");

function pluralPlaces(count) {
  const lastTwo = count % 100;
  const last = count % 10;
  if (lastTwo >= 11 && lastTwo <= 14) return "мест";
  if (last === 1) return "место";
  if (last >= 2 && last <= 4) return "места";
  return "мест";
}
