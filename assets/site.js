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

// Ссылка с data-copy копирует свой текст: у многих не настроена почтовая программа, и mailto молча ничего не
// открывает. Сама ссылка при этом срабатывает как обычно, а подпись на пару секунд сообщает, что адрес скопирован.
(function () {
  function copy(text) {
    if (navigator.clipboard && window.isSecureContext)
      return navigator.clipboard.writeText(text);

    var field = document.createElement("textarea");
    field.value = text;
    field.style.position = "fixed";
    field.style.opacity = "0";
    document.body.appendChild(field);
    field.select();
    var copied = false;
    try {
      copied = document.execCommand("copy");
    } catch (e) {
      copied = false;
    }
    document.body.removeChild(field);
    return copied ? Promise.resolve() : Promise.reject();
  }

  document.addEventListener("DOMContentLoaded", function () {
    document.querySelectorAll("[data-copy]").forEach(function (link) {
      var label = link.querySelector("small");
      var text = label ? label.textContent : "";
      var timer = 0;
      link.addEventListener("click", function () {
        copy(link.getAttribute("data-copy")).then(function () {
          if (!label)
            return;
          label.textContent = link.getAttribute("data-copied");
          clearTimeout(timer);
          timer = setTimeout(function () { label.textContent = text; }, 2500);
        }, function () {
          // Не скопировалось - адрес и так виден на кнопке.
        });
      });
    });
  });
})();
