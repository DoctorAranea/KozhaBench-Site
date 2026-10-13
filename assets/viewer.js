// Просмотр снимков поверх страницы: щелчок по снимку открывает его во весь экран в этой же вкладке,
// щелчок, крестик или Esc закрывают, и посетитель остаётся на том же месте страницы.
// Без JavaScript ссылка на снимок работает как обычно.
(function () {
  var english = document.documentElement.lang === "en";
  var closeText = english ? "Close [Esc]" : "Закрыть [Esc]";
  var viewer;
  var picture;
  var caption;
  var opener;

  function build() {
    viewer = document.createElement("div");
    viewer.className = "viewer";
    viewer.hidden = true;
    viewer.setAttribute("role", "dialog");
    viewer.setAttribute("aria-modal", "true");

    var close = document.createElement("button");
    close.className = "viewer-close";
    close.type = "button";
    close.title = closeText;
    close.setAttribute("aria-label", closeText);
    close.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>';

    picture = document.createElement("img");
    caption = document.createElement("p");
    caption.className = "viewer-caption";

    viewer.appendChild(close);
    viewer.appendChild(picture);
    viewer.appendChild(caption);
    document.body.appendChild(viewer);

    viewer.addEventListener("click", hide);
  }

  function show(link) {
    if (!viewer)
      build();
    opener = link;
    var image = link.querySelector("img");
    picture.src = link.getAttribute("href");
    picture.alt = image ? image.alt : "";
    var figure = link.closest("figure");
    var text = figure && figure.querySelector("figcaption");
    caption.textContent = text ? text.textContent : "";
    caption.hidden = !caption.textContent;
    viewer.hidden = false;
    document.body.classList.add("viewer-open");
    viewer.querySelector(".viewer-close").focus();
  }

  function hide() {
    if (!viewer || viewer.hidden)
      return;
    viewer.hidden = true;
    picture.removeAttribute("src");
    document.body.classList.remove("viewer-open");
    if (opener)
      opener.focus();
  }

  document.addEventListener("click", function (event) {
    var link = event.target.closest && event.target.closest("a.shot");
    if (!link || event.ctrlKey || event.shiftKey || event.metaKey || event.button !== 0)
      return;
    event.preventDefault();
    show(link);
  });

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape")
      hide();
  });
})();
