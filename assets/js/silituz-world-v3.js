(function () {
  "use strict";

  const body = document.body;
  const main = document.querySelector("main#content");
  if (!body || !main) return;

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
                    : path.includes("/friendsmap") || path.includes("/organizer")
                      ? "friendsmap"
                      : (path === "/" || path === "/en/" || path === "/es/" || path === "/en" || path === "/es")
                        ? "home"
                        : "inner";

  const copy = {
    de: {
      home: "SILITUZ UNIVERSUM",
      about: "ÜBER MICH",
      gallery: "GALERIE",
      generators: "CREATIVE LAB",
      music: "MUSIK",
      socials: "SOCIALS",
      support: "UNTERSTÜTZUNG",
      shoutout: "HALL OF LEGENDS",
      contact: "KONTAKT",
      impressum: "IMPRESSUM",
      friendsmap: "FRIENDS MAP",
      inner: "SILITUZ"
    },
    en: {
      home: "SILITUZ UNIVERSE",
      about: "ABOUT",
      gallery: "GALLERY",
      generators: "CREATIVE LAB",
      music: "MUSIC",
      socials: "SOCIALS",
      support: "SUPPORT",
      shoutout: "HALL OF LEGENDS",
      contact: "CONTACT",
      impressum: "IMPRINT",
      friendsmap: "FRIENDS MAP",
      inner: "SILITUZ"
    },
    es: {
      home: "UNIVERSO SILITUZ",
      about: "SOBRE MÍ",
      gallery: "GALERÍA",
      generators: "LABORATORIO CREATIVO",
      music: "MÚSICA",
      socials: "SOCIALS",
      support: "APOYO",
      shoutout: "HALL OF LEGENDS",
      contact: "CONTACTO",
      impressum: "AVISO LEGAL",
      friendsmap: "FRIENDS MAP",
      inner: "SILITUZ"
    }
  };

  const pageNumbers = {
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
  };

  body.dataset.worldPage = page;

  function directImage(section) {
    return section && Array.from(section.children).find(function (child) {
      return child.tagName === "IMG";
    });
  }

  if (page !== "home") {
    const firstSection = main.querySelector(":scope > section");
    if (firstSection && directImage(firstSection)) {
      firstSection.classList.add("sili-chapter-hero");

      const meta = document.createElement("span");
      meta.className = "sili-chapter-meta";
      meta.setAttribute("aria-hidden", "true");
      meta.textContent = "SILITUZ / " + (copy[language][page] || copy[language].inner);

      const number = document.createElement("span");
      number.className = "sili-chapter-number";
      number.setAttribute("aria-hidden", "true");
      number.textContent = (pageNumbers[page] || "12") + " / 12";

      firstSection.append(meta, number);
    }
  }

  const deck = document.querySelector("[data-world-deck]");
  if (deck) {
    const cards = Array.from(deck.querySelectorAll("[data-world-card]"));
    let activeCard = cards.find(function (card) {
      return card.classList.contains("is-active");
    }) || cards[0];

    function activate(card) {
      if (!card || card === activeCard) return;
      cards.forEach(function (item) {
        const selected = item === card;
        item.classList.toggle("is-active", selected);
        item.setAttribute("aria-current", selected ? "true" : "false");
      });
      activeCard = card;
    }

    cards.forEach(function (card) {
      card.addEventListener("pointerenter", function (event) {
        if (event.pointerType !== "touch") activate(card);
      }, { passive: true });
      card.addEventListener("focus", function () {
        activate(card);
      });
      card.addEventListener("pointerdown", function (event) {
        if (event.pointerType === "touch" && !card.classList.contains("is-active")) {
          event.preventDefault();
          activate(card);
          card.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
        }
      });
    });
  }

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
      const target = new URL("https://anime-pulse-news.silituz.chatgpt.site/");
      target.searchParams.set("lang", activeLanguage);
      link.href = target.toString();
    });
  }

  syncNewsLinks();
  document.addEventListener("silituz:languagechange", syncNewsLinks);

  const progress = document.createElement("span");
  progress.className = "sili-world-progress";
  progress.setAttribute("aria-hidden", "true");
  body.appendChild(progress);

  let scrollScheduled = false;
  function updateScrollEffects() {
    if (scrollScheduled) return;
    scrollScheduled = true;
    requestAnimationFrame(function () {
      const scrollable = Math.max(1, document.documentElement.scrollHeight - innerHeight);
      const amount = Math.min(1, Math.max(0, scrollY / scrollable));
      document.documentElement.style.setProperty("--sili-scroll", amount.toFixed(4));

      const hero = document.querySelector(".sili-chapter-hero");
      if (hero) {
        const rect = hero.getBoundingClientRect();
        const shift = Math.max(-50, Math.min(85, -rect.top * .13));
        hero.style.setProperty("--sili-hero-shift", shift.toFixed(2) + "px");
      }
      scrollScheduled = false;
    });
  }

  addEventListener("scroll", updateScrollEffects, { passive: true });
  addEventListener("resize", updateScrollEffects, { passive: true });
  updateScrollEffects();

  const contentSections = Array.from(main.querySelectorAll(":scope > section, :scope > main"))
    .filter(function (section) {
      return !section.classList.contains("sili-world-stage") &&
        !section.classList.contains("sili-chapter-hero");
    });

  contentSections.forEach(function (section, index) {
    section.classList.add("sili-world-reveal");
    const marker = document.createElement("span");
    marker.className = "sili-section-marker";
    marker.setAttribute("aria-hidden", "true");
    marker.textContent = String(index + 2).padStart(2, "0") + " / " +
      String(contentSections.length + 1).padStart(2, "0");
    section.appendChild(marker);
  });

  if ("IntersectionObserver" in window &&
      !matchMedia("(prefers-reduced-motion: reduce)").matches) {
    const observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    }, { rootMargin: "0px 0px -10% 0px", threshold: .08 });
    contentSections.forEach(function (section) {
      observer.observe(section);
    });
  } else {
    contentSections.forEach(function (section) {
      section.classList.add("is-visible");
    });
  }

  const reactiveCards = main.querySelectorAll(
    ".silituz-now__card, .silituz-news-home, .grid > div[class*='rounded'], .grid > a[class*='rounded']"
  );
  reactiveCards.forEach(function (card) {
    card.addEventListener("pointermove", function (event) {
      const rect = card.getBoundingClientRect();
      card.style.setProperty(
        "--sili-pointer-x",
        ((event.clientX - rect.left) / Math.max(1, rect.width) * 100).toFixed(1) + "%"
      );
      card.style.setProperty(
        "--sili-pointer-y",
        ((event.clientY - rect.top) / Math.max(1, rect.height) * 100).toFixed(1) + "%"
      );
    }, { passive: true });
  });

  document.documentElement.classList.add("sili-world-ready");
  body.classList.add("sili-world-ready");
}());
