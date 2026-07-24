(function () {
  "use strict";

  const root = document.querySelector("[data-lil-sili]");
  if (!root) return;

  const NEWS_URL = "https://anime-pulse-news.silituz.chatgpt.site";
  const languageApi = window.SilituzLanguage || {
    stored: function () {
      try {
        const value = localStorage.getItem("silituz-language");
        return /^(de|en|es)$/.test(value || "") ? value : null;
      } catch (error) {
        return null;
      }
    },
    preferred: function () {
      const stored = this.stored();
      if (stored) return stored;
      const raw = (root.dataset.lilSiliLang || document.documentElement.lang || "de").toLowerCase();
      return raw.startsWith("en") ? "en" : raw.startsWith("es") ? "es" : "de";
    },
    buildPath: function (language, path) {
      const clean = path.replace(/^\/(?:en|de|es)(?:\/|$)/i, "/");
      if (language === "en") return "/en" + (clean === "/" ? "/" : clean);
      if (language === "es") return "/es" + (clean === "/" ? "/" : clean);
      return clean;
    },
    newsHref: function (language, hash) {
      return NEWS_URL + "?lang=" + encodeURIComponent(language) + (hash || "");
    },
    select: function (language) {
      try { localStorage.setItem("silituz-language", language); } catch (error) {}
    }
  };

  const copies = {
    de: {
      open: "Lil Sili öffnen",
      close: "Lil Sili schließen",
      badge: "BEREIT ZU HELFEN",
      panelBadge: "SILITUZ GUIDE",
      title: "Hey, ich bin Lil Sili!",
      intro: "Was möchtest du entdecken? Ich bringe dich direkt dorthin.",
      searchLabel: "Frage oder Suchbegriff",
      placeholder: "z. B. News, Bilder, Musik, Hilfe …",
      search: "Los",
      notFound: "Dazu habe ich noch keinen direkten Weg. Probiere News, Bilder, Generatoren, Musik, Socials oder Unterstützung.",
      labels: {
        news: "SILITUZ NEWS",
        gallery: "Bilder & Videos",
        generators: "Generatoren & mehr",
        music: "Musik",
        support: "Silituz unterstützen",
        socials: "Socials"
      }
    },
    en: {
      open: "Open Lil Sili",
      close: "Close Lil Sili",
      badge: "READY TO HELP",
      panelBadge: "SILITUZ GUIDE",
      title: "Hey, I’m Lil Sili!",
      intro: "What would you like to discover? I’ll take you straight there.",
      searchLabel: "Question or search term",
      placeholder: "e.g. news, images, music, help …",
      search: "Go",
      notFound: "I do not have a direct route for that yet. Try news, images, generators, music, socials or support.",
      labels: {
        news: "SILITUZ NEWS",
        gallery: "Images & videos",
        generators: "Generators & more",
        music: "Music",
        support: "Support Silituz",
        socials: "Socials"
      }
    },
    es: {
      open: "Abrir Lil Sili",
      close: "Cerrar Lil Sili",
      badge: "LISTO PARA AYUDAR",
      panelBadge: "GUÍA SILITUZ",
      title: "¡Hola, soy Lil Sili!",
      intro: "¿Qué quieres descubrir? Te llevo directamente.",
      searchLabel: "Pregunta o término de búsqueda",
      placeholder: "p. ej. noticias, imágenes, música, ayuda …",
      search: "Ir",
      notFound: "Todavía no tengo una ruta directa. Prueba noticias, imágenes, generadores, música, socials o apoyo.",
      labels: {
        news: "SILITUZ NEWS",
        gallery: "Imágenes y videos",
        generators: "Generadores y más",
        music: "Música",
        support: "Apoyar a Silituz",
        socials: "Socials"
      }
    }
  };

  let language = languageApi.preferred();
  let copy = copies[language] || copies.de;
  let needsLanguageChoice = !languageApi.stored();
  let destinations = {};

  const routes = [
    { key: "support", pattern: /unterstüt|hilfe|help|support|donat|spend|apoy|ayud/ },
    { key: "calendar", pattern: /kalender|calendar|calendario|termin|release|fecha/ },
    { key: "anime", pattern: /anime|manga/ },
    { key: "games", pattern: /games?|spiel|videojuego|playstation|xbox|nintendo|steam|smartphone/ },
    { key: "gallery", pattern: /bild|foto|image|photo|galer|video|visual|imagen/ },
    { key: "generators", pattern: /generator|generador|tool|werkzeug|edit|creator/ },
    { key: "music", pattern: /musik|music|música|song|lied|spotify|apple music|k-?pop|j-?pop|rock|metal|konzert|concert|tour/ },
    { key: "socials", pattern: /social|instagram|tiktok|youtube|discord|twitch/ },
    { key: "news", pattern: /news|nachricht|noticia|aktuell|latest/ },
    { key: "about", pattern: /über dich|über sili|about|quién|silituz|wer bist|who are/ }
  ];

  const panel = root.querySelector("#site-lil-sili-panel");
  const trigger = root.querySelector("[data-lil-sili-trigger]");
  const closeButton = root.querySelector("[data-lil-sili-close]");
  const form = root.querySelector("[data-lil-sili-form]");
  const search = root.querySelector("[data-lil-sili-search]");
  const message = root.querySelector("[data-lil-sili-message]");
  const languageButtons = root.querySelectorAll("[data-lil-sili-language]");

  function buildDestinations() {
    const localPath = function (path) {
      return languageApi.buildPath(language, path);
    };
    destinations = {
      news: languageApi.newsHref(language, ""),
      anime: languageApi.newsHref(language, "#anime-manga"),
      games: languageApi.newsHref(language, "#games"),
      calendar: languageApi.newsHref(language, "#calendar"),
      gallery: localPath("/gallery/"),
      generators: localPath("/generators/"),
      music: localPath("/music/"),
      support: localPath("/support/"),
      socials: localPath("/socials/"),
      about: localPath("/about/")
    };
  }

  function applyCopy() {
    root.classList.toggle("is-choosing-language", needsLanguageChoice);
    root.querySelectorAll("[data-lil-sili-copy]").forEach((element) => {
      const key = element.dataset.lilSiliCopy;
      if (copy[key]) element.textContent = copy[key];
    });
    root.querySelectorAll("[data-lil-sili-label]").forEach((element) => {
      const key = element.dataset.lilSiliLabel;
      if (copy.labels[key]) element.textContent = copy.labels[key];
    });
    root.querySelectorAll("[data-lil-sili-route]").forEach((link) => {
      const key = link.dataset.lilSiliRoute;
      if (destinations[key]) link.href = destinations[key];
    });

    if (needsLanguageChoice) {
      root.querySelector('[data-lil-sili-copy="badge"]').textContent = "CHOOSE YOUR LANGUAGE";
      root.querySelector('[data-lil-sili-copy="panelBadge"]').textContent = "WELCOME";
      root.querySelector('[data-lil-sili-copy="title"]').textContent = "Hi, I’m Lil Sili!";
      root.querySelector('[data-lil-sili-copy="intro"]').textContent = "Which language should I speak with you?";
    }

    languageButtons.forEach((button) => {
      const selected = !needsLanguageChoice && button.dataset.lilSiliLanguage === language;
      button.classList.toggle("is-selected", selected);
      button.setAttribute("aria-pressed", String(selected));
    });

    search.placeholder = copy.placeholder;
    trigger.setAttribute("aria-label", needsLanguageChoice ? "Open Lil Sili language selection" : copy.open);
    closeButton.setAttribute("aria-label", needsLanguageChoice ? "Close language selection" : copy.close);
  }

  function updateLanguage(nextLanguage) {
    if (!copies[nextLanguage]) return;
    language = nextLanguage;
    copy = copies[language];
    needsLanguageChoice = false;
    buildDestinations();
    applyCopy();
  }

  let isOpen = false;

  function setOpen(open) {
    isOpen = Boolean(open);
    root.classList.toggle("is-open", isOpen);
    panel.hidden = !isOpen;
    trigger.setAttribute("aria-expanded", String(isOpen));
    trigger.setAttribute(
      "aria-label",
      needsLanguageChoice
        ? (isOpen ? "Close Lil Sili language selection" : "Open Lil Sili language selection")
        : (isOpen ? copy.close : copy.open)
    );
    trigger.querySelector("[data-lil-sili-trigger-badge]").textContent = isOpen ? "×" : "?";
    if (isOpen && !needsLanguageChoice) {
      window.requestAnimationFrame(() => search.focus());
    } else if (!isOpen) {
      message.textContent = "";
    }
  }

  languageButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const nextLanguage = button.dataset.lilSiliLanguage;
      if (!copies[nextLanguage]) return;
      updateLanguage(nextLanguage);
      languageApi.select(nextLanguage, false);
    });
  });

  document.addEventListener("silituz:languagechange", (event) => {
    const nextLanguage = event.detail && event.detail.language;
    if (!copies[nextLanguage]) return;
    updateLanguage(nextLanguage);
  });

  trigger.addEventListener("click", (event) => {
    event.preventDefault();
    setOpen(!isOpen);
  });

  closeButton.addEventListener("click", () => {
    setOpen(false);
    trigger.focus();
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const query = search.value.trim().toLowerCase();
    const match = routes.find((route) => route.pattern.test(query));

    if (!match) {
      message.textContent = copy.notFound;
      return;
    }

    message.textContent = "";
    window.location.assign(destinations[match.key]);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && isOpen) {
      setOpen(false);
      trigger.focus();
    }
  });

  document.addEventListener("pointerdown", (event) => {
    if (isOpen && !root.contains(event.target)) setOpen(false);
  });

  buildDestinations();
  applyCopy();
  setOpen(needsLanguageChoice);
}());
