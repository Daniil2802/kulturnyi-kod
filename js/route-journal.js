(() => {
  const DB_NAME = "darom-cultural-check";
  const STORE_NAME = "place-journals";
  const MAX_PHOTOS = 5;
  const MAX_FILE_SIZE = 8 * 1024 * 1024;
  let dbPromise;

  function openDatabase() {
    if (dbPromise) return dbPromise;
    dbPromise = new Promise((resolve, reject) => {
      if (!("indexedDB" in window)) {
        reject(new Error("Этот браузер не поддерживает локальное хранилище фотографий."));
        return;
      }
      const request = indexedDB.open(DB_NAME, 1);
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, {keyPath: "placeId"});
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error || new Error("Не удалось открыть хранилище."));
    });
    return dbPromise;
  }

  async function readEntry(placeId) {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const request = db.transaction(STORE_NAME, "readonly").objectStore(STORE_NAME).get(placeId);
      request.onsuccess = () => resolve(request.result || {placeId, note: "", visitedAt: null, photos: []});
      request.onerror = () => reject(request.error || new Error("Не удалось прочитать запись."));
    });
  }

  async function updateEntry(placeId, update) {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, "readwrite");
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get(placeId);
      request.onsuccess = () => {
        const entry = request.result || {placeId, note: "", visitedAt: null, photos: []};
        update(entry);
        store.put(entry);
      };
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error || new Error("Не удалось сохранить запись."));
      transaction.onabort = () => reject(transaction.error || new Error("Сохранение отменено."));
    });
  }

  function dateLabel(value) {
    if (!value) return "";
    return new Intl.DateTimeFormat("ru-RU", {day:"numeric", month:"long", year:"numeric"}).format(new Date(value));
  }

  function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, char => ({
      "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;"
    })[char]);
  }

  function reportError(error) {
    console.error(error);
    alert(error?.message || "Не удалось сохранить изменения. Проверь свободное место в браузере.");
  }

  async function renderPlace(place, card) {
    const entry = await readEntry(place.id);
    const status = card.querySelector("[data-visit-status]");
    const visitButton = card.querySelector("[data-visit]");
    const note = card.querySelector("[data-note]");
    const photoList = card.querySelector("[data-photo-list]");

    status.textContent = entry.visitedAt ? `Посещено ${dateLabel(entry.visitedAt)}` : "Ещё не посещено";
    status.classList.toggle("is-visited", Boolean(entry.visitedAt));
    visitButton.textContent = entry.visitedAt ? "Отменить отметку" : "Отметить посещение";
    note.value = entry.note || "";
    photoList.replaceChildren();

    (entry.photos || []).forEach(photo => {
      const figure = document.createElement("figure");
      figure.className = "journal-photo";
      const image = document.createElement("img");
      image.src = URL.createObjectURL(photo.blob);
      image.alt = photo.name || `Фото места ${place.title}`;
      const caption = document.createElement("figcaption");
      caption.textContent = photo.name || "Фотография";
      const remove = document.createElement("button");
      remove.type = "button";
      remove.className = "journal-photo-remove";
      remove.textContent = "Удалить";
      remove.setAttribute("aria-label", `Удалить фотографию: ${photo.name || "без названия"}`);
      remove.addEventListener("click", async () => {
        try {
          await updateEntry(place.id, current => {
            current.photos = (current.photos || []).filter(item => item.id !== photo.id);
          });
          renderPlace(place, card);
        } catch (error) { reportError(error); }
      });
      figure.append(image, caption, remove);
      photoList.append(figure);
    });

    visitButton.onclick = async () => {
      try {
        await updateEntry(place.id, current => {
          current.visitedAt = current.visitedAt ? null : new Date().toISOString();
        });
        renderPlace(place, card);
      } catch (error) { reportError(error); }
    };

    let saveTimer;
    note.oninput = () => {
      window.clearTimeout(saveTimer);
      card.querySelector("[data-save-state]").textContent = "Сохраняю…";
      saveTimer = window.setTimeout(async () => {
        try {
          await updateEntry(place.id, current => { current.note = note.value; });
          card.querySelector("[data-save-state]").textContent = "Сохранено в этом браузере";
        } catch (error) {
          card.querySelector("[data-save-state]").textContent = "Не удалось сохранить";
          reportError(error);
        }
      }, 350);
    };

    card.querySelector("[data-photos]").onchange = async event => {
      const input = event.currentTarget;
      const selectedFiles = [...input.files];
      input.value = "";
      if (!selectedFiles.length) return;
      try {
        const current = await readEntry(place.id);
        const available = Math.max(0, MAX_PHOTOS - (current.photos || []).length);
        if (!available) {
          alert(`Для одного места можно сохранить не больше ${MAX_PHOTOS} фотографий.`);
          return;
        }
        const files = selectedFiles.slice(0, available);
        const oversized = files.find(file => file.size > MAX_FILE_SIZE);
        if (oversized) {
          alert(`Файл «${oversized.name}» больше 8 МБ. Выбери фотографию меньшего размера.`);
          return;
        }
        await updateEntry(place.id, entry => {
          entry.photos = entry.photos || [];
          files.forEach(file => entry.photos.push({
            id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
            name: file.name,
            blob: file,
            addedAt: new Date().toISOString()
          }));
        });
        renderPlace(place, card);
      } catch (error) { reportError(error); }
    };
  }

  function mount(selected) {
    const host = document.getElementById("routeJournal");
    if (!host) return;
    if (!selected.length) {
      host.replaceChildren();
      return;
    }
    host.innerHTML = `<div class="journal-heading">
        <p class="eyebrow">Твой маршрут</p>
        <h2>Впечатления о местах</h2>
        <p>Отметь посещение, запиши свои впечатления и сохрани фотографии. Записи доступны только в этом браузере.</p>
      </div>
      <div class="journal-places">${selected.map(place => `<article class="journal-place" data-journal-place="${escapeHTML(place.id)}">
        <div class="journal-place-head">
          <div><p class="eyebrow">${escapeHTML(place.kind)}</p><h3>${escapeHTML(place.title)}</h3></div>
          <span class="journal-status" data-visit-status>Загружаю…</span>
        </div>
        <button class="button button-light journal-visit" type="button" data-visit>Отметить посещение</button>
        <label class="journal-label" for="note-${escapeHTML(place.id)}">Твои впечатления</label>
        <textarea id="note-${escapeHTML(place.id)}" data-note rows="4" maxlength="3000" placeholder="Что запомнилось? Что хочется рассказать?"></textarea>
        <div class="journal-save-state" data-save-state>Сохраняется автоматически</div>
        <label class="journal-label" for="photos-${escapeHTML(place.id)}">Фотографии</label>
        <input class="journal-file-input" id="photos-${escapeHTML(place.id)}" data-photos type="file" accept="image/*" multiple>
        <small class="journal-hint">До ${MAX_PHOTOS} фото на место, не больше 8 МБ каждое. Фото сохраняются в этом браузере.</small>
        <div class="journal-photo-list" data-photo-list></div>
      </article>`).join("")}</div>`;

    selected.forEach(place => {
      const card = [...host.querySelectorAll("[data-journal-place]")].find(item => item.dataset.journalPlace === String(place.id));
      renderPlace(place, card).catch(reportError);
    });
  }

  window.RouteJournal = {mount};
  const initialIds = JSON.parse(localStorage.getItem("selectedPlaces") || "[]");
  mount(places.filter(place => initialIds.includes(place.id)));
})();
