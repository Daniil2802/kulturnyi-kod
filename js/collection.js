const host = document.getElementById("collection");
const recipientKey = "culturalReceiptRecipient";
const shareParams = new URLSearchParams(location.search);

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

function encodeSharePayload(value) {
  const bytes = new TextEncoder().encode(JSON.stringify({
    i: value.ids,
    r: value.recipient,
    d: value.date
  }));
  let binary = "";
  for (let offset = 0; offset < bytes.length; offset += 0x8000) {
    binary += String.fromCharCode(...bytes.subarray(offset, offset + 0x8000));
  }
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function readSharePayload(raw, compact) {
  if (!compact) return JSON.parse(raw);
  const base64 = raw.replace(/-/g, "+").replace(/_/g, "/");
  const binary = atob(base64 + "=".repeat((4 - base64.length % 4) % 4));
  const bytes = Uint8Array.from(binary, character => character.charCodeAt(0));
  return JSON.parse(new TextDecoder().decode(bytes));
}

function readSharedReceipt() {
  const compactRaw = shareParams.get("s");
  const legacyRaw = shareParams.get("share");
  const raw = compactRaw || legacyRaw;
  if (!raw) return null;
  try {
    const value = readSharePayload(raw, Boolean(compactRaw));
    const rawIds = value.ids ?? value.i;
    if (!Array.isArray(rawIds)) return null;
    const ids = rawIds.map(Number).filter(Number.isInteger);
    const selected = objects.filter(object => ids.includes(object.id));
    if (!selected.length) return null;
    return {
      selected,
      recipient: typeof (value.recipient ?? value.r) === "string" && (value.recipient ?? value.r).trim()
        ? (value.recipient ?? value.r).trim().slice(0, 60)
        : "Дорогой человек",
      date: typeof (value.date ?? value.d) === "string" ? (value.date ?? value.d) : ""
    };
  } catch {
    return null;
  }
}

function formatDate() {
  return new Intl.DateTimeFormat("ru-RU", {day:"numeric", month:"long", year:"numeric"}).format(new Date());
}

function receiptNumberFor(selected, recipient, dateText) {
  const seed = `${dateText}|${recipient}|${selected.map(object => object.id).join(",")}`;
  const value = [...seed].reduce((sum, character) => sum + character.charCodeAt(0), 0);
  return String(1000 + value % 9000);
}

function receiptMarkup(selected, recipient, {readOnly = false, dateText = formatDate()} = {}) {
  const peoples = [...new Set(selected.map(object => object.people))];
  const number = receiptNumberFor(selected, recipient, dateText);
  return `<article class="receipt" id="receipt">
    <header class="receipt-head">
      <p class="receipt-shop">КАССА «ДАРОМ»</p>
      <h2>КУЛЬТУРНЫЙ ЧЕК</h2>
      <p class="receipt-number">№ ${number}</p>
      <p>для <strong class="receipt-recipient">${escapeHTML(recipient)}</strong></p>
      <small>${escapeHTML(dateText)} · Кемеровская область — Кузбасс</small>
    </header>
    <div class="receipt-rule"></div>
    <p class="receipt-label">В ЧЕКЕ:</p>
    <div class="receipt-items">${selected.map((object, index) => `<div class="receipt-row">
      <div class="receipt-row-copy">
        <div class="receipt-item-line"><strong>${index + 1}. ${escapeHTML(object.name)}</strong><b class="receipt-price">ДАРОМ</b></div>
        <small>${escapeHTML(object.people)} · ${escapeHTML(object.category)}</small>
        <p>${escapeHTML(object.short)}</p>
      </div>
      ${readOnly ? "" : `<button type="button" class="remove-item" data-remove="${object.id}" aria-label="Убрать ${escapeHTML(object.name)} из чека">×</button>`}
    </div>`).join("")}</div>
    <div class="receipt-rule"></div>
    <div class="receipt-total"><span>ИТОГО: ${selected.length} ${plural(selected.length,"предмет","предмета","предметов")}</span><b>${peoples.length} ${plural(peoples.length,"культура","культуры","культур")}</b></div>
    <div class="receipt-payment"><span>К ОПЛАТЕ</span><b>0 ₽</b></div>
    <p class="receipt-note">Культуру нельзя купить — можно только подарить знание.</p>
    <footer class="receipt-foot">СПАСИБО ЗА ВИЗИТ.<br>ДЕЛИСЬ ИСТОРИЯМИ.</footer>
  </article>`;
}

function render() {
  const shared = readSharedReceipt();
  if (shared) {
    document.querySelector(".page > .eyebrow").textContent = "Тебя пригласили в лавку";
    document.querySelector(".page > h1").textContent = "Вот твой культурный чек";
    document.querySelector(".page > .lead").textContent = `Для тебя собрали истории о вещах, которые напомнили отправителю о тебе.`;
    host.innerHTML = `${receiptMarkup(shared.selected, shared.recipient, {readOnly:true, dateText:shared.date || formatDate()})}
      <section class="share-invitation">
        <p class="eyebrow">Твоя очередь</p>
        <h2>Собери чек для своего близкого</h2>
        <p>Загляни в культурную лавку, выбери то, что ассоциируется с другом или родным человеком, и отправь ему свой чек.</p>
        <a class="button" href="catalog.html">Собрать свой чек →</a>
      </section>`;
    return;
  }

  const selected = readSelected();
  if (!selected.length) {
    host.innerHTML = `<div class="empty">
      <h2>Чек пока пуст</h2>
      <p>Загляни в лавку и выбери товары, которые напоминают тебе о близком человеке.</p>
      <a class="button" href="catalog.html">Выбрать товары</a>
    </div>`;
    return;
  }

  const recipient = localStorage.getItem(recipientKey) || "Дорогой человек";
  host.innerHTML = `<div class="receipt-tools">
      <label for="recipient">Кому собираем чек?</label>
      <input id="recipient" name="recipient" type="text" maxlength="60" value="${escapeHTML(recipient)}" placeholder="Например, для Ани">
      <p>Выбирай то, что ассоциируется с этим человеком. Это подарок из историй и культурных вещей.</p>
    </div>
    ${receiptMarkup(selected, recipient)}
    <div class="receipt-actions">
      <button class="button" id="shareReceipt" type="button">Поделиться чеком и пригласить</button>
      <button class="button button-light" id="printReceipt" type="button">Распечатать / сохранить PDF</button>
    </div>`;

  document.getElementById("recipient").addEventListener("input", event => {
    const value = event.target.value.trim() || "Дорогой человек";
    localStorage.setItem(recipientKey, value);
    host.querySelector(".receipt-recipient").textContent = value;
  });
  host.querySelectorAll("[data-remove]").forEach(button => button.addEventListener("click", () => {
    const ids = JSON.parse(localStorage.getItem("collection") || "[]").filter(id => id !== Number(button.dataset.remove));
    localStorage.setItem("collection", JSON.stringify(ids));
    render();
  }));
  document.getElementById("shareReceipt").addEventListener("click", () => {
    const currentRecipient = localStorage.getItem(recipientKey) || "Дорогой человек";
    shareReceipt(selected, currentRecipient);
  });
  document.getElementById("printReceipt").addEventListener("click", () => window.print());
}

function wrapCanvasText(context, text, maxWidth) {
  const words = String(text).split(/\s+/);
  const lines = [];
  let line = "";
  for (const word of words) {
    const next = line ? `${line} ${word}` : word;
    if (line && context.measureText(next).width > maxWidth) {
      lines.push(line);
      line = word;
    } else line = next;
  }
  if (line) lines.push(line);
  return lines;
}

async function makeReceiptImage(selected, recipient) {
  if (document.fonts?.ready) await document.fonts.ready;
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");
  const width = 1000;
  const left = 76;
  const right = width - left;
  const maxWidth = right - left;
  const bodyFont = '22px "Courier New", monospace';
  const rows = selected.map(object => {
    context.font = bodyFont;
    return {
      object,
      lines: wrapCanvasText(context, object.short, maxWidth)
    };
  });
  const rowHeights = rows.map(row => 104 + row.lines.length * 31);
  const height = 570 + rowHeights.reduce((sum, value) => sum + value, 0);
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");

  ctx.fillStyle = "#f8f3e9";
  ctx.fillRect(0, 0, width, height);
  ctx.textAlign = "center";
  ctx.fillStyle = "#432523";
  ctx.font = 'bold 22px "Courier New", monospace';
  ctx.fillText("КАССА «ДАРОМ»", width / 2, 72);
  ctx.fillStyle = "#a43339";
  ctx.font = 'bold 34px "Courier New", monospace';
  ctx.fillText("КУЛЬТУРНЫЙ ЧЕК", width / 2, 124);
  const date = formatDate();
  ctx.fillStyle = "#432523";
  ctx.font = '20px "Courier New", monospace';
  ctx.fillText(`№ ${receiptNumberFor(selected, recipient, date)} · ДЛЯ ${recipient.toLocaleUpperCase("ru-RU")}`, width / 2, 166, maxWidth);
  ctx.fillStyle = "#77716a";
  ctx.font = '17px "Courier New", monospace';
  ctx.fillText(`${date} · КЕМЕРОВСКАЯ ОБЛАСТЬ — КУЗБАСС`, width / 2, 204, maxWidth);

  const rule = y => {
    ctx.save();
    ctx.strokeStyle = "#a43339";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(left, y);
    ctx.lineTo(right, y);
    ctx.stroke();
    ctx.restore();
  };
  rule(230);
  ctx.textAlign = "left";
  ctx.fillStyle = "#432523";
  ctx.font = 'bold 19px "Courier New", monospace';
  ctx.fillText("В ЧЕКЕ:", left, 267);

  let y = 310;
  rows.forEach(({object, lines}, index) => {
    ctx.fillStyle = "#a43339";
    ctx.font = 'bold 23px "Courier New", monospace';
    const titleLines = wrapCanvasText(ctx, `${index + 1}. ${object.name}`, maxWidth - 130);
    titleLines.forEach((line, lineIndex) => ctx.fillText(line, left, y + lineIndex * 29));
    ctx.textAlign = "right";
    ctx.fillStyle = "#a43339";
    ctx.font = 'bold 20px "Courier New", monospace';
    ctx.fillText("ДАРОМ", right, y);
    ctx.textAlign = "left";
    y += titleLines.length * 29 + 26;
    ctx.fillStyle = "#77716a";
    ctx.font = '17px "Courier New", monospace';
    ctx.fillText(`${object.people} · ${object.category}`, left, y);
    y += 28;
    ctx.fillStyle = "#432523";
    ctx.font = bodyFont;
    lines.forEach(line => {
      ctx.fillText(line, left, y);
      y += 31;
    });
    y += 17;
    rule(y - 8);
  });

  const peoples = [...new Set(selected.map(object => object.people))];
  y += 22;
  ctx.fillStyle = "#432523";
  ctx.font = 'bold 20px "Courier New", monospace';
  ctx.textAlign = "left";
  ctx.fillText(`ИТОГО: ${selected.length} ${plural(selected.length,"предмет","предмета","предметов")}`, left, y);
  ctx.textAlign = "right";
  ctx.fillText(`${peoples.length} ${plural(peoples.length,"культура","культуры","культур")}`, right, y);
  y += 58;
  rule(y - 20);
  ctx.textAlign = "left";
  ctx.fillStyle = "#a43339";
  ctx.font = 'bold 29px "Courier New", monospace';
  ctx.fillText("К ОПЛАТЕ", left, y + 20);
  ctx.textAlign = "right";
  ctx.font = 'bold 34px "Courier New", monospace';
  ctx.fillText("0 ₽", right, y + 20);
  y += 70;
  ctx.textAlign = "center";
  ctx.fillStyle = "#77716a";
  ctx.font = '19px "Courier New", monospace';
  ctx.fillText("Культуру нельзя купить — можно только подарить знание.", width / 2, y, maxWidth);
  y += 48;
  rule(y - 15);
  ctx.fillStyle = "#432523";
  ctx.font = 'bold 20px "Courier New", monospace';
  ctx.fillText("СПАСИБО ЗА ВИЗИТ. ДЕЛИСЬ ИСТОРИЯМИ.", width / 2, y + 20, maxWidth);

  return new Promise(resolve => canvas.toBlob(blob => {
    if (!blob) return resolve(null);
    resolve(new File([blob], "kulturnyi-chek.png", {type:"image/png"}));
  }, "image/png"));
}

function downloadReceiptImage(file) {
  const url = URL.createObjectURL(file);
  const link = document.createElement("a");
  link.href = url;
  link.download = file.name;
  link.hidden = true;
  document.body.append(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

async function shareReceipt(selected, recipient) {
  const date = formatDate();
  const shareUrl = new URL("collection.html", location.href);
  shareUrl.searchParams.set("s", encodeSharePayload({ids:selected.map(object => object.id), recipient, date}));
  const peoples = [...new Set(selected.map(object => object.people))];
  const text = `Я собрал(а) этот культурный чек для тебя: выбрал(а) истории, которые напомнили мне о тебе. Открой его и собери свой для друга или близкого.\n\nКультуры: ${peoples.join(", ")}.`;
  const shareText = `${text}\n\n${shareUrl.href}`;
  const copyText = shareText;

  let image = null;
  try { image = await makeReceiptImage(selected, recipient); } catch { /* The interactive link remains shareable. */ }

  if (navigator.share) {
    const payload = {title:`Культурный чек для ${recipient}`, text:shareText};
    if (image && navigator.canShare?.({files:[image]})) payload.files = [image];
    try {
      await navigator.share(payload);
      return;
    } catch (error) {
      if (error.name === "AbortError") return;
    }
  }

  try {
    await navigator.clipboard.writeText(copyText);
    if (image) downloadReceiptImage(image);
    alert(image
      ? "Ссылка-приглашение скопирована, а картинка чека скачана. Отправь их другу вместе."
      : "Ссылка на чек и приглашение скопирована — отправь её другу.");
  } catch {
    if (image) downloadReceiptImage(image);
    alert(copyText);
  }
}

render();
