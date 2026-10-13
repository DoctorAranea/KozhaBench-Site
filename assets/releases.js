// Выпуски с GitHub прямо в браузере посетителя: страница "Что нового" и версия в кнопках "Скачать".
// Описание выпуска GitHub отдаёт готовым HTML (и сам вычищает из него опасное): русский список, черта, английский.
// Страница показывает часть на своём языке. Ответ на несколько минут запоминается во вкладке, чтобы не тратить
// предел GitHub - 60 запросов в час с одного адреса.
(function () {
  var api = "https://api.github.com/repos/DoctorAranea/LeatherDraft-Releases/releases";
  var cacheMinutes = 10;
  var lang = document.documentElement.lang === "en" ? "en" : "ru";

  var text = {
    ru: { version: "Версия", dated: " от " },
    en: { version: "Version", dated: ", " },
  }[lang];

  function cached(key) {
    try {
      var item = JSON.parse(sessionStorage.getItem(key) || "null");
      return item && Date.now() - item.at < cacheMinutes * 60000 ? item.data : null;
    } catch (e) {
      return null;
    }
  }

  function remember(key, data) {
    try {
      sessionStorage.setItem(key, JSON.stringify({ at: Date.now(), data: data }));
    } catch (e) {
      // Без хранилища просто спросим GitHub ещё раз.
    }
  }

  function load(url) {
    var hit = cached(url);
    if (hit)
      return Promise.resolve(hit);

    return fetch(url, { headers: { Accept: "application/vnd.github.html+json" } }).then(function (response) {
      if (!response.ok)
        throw new Error(response.status);
      return response.json();
    }).then(function (data) {
      remember(url, data);
      return data;
    });
  }

  // Часть описания на языке страницы: до черты - по-русски, после - по-английски. Без черты - всё описание.
  function part(release) {
    var html = release.body_html || "";
    var cut = html.search(/<hr\s*\/?>/i);
    if (cut < 0)
      return html;
    return lang === "en" ? html.slice(html.indexOf(">", cut) + 1) : html.slice(0, cut);
  }

  function title(release) {
    var date = new Date(release.published_at).toLocaleDateString(lang === "en" ? "en-GB" : "ru-RU", { day: "numeric", month: "long", year: "numeric" });
    return text.version + " " + release.tag_name.replace(/^v/, "") + text.dated + date;
  }

  function show(id) {
    var element = document.getElementById(id);
    if (element)
      element.hidden = false;
    return element;
  }

  // Страница "Что нового": все выпуски по порядку, новые сверху. Кнопка "Скачать" встаёт сразу под последней
  // версией, а если список не загрузился - остаётся внизу страницы.
  function fillHistory(list) {
    load(api + "?per_page=50").then(function (releases) {
      list.innerHTML = "";
      releases.filter(function (release) { return !release.draft && !release.prerelease; }).forEach(function (release) {
        var article = document.createElement("article");
        article.className = "release";
        var heading = document.createElement("h3");
        var link = document.createElement("a");
        link.href = release.html_url;
        link.textContent = title(release);
        heading.appendChild(link);
        var body = document.createElement("div");
        body.className = "release-body";
        body.innerHTML = part(release);
        article.appendChild(heading);
        article.appendChild(body);
        list.appendChild(article);
      });

      var download = document.getElementById("download-latest");
      if (download && list.firstChild) {
        download.removeAttribute("style");
        download.classList.add("after-latest");
        list.insertBefore(download, list.firstChild.nextSibling);
      }
    }).catch(function () {
      list.innerHTML = "";
      show("releases-failed");
    });
  }

  // В кнопках "Скачать" - номер и дата последней версии мелким шрифтом, в разделе "Скачать" - первые пункты её списка.
  function fillLatest() {
    load(api + "/latest").then(function (release) {
      Array.prototype.forEach.call(document.querySelectorAll("[data-latest-version]"), function (element) {
        element.textContent = title(release);
        element.hidden = false;
      });

      var highlights = document.getElementById("latest-highlights");
      if (!highlights)
        return;

      var holder = document.createElement("div");
      holder.innerHTML = part(release);
      var items = Array.prototype.slice.call(holder.querySelectorAll("li"), 0, 3);
      if (items.length === 0)
        return;

      var list = document.createElement("ul");
      items.forEach(function (item) { list.appendChild(item); });
      highlights.querySelector(".highlights-list").appendChild(list);
      highlights.querySelector(".highlights-title").textContent = title(release);
      highlights.hidden = false;
    }).catch(function () {
      // Без сведений о версии кнопка "Скачать" работает как раньше.
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    var history = document.getElementById("releases");
    if (history)
      fillHistory(history);
    if (document.querySelector("[data-latest-version]") || document.getElementById("latest-highlights"))
      fillLatest();
  });
})();
