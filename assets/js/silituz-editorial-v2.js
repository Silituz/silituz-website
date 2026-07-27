(function () {
  "use strict";

  const body = document.body;
  const main = document.querySelector("main");
  if (!body || !main) return;
  body.classList.add("sili-editorial-v2");

  const path = location.pathname.toLowerCase();
  const language = (document.documentElement.lang || "de").toLowerCase().startsWith("en")
    ? "en"
    : (document.documentElement.lang || "de").toLowerCase().startsWith("es")
      ? "es"
      : "de";

  const page = path.includes("/about")
    ? "about"
    : path.includes("/gallery")
      ? "gallery"
      : path.includes("/generators")
        ? "generators"
        : path.includes("/music")
          ? "music"
          : path.includes("/socials")
            ? "socials"
            : path.includes("/support")
              ? "support"
              : path.includes("/shoutout")
                ? "shoutout"
                : path.includes("/contact")
                  ? "contact"
                  : path.includes("/impressum")
                    ? "impressum"
                    : path.includes("/friendsmap")
                      ? "friendsmap"
                      : (path === "/" || path === "/en/" || path === "/es/" || path === "/en" || path === "/es")
                        ? "home"
                        : "inner";

  body.dataset.editorialPage = page;

  function ensurePrimaryNav() {
    const headerInner = document.querySelector("#siteHeader > div");
    const tools = document.querySelector("#siteHeader .sili-header-tools") ||
      document.querySelector("#siteHeader > div > div.flex-1");
    if (!headerInner || !tools) return;
    headerInner.classList.add("sili-header-inner");
    tools.classList.add("sili-header-tools");
    const brand = headerInner.querySelector(":scope > a");
    if (brand) brand.classList.add("sili-brand");
    const menuButton = headerInner.querySelector("#snakeBtn");
    if (menuButton && menuButton.parentElement) menuButton.parentElement.classList.add("sili-menu-wrap");
    if (document.querySelector(".sili-primary-nav")) return;

    const prefix = language === "en" ? "/en" : language === "es" ? "/es" : "";
    const names = language === "en"
      ? ["Home", "News", "Gallery", "Music"]
      : language === "es"
        ? ["Inicio", "News", "Galería", "Música"]
        : ["Home", "News", "Galerie", "Musik"];
    const destinations = [
      prefix + "/",
      "https://anime-pulse-news.silituz.chatgpt.site",
      prefix + "/gallery/",
      prefix + "/music/"
    ];
    const activePages = ["home", "news", "gallery", "music"];
    const nav = document.createElement("nav");
    nav.className = "sili-primary-nav";
    nav.setAttribute("aria-label", language === "en" ? "Quick navigation" : language === "es" ? "Navegación rápida" : "Schnellnavigation");
    destinations.forEach(function (destination, index) {
      const link = document.createElement("a");
      link.href = destination;
      link.textContent = names[index];
      if (index === 1) link.dataset.newsLink = "";
      if (activePages[index] === page) link.setAttribute("aria-current", "page");
      nav.appendChild(link);
    });
    headerInner.insertBefore(nav, tools);
  }

  ensurePrimaryNav();

  const labels = {
    de: {
      home: ["SILITUZ UNIVERSUM", "Entdecke Musik, Visuals, News und kreative Werkzeuge."],
      about: ["ÜBER MICH", "Die Ideen, die Persönlichkeit und die Geschichte hinter Silituz."],
      gallery: ["GALERIE", "Visuelle Welten, Favoriten und ausgewählte Artworks."],
      generators: ["CREATIVE LAB", "Spiele, Generatoren und Werkzeuge zum direkten Ausprobieren."],
      music: ["MUSIK", "Releases, Hörproben und alle Plattformen an einem Ort."],
      socials: ["SOCIALS", "Streams, Musik, Community und kurze Videos auf allen Kanälen."],
      support: ["UNTERSTÜTZUNG", "Hilf dabei, neue Musik, Bilder und Ideen möglich zu machen."],
      shoutout: ["HALL OF LEGENDS", "Menschen, die diese Reise besonders gemacht haben."],
      contact: ["KONTAKT", "Der direkte Kanal für Fragen, Ideen und gemeinsame Projekte."],
      impressum: ["IMPRESSUM", "Transparenz, Verantwortlichkeit und rechtliche Informationen."],
      friendsmap: ["FRIENDS MAP", "Verbindungen, Erinnerungen und gemeinsame Wege."],
      inner: ["SILITUZ", "Ein weiterer Bereich des Silituz-Universums."]
    },
    en: {
      home: ["SILITUZ UNIVERSE", "Discover music, visuals, news and creative tools."],
      about: ["ABOUT", "The ideas, personality and story behind Silituz."],
      gallery: ["GALLERY", "Visual worlds, favorites and selected artworks."],
      generators: ["CREATIVE LAB", "Games, generators and tools ready to try."],
      music: ["MUSIC", "Releases, previews and every platform in one place."],
      socials: ["SOCIALS", "Streams, music, community and short videos everywhere."],
      support: ["SUPPORT", "Help make new music, images and ideas possible."],
      shoutout: ["HALL OF LEGENDS", "The people who made this journey special."],
      contact: ["CONTACT", "The direct channel for questions, ideas and collaborations."],
      impressum: ["IMPRINT", "Transparency, responsibility and legal information."],
      friendsmap: ["FRIENDS MAP", "Connections, memories and shared paths."],
      inner: ["SILITUZ", "Another part of the Silituz universe."]
    },
    es: {
      home: ["UNIVERSO SILITUZ", "Descubre música, imágenes, noticias y herramientas creativas."],
      about: ["SOBRE MÍ", "Las ideas, la personalidad y la historia detrás de Silituz."],
      gallery: ["GALERÍA", "Mundos visuales, favoritos y obras seleccionadas."],
      generators: ["LABORATORIO CREATIVO", "Juegos, generadores y herramientas para probar."],
      music: ["MÚSICA", "Lanzamientos, avances y todas las plataformas en un solo lugar."],
      socials: ["SOCIALS", "Directos, música, comunidad y vídeos cortos en todas partes."],
      support: ["APOYO", "Ayuda a hacer posibles nuevas canciones, imágenes e ideas."],
      shoutout: ["HALL OF LEGENDS", "Las personas que hicieron especial este viaje."],
      contact: ["CONTACTO", "El canal directo para preguntas, ideas y colaboraciones."],
      impressum: ["AVISO LEGAL", "Transparencia, responsabilidad e información legal."],
      friendsmap: ["FRIENDS MAP", "Conexiones, recuerdos y caminos compartidos."],
      inner: ["SILITUZ", "Otra parte del universo Silituz."]
    }
  };

  const pageCopy = (labels[language] && labels[language][page]) || labels.de.inner;
  const pageNumber = {
    home: "01",
    about: "02",
    gallery: "03",
    generators: "04",
    music: "05",
    socials: "06",
    support: "07",
    shoutout: "08",
    contact: "09",
    impressum: "10",
    friendsmap: "11",
    inner: "12"
  }[page] || "12";

  function directImage(section) {
    return Array.from(section.children).find(function (child) {
      return child.tagName === "IMG";
    });
  }

  let hero = main.querySelector(":scope > section");
  const hasVisualHero = hero && directImage(hero);

  if (!hasVisualHero && ["impressum", "friendsmap", "inner"].includes(page)) {
    hero = document.createElement("section");
    hero.innerHTML =
      '<div><div><h1>' + pageCopy[0] + '</h1><p>' + pageCopy[1] + "</p></div></div>";
    hero.className = "sili-generated-editorial-hero";
    main.insertBefore(hero, main.firstChild);
  }

  if (hero && (directImage(hero) || hero.classList.contains("sili-generated-editorial-hero"))) {
    hero.classList.add("sili-editorial-hero");
    hero.dataset.editorialNumber = pageNumber;
    hero.dataset.editorialLabel = pageCopy[0];

    const rail = document.createElement("span");
    rail.className = "sili-editorial-rail";
    rail.setAttribute("aria-hidden", "true");
    rail.textContent = "SILITUZ  /  " + pageCopy[0];
    hero.appendChild(rail);
  }

  const sections = Array.from(main.querySelectorAll(":scope > section")).filter(function (section) {
    return !section.classList.contains("sili-editorial-hero");
  });

  sections.forEach(function (section, index) {
    if (section.querySelector(":scope > .sili-section-index")) return;
    const marker = document.createElement("span");
    marker.className = "sili-section-index";
    marker.setAttribute("aria-hidden", "true");
    marker.textContent = String(index + 2).padStart(2, "0");
    section.appendChild(marker);
  });

  function preferredLanguage() {
    try {
      const saved = localStorage.getItem("silituz-language");
      if (/^(de|en|es)$/.test(saved || "")) return saved;
    } catch (error) {}
    return language;
  }

  function syncNewsLinks() {
    const activeLanguage = preferredLanguage();
    document.querySelectorAll("[data-news-link]").forEach(function (link) {
      const current = new URL(link.href, location.href);
      const hash = current.hash;
      link.href = "https://anime-pulse-news.silituz.chatgpt.site/?lang=" +
        encodeURIComponent(activeLanguage) + hash;
    });
  }

  syncNewsLinks();
  document.addEventListener("silituz:languagechange", syncNewsLinks);

  const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
  if (hero && !reducedMotion.matches) {
    let scheduled = false;
    const updateHero = function () {
      if (scheduled) return;
      scheduled = true;
      requestAnimationFrame(function () {
        const rect = hero.getBoundingClientRect();
        const progress = Math.min(1, Math.max(0, -rect.top / Math.max(1, rect.height)));
        hero.style.setProperty("--editorial-hero-y", (progress * 22).toFixed(2) + "px");
        scheduled = false;
      });
    };
    addEventListener("scroll", updateHero, { passive: true });
    addEventListener("resize", updateHero);
    updateHero();
  }

  const hoverCards = main.querySelectorAll(
    ".silituz-now__card, .sili-feature-card, main a[class*='rounded-2xl']"
  );
  hoverCards.forEach(function (card) {
    card.addEventListener("pointermove", function (event) {
      const rect = card.getBoundingClientRect();
      card.style.setProperty("--editorial-pointer-x", ((event.clientX - rect.left) / rect.width * 100).toFixed(1) + "%");
      card.style.setProperty("--editorial-pointer-y", ((event.clientY - rect.top) / rect.height * 100).toFixed(1) + "%");
    }, { passive: true });
  });

  document.documentElement.classList.add("sili-editorial-ready");
}());
