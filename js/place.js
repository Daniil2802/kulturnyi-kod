const placeHost = document.getElementById("placePage");
const params = new URLSearchParams(location.search);
const place = places.find(function(item) { return item.id === params.get("id"); });

function escapePlaceText(value) {
  return String(value).replace(/[&<>"']/g, function(char) {
    return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[char];
  });
}


const MEMORY_DB_NAME = "darom-place-memories";
const MEMORY_STORE_NAME = "entries";

function openMemoryDatabase() {
  return new Promise(function(resolve, reject) {
    if (!("indexedDB" in window)) {
      reject(new Error("В этом браузере недоступно локальное хранилище фотографий."));
      return;
    }
    const request = indexedDB.open(MEMORY_DB_NAME, 1);
    request.onupgradeneeded = function() {
      const database = request.result;
      if (!database.objectStoreNames.contains(MEMORY_STORE_NAME)) {
        const store = database.createObjectStore(MEMORY_STORE_NAME, {keyPath:"id", autoIncrement:true});
        store.createIndex("placeId", "placeId", {unique:false});
      }
    };
    request.onsuccess = function() { resolve(request.result); };
    request.onerror = function() { reject(request.error || new Error("Не удалось открыть хранилище.")); };
  });
}

function loadPlaceMemories(placeId) {
  return openMemoryDatabase().then(function(database) {
    return new Promise(function(resolve, reject) {
      const transaction = database.transaction(MEMORY_STORE_NAME, "readonly");
      const request = transaction.objectStore(MEMORY_STORE_NAME).index("placeId").getAll(placeId);
      request.onsuccess = function() {
        resolve(request.result.sort(function(a, b) { return b.createdAt - a.createdAt; }));
      };
      request.onerror = function() { reject(request.error); };
      transaction.oncomplete = function() { database.close(); };
      transaction.onerror = function() { database.close(); reject(transaction.error); };
    });
  });
}

function savePlaceMemory(entry) {
  return openMemoryDatabase().then(function(database) {
    return new Promise(function(resolve, reject) {
      const transaction = database.transaction(MEMORY_STORE_NAME, "readwrite");
      const request = transaction.objectStore(MEMORY_STORE_NAME).add(entry);
      request.onsuccess = function() { resolve(request.result); };
      request.onerror = function() { reject(request.error); };
      transaction.oncomplete = function() { database.close(); };
      transaction.onerror = function() { database.close(); reject(transaction.error); };
    });
  });
}

function removePlaceMemory(id) {
  return openMemoryDatabase().then(function(database) {
    return new Promise(function(resolve, reject) {
      const transaction = database.transaction(MEMORY_STORE_NAME, "readwrite");
      transaction.objectStore(MEMORY_STORE_NAME).delete(Number(id));
      transaction.oncomplete = function() { database.close(); resolve(); };
      transaction.onerror = function() { database.close(); reject(transaction.error); };
    });
  });
}

function renderMemoryJournal() {
  return '<section class="place-panel place-memory">' +
    '<p class="eyebrow">Твои воспоминания</p><h2>Заметка об этом месте</h2>' +
    '<p class="place-memory-intro">Запиши впечатления и добавь фотографии. Они сохранятся в этом браузере на твоём устройстве.</p>' +
    '<form id="placeMemoryForm" class="place-memory-form">' +
    '<label for="placeMemoryText">Впечатления</label>' +
    '<textarea id="placeMemoryText" name="text" maxlength="2000" rows="4" placeholder="Что запомнилось? Какие чувства вызвало это место?"></textarea>' +
    '<label for="placeMemoryPhotos">Фотографии <span>до 5 за одну заметку</span></label>' +
    '<input id="placeMemoryPhotos" name="photos" type="file" accept="image/*" multiple>' +
    '<button class="button" type="submit">Сохранить в браузере</button>' +
    '<p id="placeMemoryStatus" class="place-memory-status" aria-live="polite"></p>' +
    '</form><div id="placeMemoryList" class="place-memory-list" aria-live="polite"></div>' +
    '<p class="place-memory-privacy">Заметки и фото доступны только в этом браузере. Если очистить его данные или открыть сайт на другом устройстве, записи не перенесутся.</p>' +
    '</section>';
}

function renderPlaceMemories(placeId) {
  const list = document.getElementById("placeMemoryList");
  if (!list) return;
  (window.placeMemoryObjectUrls || []).forEach(function(url) { URL.revokeObjectURL(url); });
  window.placeMemoryObjectUrls = [];
  loadPlaceMemories(placeId).then(function(entries) {
    if (!document.getElementById("placeMemoryList")) return;
    if (!entries.length) {
      list.innerHTML = '<p class="place-memory-empty">Здесь появятся твои заметки и фотографии.</p>';
      return;
    }
    list.innerHTML = entries.map(function(entry) {
      const photos = (entry.photos || []).map(function(photo) {
        const url = URL.createObjectURL(photo.blob);
        window.placeMemoryObjectUrls.push(url);
        return '<a class="place-memory-photo" href="' + url + '" target="_blank" rel="noopener" aria-label="Открыть фотографию: ' + escapePlaceText(photo.name) + '">' +
          '<img src="' + url + '" alt="' + escapePlaceText(photo.name) + '" loading="lazy"></a>';
      }).join("");
      const text = entry.text ? '<p class="place-memory-note">' + escapePlaceText(entry.text).replace(/\n/g, "<br>") + '</p>' : "";
      const date = new Intl.DateTimeFormat("ru-RU", {day:"numeric", month:"long", year:"numeric", hour:"2-digit", minute:"2-digit"}).format(new Date(entry.createdAt));
      return '<article class="place-memory-entry"><div class="place-memory-entry-head"><time>' + escapePlaceText(date) + '</time>' +
        '<button type="button" class="place-memory-delete" data-delete-memory="' + entry.id + '">Удалить</button></div>' +
        text + (photos ? '<div class="place-memory-photos">' + photos + '</div>' : '') + '</article>';
    }).join("");
  }).catch(function() {
    list.innerHTML = '<p class="place-memory-empty">Не удалось прочитать сохранённые заметки в этом браузере.</p>';
  });
}

function initMemoryJournal(placeId) {
  renderPlaceMemories(placeId);
  const form = document.getElementById("placeMemoryForm");
  const status = document.getElementById("placeMemoryStatus");
  form.addEventListener("submit", function(event) {
    event.preventDefault();
    const text = form.elements.text.value.trim();
    const files = Array.from(form.elements.photos.files || []);
    if (!text && !files.length) {
      status.textContent = "Добавь текст или выбери фотографию.";
      return;
    }
    if (files.length > 5) {
      status.textContent = "В одну заметку можно добавить не больше пяти фотографий.";
      return;
    }
    if (files.some(function(file) { return !file.type.startsWith("image/"); })) {
      status.textContent = "Можно добавлять только изображения.";
      return;
    }
    status.textContent = "Сохраняю…";
    Promise.resolve().then(function() {
      return navigator.storage && navigator.storage.persist ? navigator.storage.persist().catch(function() { return false; }) : false;
    }).then(function() {
      return savePlaceMemory({
        placeId: placeId,
        text: text,
        createdAt: Date.now(),
        photos: files.map(function(file) { return {name:file.name, type:file.type, blob:file}; })
      });
    }).then(function() {
      form.reset();
      status.textContent = "Сохранено в этом браузере.";
      renderPlaceMemories(placeId);
    }).catch(function() {
      status.textContent = "Не удалось сохранить. Возможно, в браузере закончилось место.";
    });
  });
  document.getElementById("placeMemoryList").addEventListener("click", function(event) {
    const button = event.target.closest("[data-delete-memory]");
    if (!button) return;
    removePlaceMemory(button.dataset.deleteMemory).then(function() {
      renderPlaceMemories(placeId);
    }).catch(function() {
      status.textContent = "Не удалось удалить запись.";
    });
  });
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

function addPlaceObject(id, button) {
  const ids = JSON.parse(localStorage.getItem("collection") || "[]");
  if (!ids.includes(id)) ids.push(id);
  localStorage.setItem("collection", JSON.stringify(ids));
  button.textContent = "✓ Уже в чеке";
  button.classList.add("is-added");
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
    '<div class="place-hero-caption"><span class="tag">' + escapePlaceText(place.kind) + '</span><h1>' + escapePlaceText(place.title) + '</h1><div class="place-location"><span class="place-location-label">Местоположение:</span><span>' + escapePlaceText(place.address) + '</span><a class="place-map-link" href="' + mapSearchUrl(place) + '" target="_blank" rel="noopener">Открыть в Яндекс Картах ↗</a></div></div></section>' +
    '<div class="place-panels"><section class="place-panel"><p class="eyebrow">История места</p><h2>Описание</h2>' +
    '<p>' + escapePlaceText(place.description) + '</p>' + (place.extra ? '<p>' + escapePlaceText(place.extra) + '</p>' : '') +
    '<p class="source-line">Источник: <a href="' + place.sourceUrl + '" target="_blank" rel="noopener">' + escapePlaceText(place.source) + '</a></p>' +
    '<p class="source-line">Фото: <a href="' + place.photoSource + '" target="_blank" rel="noopener">' + escapePlaceText(place.photoCredit) + '</a></p></section>' +
    '<section class="place-panel"><p class="eyebrow">Культурная связь</p><h2>' + escapePlaceText(place.itemsTitle || "Предметы этого места") + '</h2>' +
    (place.itemsNote ? '<p class="items-note">' + escapePlaceText(place.itemsNote) + '</p>' : '') +
    (selectedObjects.length ? '<div class="place-object-list">' + selectedObjects.map(function(object) {
      return '<article class="place-object">' + (object.image ? '<a class="place-object-image" href="item.html?id=' + object.id + '" aria-label="Открыть карточку: ' + escapePlaceText(object.name) + '"><img src="' + escapePlaceText(object.image) + '" alt="' + escapePlaceText(object.name) + '" loading="lazy"></a>' : '') + '<span class="tag">' + escapePlaceText(object.people) + ' · ' + escapePlaceText(object.category) + '</span>' +
        '<h3><a href="item.html?id=' + object.id + '">' + escapePlaceText(object.name) + '</a></h3><p>' + escapePlaceText(object.short) + '</p>' +
        '<div class="place-object-actions"><a href="item.html?id=' + object.id + '">История предмета →</a><button type="button" class="button" data-add-object="' + object.id + '">＋ В культурный чек</button></div></article>';
    }).join("") + '</div>' : '<p class="items-note">' + escapePlaceText(place.emptyObjects || "Список предметов этого места скоро появится.") + '</p>') +
    '</section></div>' + renderPartnerTour(place.partnerTour) + renderMemoryJournal();
  placeHost.querySelectorAll("[data-add-object]").forEach(function(button) {
    button.addEventListener("click", function() { addPlaceObject(Number(button.dataset.addObject), button); });
  });
  initMemoryJournal(place.id);
}
