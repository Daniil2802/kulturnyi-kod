const host = document.getElementById("collection");
const recipientKey = "culturalReceiptRecipient";

function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, char => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  })[char]);
}

function plural(count, one, few, many) {
  const lastTwo = count % 100;
  const last = count % 10;
  if (lastTwo >= 11 && lastTwo <= 14) return many;
  if (last === 1) return one;
  if (last >= 2 && last <= 4) return few;
  return many;
}

function readSelected() {
  const ids = JSON.parse(localStorage.getItem("collection") || "[]");
  return objects.filter(object => ids.includes(object.id));
}

function render() {
  const selected = readSelected();
  if (!selected.length) {
    host.innerHTML = `<div class="empty">
      <h2>Чек пока пуст</h2>
      <p>Загляни в лавку и выбери товары, которые напоминают тебе о близком человеке.</p>
      <a class="button" href="catalog.html">Выбрать товары</a>
    </div>`;
    return;
  }

  const peoples = [...new Set(selected.map(object => object.people))];
  const recipient = escapeHTML(localStorage.getItem(recipientKey) || "Дорогой человек");
  const date = new Intl.DateTimeFormat("ru-RU", {day:"numeric", month:"long", year:"numeric"}).format(new Date());

  host.innerHTML = `<div class="receipt-tools">
      <label for="recipient">Кому собираем чек?</label>
      <input id="recipient" name="recipient" type="text" maxlength="60" value="${recipient}" placeholder="Например, для Ани">
      <p>Выбирай то, что ассоциируется с этим человеком. Это подарок из историй и культурных вещей.</p>
    </div>
    <article class="receipt" id="receipt">
      <header class="receipt-head">
        <p class="receipt-shop">КУЛЬТУРНАЯ ЛАВКА КУЗБАССА</p>
        <h2>Культурный чек</h2>
        <p>Собран с теплом для <strong class="receipt-recipient">${recipient}</strong></p>
        <small>${date} · Кемеровская область — Кузбасс</small>
      </header>
      <div class="receipt-rule"></div>
      <p class="receipt-label">ВЫБРАННЫЕ ИСТОРИИ</p>
      <div class="receipt-items">${selected.map(object => `<div class="receipt-row">
          <div><strong>${object.name}</strong><small>${object.people} · ${object.category}</small><p>${object.short}</p></div>
          <button type="button" class="remove-item" data-remove="${object.id}" aria-label="Убрать ${object.name} из чека">×</button>
        </div>`).join("")}</div>
      <div class="receipt-rule"></div>
      <div class="receipt-total"><span>Историй в чеке</span><b>${selected.length} ${plural(selected.length,"история","истории","историй")}</b></div>
      <div class="receipt-total"><span>Культур представлено</span><b>${peoples.length} ${plural(peoples.length,"народ","народа","народов")}</b></div>
      <p class="receipt-peoples">${peoples.join(" · ")}</p>
      <footer class="receipt-foot">Не цена важна, а то, о ком ты вспомнил.<br>Передай чек и поделись историей.</footer>
    </article>
    <div class="receipt-actions">
      <button class="button" id="shareReceipt" type="button">Поделиться культурным чеком</button>
      <button class="button button-light" id="printReceipt" type="button">Распечатать / сохранить PDF</button>
    </div>`;

  const recipientInput = document.getElementById("recipient");
  recipientInput.addEventListener("input", () => {
    const value = recipientInput.value.trim() || "Дорогой человек";
    localStorage.setItem(recipientKey, value);
    host.querySelector(".receipt-recipient").textContent = value;
  });
  host.querySelectorAll("[data-remove]").forEach(button => button.addEventListener("click", () => {
    const ids = JSON.parse(localStorage.getItem("collection") || "[]").filter(id => id !== Number(button.dataset.remove));
    localStorage.setItem("collection", JSON.stringify(ids));
    render();
  }));
  document.getElementById("shareReceipt").addEventListener("click", () => shareReceipt(selected, localStorage.getItem(recipientKey) || "Дорогой человек"));
  document.getElementById("printReceipt").addEventListener("click", () => window.print());
}

async function shareReceipt(selected, recipient) {
  const peoples = [...new Set(selected.map(object => object.people))];
  const lines = selected.map(object => `• ${object.name} — ${object.people}: ${object.short}`);
  const text = `Культурный чек для ${recipient}\n\nЯ выбрал(а) эти истории, потому что они напомнили мне о тебе:\n${lines.join("\n")}\n\nКультуры: ${peoples.join(", ")}\nИз культурной лавки Кузбасса.`;
  if (navigator.share) {
    try { await navigator.share({title: `Культурный чек для ${recipient}`, text}); return; } catch (error) { if (error.name === "AbortError") return; }
  }
  try {
    await navigator.clipboard.writeText(text);
    alert("Текст культурного чека скопирован — отправь его другу.");
  } catch {
    alert(text);
  }
}

render();
