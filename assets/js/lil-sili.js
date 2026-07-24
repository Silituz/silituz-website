(function () {
  "use strict";

  const root = document.querySelector("[data-lil-sili]");
  if (!root) return;

  const NEWS_URL = "https://anime-pulse-news.silituz.chatgpt.site";
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

  const rawLanguage = (root.dataset.lang || document.documentElement.lang || "de").toLowerCase();
  const language = rawLanguage.startsWith("en") ? "en" : rawLanguage.startsWith("es") ? "es" : "de";
  const copy = copies[language];
  const prefix = language === "de" ? "" : "/" + language;
  const localPath = (path) => prefix + path;

  const destinations = {
    news: NEWS_URL,
    anime: NEWS_URL + "#anime-manga",
    games: NEWS_URL + "#games",
    calendar: NEWS_URL + "#calendar",
    gallery: localPath("/gallery/"),
    generators: localPath("/generators/"),
    music: localPath("/music/"),
    support: localPath("/support/"),
    socials: localPath("/socials/"),
    about: localPath("/about/")
  };

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
    { key: "about", pattern: /über dich|über sili|about|quién|silituz|wer bist|who are/ },
  ];

  const panel = root.querySelector("#site-lil-sili-panel");
  const trigger = root.querySelector("[data-lil-sili-trigger]");
  const closeButton = root.querySelector("[data-lil-sili-close]");
  const form = root.querySelector("[data-lil-sili-form]");
  const search = root.querySelector("[data-lil-sili-search]");
  const message = root.querySelector("[data-lil-sili-message]");

  function applyCopy() {
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
    search.placeholder = copy.placeholder;
    trigger.setAttribute("aria-label", copy.open);
    closeButton.setAttribute("aria-label", copy.close);
  }

  function setOpen(open) {
    root.classList.toggle("is-open", open);
    root.open = open;
    trigger.setAttribute("aria-expanded", String(open));
    trigger.setAttribute("aria-label", open ? copy.close : copy.open);
    trigger.querySelector("[data-lil-sili-trigger-badge]").textContent = open ? "×" : "?";
    if (open) {
      window.requestAnimationFrame(() => search.focus());
    } else {
      message.textContent = "";
    }
  }

  root.addEventListener("toggle", () => setOpen(Boolean(root.open)));
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
    if (event.key === "Escape" && root.open) {
      setOpen(false);
      trigger.focus();
    }
  });

  document.addEventListener("pointerdown", (event) => {
    if (root.open && !root.contains(event.target)) setOpen(false);
  });

  applyCopy();
  setOpen(Boolean(root.open));
}());
