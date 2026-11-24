(() => {
  const header = document.querySelector("body > .header");
  const nav = header?.querySelector("nav");
  if (!header || !nav || header.querySelector(".mobile-menu-toggle")) return;

  if (!nav.id) nav.id = "siteNavigation";
  const button = document.createElement("button");
  button.type = "button";
  button.className = "mobile-menu-toggle";
  button.setAttribute("aria-label", "Открыть меню");
  button.setAttribute("aria-controls", nav.id);
  button.setAttribute("aria-expanded", "false");
  button.innerHTML = '<span aria-hidden="true"></span><span aria-hidden="true"></span><span aria-hidden="true"></span>';
  header.insertBefore(button, nav);

  const closeMenu = () => {
    header.classList.remove("mobile-nav-open");
    button.setAttribute("aria-expanded", "false");
    button.setAttribute("aria-label", "Открыть меню");
  };

  button.addEventListener("click", () => {
    const isOpen = header.classList.toggle("mobile-nav-open");
    button.setAttribute("aria-expanded", String(isOpen));
    button.setAttribute("aria-label", isOpen ? "Закрыть меню" : "Открыть меню");
  });
  nav.addEventListener("click", event => {
    if (event.target.closest("a")) closeMenu();
  });
  document.addEventListener("click", event => {
    if (!header.contains(event.target)) closeMenu();
  });
  document.addEventListener("keydown", event => {
    if (event.key === "Escape") closeMenu();
  });
  window.addEventListener("resize", () => {
    if (window.matchMedia("(min-width: 701px)").matches) closeMenu();
  });
})();
