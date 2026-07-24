(function () {
  "use strict";

  const path = location.pathname.toLowerCase();
  const html = document.documentElement;
  const page = path.includes("/music") ? "music" : path.includes("/gallery") ? "gallery" : path.includes("/support") ? "support" : path.includes("/generators") ? "generators" : (path === "/" || /^\/(en|es)\/?$/.test(path)) ? "home" : "inner";
  document.body.classList.add("page-" + page);

  const progress = document.createElement("div");
  progress.className = "sili-scroll-progress";
  progress.setAttribute("aria-hidden", "true");
  document.body.appendChild(progress);
  const updateProgress = function () {
    const max = Math.max(1, document.documentElement.scrollHeight - innerHeight);
    progress.style.width = Math.min(100, Math.max(0, scrollY / max * 100)) + "%";
  };
  addEventListener("scroll", updateProgress, { passive: true });
  addEventListener("resize", updateProgress);
  updateProgress();

  const revealTargets = document.querySelectorAll("main section, .release-card, [data-gallery] img");
  if ("IntersectionObserver" in window && !matchMedia("(prefers-reduced-motion: reduce)").matches) {
    const observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: .08, rootMargin: "0px 0px -40px" });
    revealTargets.forEach(function (el) { el.classList.add("sili-reveal"); observer.observe(el); });
  } else {
    revealTargets.forEach(function (el) { el.classList.add("is-visible"); });
  }

  document.querySelectorAll("[data-sili-countdown]").forEach(function (counter) {
    const target = new Date(counter.dataset.siliCountdown);
    function tick() {
      const diff = Math.max(0, target - new Date());
      const days = Math.floor(diff / 86400000);
      const hours = Math.floor(diff / 3600000) % 24;
      const mins = Math.floor(diff / 60000) % 60;
      const values = counter.querySelectorAll("b");
      if (values[0]) values[0].textContent = String(days).padStart(2, "0");
      if (values[1]) values[1].textContent = String(hours).padStart(2, "0");
      if (values[2]) values[2].textContent = String(mins).padStart(2, "0");
      counter.dataset.finished = String(diff === 0);
    }
    tick();
    setInterval(tick, 60000);
  });

  const language = (function () {
    try {
      const saved = localStorage.getItem("silituz-language");
      if (/^(de|en|es)$/.test(saved || "")) return saved;
    } catch (error) {}
    const raw = (html.lang || "de").toLowerCase();
    return raw.startsWith("en") ? "en" : raw.startsWith("es") ? "es" : "de";
  }());

  const installCopy = {
    de: ["SILITUZ installieren", "Wie eine App öffnen"],
    en: ["Install SILITUZ", "Open like an app"],
    es: ["Instalar SILITUZ", "Abrir como app"]
  };
  let installPrompt;
  const installButton = document.createElement("button");
  installButton.type = "button";
  installButton.className = "sili-install";
  installButton.innerHTML = "<span aria-hidden=\"true\">＋</span><strong>" + installCopy[language][0] + "</strong>";
  installButton.title = installCopy[language][1];
  document.body.appendChild(installButton);
  addEventListener("beforeinstallprompt", function (event) {
    event.preventDefault();
    installPrompt = event;
    installButton.classList.add("is-ready");
  });
  installButton.addEventListener("click", async function () {
    if (!installPrompt) return;
    installPrompt.prompt();
    await installPrompt.userChoice;
    installPrompt = null;
    installButton.classList.remove("is-ready");
  });
  addEventListener("appinstalled", function () { installButton.classList.remove("is-ready"); });
  if ("serviceWorker" in navigator) addEventListener("load", function () {
    navigator.serviceWorker.register("/service-worker.js").catch(function () {});
  });

  function enhanceLilSili() {
    const root = document.querySelector("[data-lil-sili]");
    if (!root) return;
    const intro = root.querySelector(".site-lil-sili__intro");
    const actions = root.querySelector(".site-lil-sili__actions");
    if (!intro || !actions) return;
    const copy = {
      de: {
        home: ["HIER AUF DER STARTSEITE", "Ich kann dich zu News, Musik, Bildern oder Unterstützung führen."],
        music: ["PASSEND ZUR MUSIKSEITE", "Frag mich nach Releases, Spotify, YouTube oder anderen Plattformen."],
        gallery: ["PASSEND ZUR GALERIE", "Öffne ein Bild oder lass dir mit „Überrasch mich“ eines auswählen."],
        support: ["PASSEND ZUR UNTERSTÜTZUNG", "Ich zeige dir direkt, wie du Silituz helfen kannst."],
        generators: ["PASSEND ZU DEN TOOLS", "Sag mir, welches Werkzeug oder welchen Generator du suchst."],
        inner: ["PASSEND ZU DIESER SEITE", "Ich bringe dich schnell zu den wichtigsten Bereichen."]
      },
      en: {
        home: ["HERE ON THE HOME PAGE", "I can guide you to news, music, images or support."],
        music: ["FOR THE MUSIC PAGE", "Ask me about releases, Spotify, YouTube or other platforms."],
        gallery: ["FOR THE GALLERY", "Open an image or let “Surprise me” choose one for you."],
        support: ["FOR SUPPORT", "I’ll show you the quickest ways to support Silituz."],
        generators: ["FOR THE TOOLS", "Tell me which tool or generator you are looking for."],
        inner: ["FOR THIS PAGE", "I can guide you to the most important areas."]
      },
      es: {
        home: ["AQUÍ EN EL INICIO", "Puedo llevarte a noticias, música, imágenes o apoyo."],
        music: ["PARA LA PÁGINA DE MÚSICA", "Pregúntame por lanzamientos, Spotify, YouTube u otras plataformas."],
        gallery: ["PARA LA GALERÍA", "Abre una imagen o deja que «Sorpréndeme» elija una."],
        support: ["PARA APOYAR", "Te muestro rápidamente cómo apoyar a Silituz."],
        generators: ["PARA LAS HERRAMIENTAS", "Dime qué herramienta o generador buscas."],
        inner: ["PARA ESTA PÁGINA", "Te llevo rápidamente a las áreas importantes."]
      }
    };
    const box = document.createElement("div");
    box.className = "site-lil-sili__context";
    function renderContext(contextLanguage) {
      const activeLanguage = copy[contextLanguage] ? contextLanguage : "en";
      box.innerHTML = "<strong>" + copy[activeLanguage][page][0] + "</strong><span>" + copy[activeLanguage][page][1] + "</span>";
    }
    renderContext(root.classList.contains("is-choosing-language") ? "en" : language);
    document.addEventListener("silituz:languagechange", function (event) {
      renderContext(event.detail && event.detail.language ? event.detail.language : language);
    });
    intro.insertAdjacentElement("afterend", box);
    const preferred = actions.querySelector('[data-lil-sili-route="' + (page === "gallery" ? "gallery" : page === "music" ? "music" : page === "support" ? "support" : "news") + '"]');
    if (preferred) actions.prepend(preferred);
  }
  enhanceLilSili();

  function enhanceGallery() {
    const gallery = document.querySelector('[data-gallery="silituz"]');
    if (!gallery) return;
    const gallerySection = gallery.closest("section");
    const labels = {
      de: ["Alle", "Favoriten", "Überrasch mich"],
      en: ["All", "Favorites", "Surprise me"],
      es: ["Todo", "Favoritos", "Sorpréndeme"]
    }[language];
    const tools = document.createElement("div");
    tools.className = "sili-gallery-tools";
    tools.innerHTML = '<button type="button" class="is-active" data-gallery-filter="all">' + labels[0] + '</button>' +
      '<button type="button" data-gallery-filter="favorites">♡ ' + labels[1] + '</button>' +
      '<button type="button" data-gallery-surprise>✦ ' + labels[2] + '</button>';
    gallery.parentElement.insertBefore(tools, gallery);
    let favorites = [];
    try { favorites = JSON.parse(localStorage.getItem("silituz-gallery-favorites") || "[]"); } catch (error) {}
    const images = Array.from(gallery.querySelectorAll("img"));
    images.forEach(function (image, index) {
      const wrapper = document.createElement("div");
      wrapper.className = "sili-gallery-item";
      image.parentNode.insertBefore(wrapper, image);
      wrapper.appendChild(image);
      const button = document.createElement("button");
      button.type = "button";
      button.className = "sili-favorite" + (favorites.includes(image.src) ? " is-saved" : "");
      button.setAttribute("aria-label", labels[1]);
      button.textContent = favorites.includes(image.src) ? "♥" : "♡";
      button.addEventListener("click", function (event) {
        event.stopPropagation();
        const saved = button.classList.toggle("is-saved");
        button.textContent = saved ? "♥" : "♡";
        favorites = saved ? Array.from(new Set(favorites.concat(image.src))) : favorites.filter(function (src) { return src !== image.src; });
        try { localStorage.setItem("silituz-gallery-favorites", JSON.stringify(favorites)); } catch (error) {}
      });
      wrapper.appendChild(button);
      wrapper.dataset.index = index;
    });
    tools.addEventListener("click", function (event) {
      const filter = event.target.closest("[data-gallery-filter]");
      const surprise = event.target.closest("[data-gallery-surprise]");
      if (filter) {
        tools.querySelectorAll("[data-gallery-filter]").forEach(function (button) { button.classList.toggle("is-active", button === filter); });
        gallery.querySelectorAll(".sili-gallery-item").forEach(function (item) {
          const isFavorite = item.querySelector(".sili-favorite").classList.contains("is-saved");
          item.classList.toggle("is-hidden", filter.dataset.galleryFilter === "favorites" && !isFavorite);
        });
      }
      if (surprise && images.length) images[Math.floor(Math.random() * images.length)].click();
    });
    if (gallerySection) gallerySection.id = "gallery-artworks";
    const lightbox = document.getElementById("lightbox");
    if (lightbox) {
      const info = document.createElement("div");
      info.className = "sili-lightbox-info";
      info.innerHTML = "<strong></strong><span></span>";
      lightbox.appendChild(info);
      function updateInfo(index) {
        const image = images[index];
        if (!image) return;
        info.querySelector("strong").textContent = image.alt || (language === "de" ? "Silituz Artwork" : "Silituz artwork");
        info.querySelector("span").textContent = String(index + 1).padStart(2, "0") + " / " + String(images.length).padStart(2, "0");
      }
      images.forEach(function (image, index) {
        image.addEventListener("click", function () { updateInfo(index); });
        image.addEventListener("keydown", function (event) {
          if (event.key === "Enter" || event.key === " ") updateInfo(index);
        });
      });
      const previous = document.getElementById("lightboxPrev");
      const next = document.getElementById("lightboxNext");
      if (previous) previous.addEventListener("click", function () {
        const current = images.findIndex(function (image) { return image.src === document.getElementById("lightboxImg").src; });
        updateInfo((current - 1 + images.length) % images.length);
      });
      if (next) next.addEventListener("click", function () {
        const current = images.findIndex(function (image) { return image.src === document.getElementById("lightboxImg").src; });
        updateInfo((current + 1) % images.length);
      });
    }
  }
  enhanceGallery();

  if (page === "music" && !document.querySelector(".sili-release-focus")) {
    const firstSection = document.querySelector("main section");
    if (firstSection) {
      const section = document.createElement("section");
      section.className = "sili-release-focus";
      section.id = "release-focus";
      const title = language === "es" ? "Tu centro de música Silituz" : language === "en" ? "Your Silituz music center" : "Deine Silituz Musik-Zentrale";
      const description = language === "es" ? "Lanzamientos, avances y todas las plataformas en un solo lugar." : language === "en" ? "Releases, previews and every platform in one place." : "Releases, Hörproben und alle Plattformen an einem Ort.";
      const platform = language === "es" ? "Todas las plataformas" : language === "en" ? "All platforms" : "Alle Plattformen";
      section.innerHTML = '<div class="sili-release-focus__card sili-glass"><div class="sili-release-focus__art" role="img" aria-label="Silituz Music"></div><div class="sili-release-focus__copy"><span class="sili-kicker">RELEASE CENTER</span><h2 class="sili-gradient-text">' + title + '</h2><p>' + description + '</p><div class="sili-release-focus__actions"><a class="sili-btn sili-btn--primary" href="https://open.spotify.com/intl-de/artist/0l3OqhrDQ7No2fPCIP0i5h" target="_blank" rel="noopener">Spotify</a><a class="sili-btn" href="#music-platforms">' + platform + ' ↓</a></div></div></div>';
      firstSection.insertAdjacentElement("afterend", section);
    }
  }

  document.querySelectorAll("[data-sili-release-notify]").forEach(function (button) {
    button.addEventListener("click", async function () {
      const messages = {
        de: ["Release gemerkt", "Ich habe den Release auf diesem Gerät gespeichert."],
        en: ["Release saved", "I saved this release on this device."],
        es: ["Lanzamiento guardado", "He guardado este lanzamiento en este dispositivo."]
      }[language];
      try {
        localStorage.setItem("silituz-release-reminder", JSON.stringify({ title: button.dataset.title, date: button.dataset.date }));
      } catch (error) {}
      button.textContent = "✓ " + messages[0];
      if ("Notification" in window && Notification.permission === "default") {
        const permission = await Notification.requestPermission();
        if (permission === "granted") new Notification(messages[0], { body: messages[1], icon: "/assets/images/favicon-192.png" });
      } else if ("Notification" in window && Notification.permission === "granted") {
        new Notification(messages[0], { body: messages[1], icon: "/assets/images/favicon-192.png" });
      }
    });
  });
}());