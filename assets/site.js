// Переключатель темы: по умолчанию - как в системе, выбранная вручную запоминается в браузере.
(function () {
  var root = document.documentElement;

  function saved() {
    try {
      return localStorage.getItem("theme");
    } catch (e) {
      return null;
    }
  }

  function current() {
    return root.getAttribute("data-theme")
      || (window.matchMedia && window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark");
  }

  var theme = saved();
  if (theme === "light" || theme === "dark")
    root.setAttribute("data-theme", theme);

  document.addEventListener("DOMContentLoaded", function () {
    var button = document.getElementById("theme");
    if (!button)
      return;

    button.addEventListener("click", function () {
      var next = current() === "dark" ? "light" : "dark";
      root.setAttribute("data-theme", next);
      try {
        localStorage.setItem("theme", next);
      } catch (e) {
        // Без хранилища выбор просто не запомнится.
      }
    });
  });
})();
