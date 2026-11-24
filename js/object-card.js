function escapeObjectCardText(value) {
  return String(value ?? "").replace(/[&<>"']/g, char => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  }[char]));
}

function renderCultureObjectCard(object, options = {}) {
  const detail = Boolean(options.detail);
  const heading = detail ? "h1" : "h2";
  const link = `item.html?id=${encodeURIComponent(object.id)}`;
  const name = escapeObjectCardText(object.name);
  const image = object.image
    ? `<img src="${escapeObjectCardText(object.image)}" alt="${name}" loading="lazy">`
    : `<span class="culture-object-placeholder" aria-hidden="true">${escapeObjectCardText(object.people?.[0] || "Д")}</span>`;
  const imageContent = detail
    ? image
    : `<a href="${link}" aria-label="Открыть историю предмета: ${name}">${image}</a>`;
  const facts = (object.cardFacts || []).slice(0, 2).map(fact =>
    `<p class="culture-object-fact"><strong>${escapeObjectCardText(fact.label)}:</strong> <span>${escapeObjectCardText(fact.value)}</span></p>`
  ).join("");

  return `<article class="culture-object-card${name.length > 22 ? " is-long-title" : ""}${detail ? " is-detail-card" : ""}">
    <div class="culture-object-poster-top">
      <${heading} class="culture-object-title">${detail ? name : `<a href="${link}">${name}</a>`}</${heading}>
      <div class="culture-object-photo">${imageContent}</div>
    </div>
    <div class="culture-object-perforation" aria-hidden="true"><span></span><i></i><b></b></div>
    <div class="culture-object-poster-bottom">
      <div class="culture-object-facts">${facts}</div>
      ${detail ? "" : `<a class="culture-object-story-link" href="${link}">История предмета <span aria-hidden="true">↗</span></a>`}
    </div>
  </article>`;
}
