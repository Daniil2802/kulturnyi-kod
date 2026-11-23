const placeSelectionKey = "selectedPlaces";
function readPlaceSelection() {
  try { const ids = JSON.parse(localStorage.getItem(placeSelectionKey) || "[]"); return Array.isArray(ids) ? ids : []; }
  catch { return []; }
}
function placeSelectionButton(place) {
  const selected = readPlaceSelection().includes(place.id);
  const id = String(place.id).replace(/[&<>"']/g, "");
  return '<button type="button" class="button place-select-button" data-add-place="' + id + '" aria-pressed="' + selected + '">' + (selected ? '✓ В культурном чеке' : '＋ В культурный чек') + '</button>';
}
function bindPlaceSelectionButtons() {
  document.querySelectorAll("[data-add-place]").forEach(function(button) {
    button.addEventListener("click", function() {
      const ids = readPlaceSelection(), id = button.dataset.addPlace, index = ids.indexOf(id);
      if (index >= 0) ids.splice(index, 1); else ids.push(id);
      localStorage.setItem(placeSelectionKey, JSON.stringify(ids));
      document.querySelectorAll("[data-add-place]").forEach(function(item) {
        const selected = ids.includes(item.dataset.addPlace);
        item.setAttribute("aria-pressed", String(selected));
        item.textContent = selected ? '✓ В культурном чеке' : '＋ В культурный чек';
      });
    });
  });
}
