(function () {
  "use strict";

  const path = location.pathname.toLowerCase();
  const html = document.documentElement;
  const page = path.includes("/music") ? "music" : path.includes("/gallery") ? "gallery" : path.includes("/shoutout") ? "shoutout" : path.includes("/support") ? "support" : path.includes("/generators") ? "generators" : path.includes("/socials") ? "socials" : path.includes("/about") ? "about" : path.includes("/contact") ? "contact" : (path === "/" || path === "/en/" || path === "/es/" || path === "/en" || path === "/es") ? "home" : "inner";
  document.body.classList.add("page-" + page);

  // Cleanup only: remove the service worker from the earlier PWA preview.
  if ("serviceWorker" in navigator && navigator.serviceWorker.getRegistrations) {
    navigator.serviceWorker.getRegistrations().then(function (registrations) {
      registrations.forEach(function (registration) {
        const script = registration.active && registration.active.scriptURL ? registration.active.scriptURL : "";
        if (script.includes("/service-worker.js")) registration.unregister();
      });
    }).catch(function () {});
  }

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
      const context = copy[activeLanguage][page] || copy[activeLanguage].inner;
      box.innerHTML = "<strong>" + context[0] + "</strong><span>" + context[1] + "</span>";
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


  function addModernSection() {
    const main = document.querySelector("main");
    const hero = main && main.querySelector("section");
    if (!main || !hero || document.querySelector("[data-sili-page-feature]")) return;

    const copies = {
      de: {
        about: {
          kicker: "DER MENSCH HINTER SILITUZ", title: "Ideen werden Welten.",
          text: "Anime-Ästhetik, KI-Art, Musik und Community treffen sich in einem kreativen Universum – neugierig, verspielt und immer lösungsorientiert.",
          one: ["✦", "Vision", "Aus einer kleinen Idee wird ein Erlebnis mit eigener Stimmung."],
          two: ["音", "Sound", "Musik erzählt, was Bilder allein nicht ausdrücken können."],
          three: ["∞", "Community", "Die besten Projekte wachsen gemeinsam mit anderen."]
        },
        generators: {
          kicker: "SILITUZ CREATIVE LAB", title: "Ausprobieren. Erschaffen. Staunen.",
          text: "Ein direkter Einstieg in Spiele, Generatoren und kreative Werkzeuge.",
          one: ["PLAY", "Minispiele", "Reaktion, Timing und kleine Herausforderungen.", "#sili-play"],
          two: ["CREATE", "Generatoren", "Charaktere, Passwörter und neue Ideen.", "#sili-create"],
          three: ["ORGANIZE", "Organizer", "Kreative Projekte übersichtlich zusammenbringen.", "#sili-organize"]
        },
        socials: {
          kicker: "SILITUZ SIGNAL HUB", title: "Finde mich überall.",
          text: "Streams, Musik, kurze Videos und Community – wähle einfach dein Signal.",
          live: "LIVE & SHORTS", music: "MUSIC", community: "COMMUNITY"
        },
        support: {
          kicker: "POWER THE NEXT IDEA", title: "Dein Support wird zu Kreativität.",
          text: "Unterstützung muss nicht immer Geld bedeuten. Anschauen, teilen und weiterempfehlen hilft genauso.",
          one: ["01", "Anschauen", "Videos, Musik und Projekte entdecken."],
          two: ["02", "Teilen", "Silituz an Menschen weitergeben, denen es gefallen könnte."],
          three: ["03", "Direkt unterstützen", "Wenn du mehr tun möchtest, findest du darunter sichere Möglichkeiten."]
        },
        contact: {
          kicker: "OPEN CHANNEL", title: "Worum geht es?",
          text: "Wähle den passenden Weg und schreibe anschließend direkt deine Nachricht.",
          one: ["PROJEKT", "Kreative Zusammenarbeit", "Ideen, Musik, Visuals oder gemeinsame Projekte."],
          two: ["COMMUNITY", "Fragen & Austausch", "Allgemeine Fragen zu Silituz und den Inhalten."],
          three: ["FEEDBACK", "Ideen für die Website", "Fehler, Wünsche oder neue Funktionsideen."]
        },
        shoutout: {
          kicker: "SILITUZ HALL OF LEGENDS", title: "Die Menschen hinter der Reise.",
          text: "Keine anonyme Liste, sondern eine Bühne für Menschen, die inspiriert, geholfen, gelacht und diesen Weg besonders gemacht haben.",
          enter: "Die Hall of Legends betreten", honor: "CREATIVITY · LOYALTY · COMMUNITY"
        }
      },
      en: {
        about: {
          kicker: "THE PERSON BEHIND SILITUZ", title: "Ideas become worlds.",
          text: "Anime aesthetics, AI art, music and community meet in one creative universe – curious, playful and always solution-minded.",
          one: ["✦", "Vision", "A small idea grows into an experience with its own atmosphere."],
          two: ["音", "Sound", "Music expresses what images alone cannot say."],
          three: ["∞", "Community", "The best projects grow together with others."]
        },
        generators: {
          kicker: "SILITUZ CREATIVE LAB", title: "Try. Create. Be surprised.",
          text: "A direct entrance to games, generators and creative tools.",
          one: ["PLAY", "Mini games", "Reaction, timing and quick challenges.", "#sili-play"],
          two: ["CREATE", "Generators", "Characters, passwords and fresh ideas.", "#sili-create"],
          three: ["ORGANIZE", "Organizer", "Bring creative projects together clearly.", "#sili-organize"]
        },
        socials: {
          kicker: "SILITUZ SIGNAL HUB", title: "Find me everywhere.",
          text: "Streams, music, short videos and community – simply choose your signal.",
          live: "LIVE & SHORTS", music: "MUSIC", community: "COMMUNITY"
        },
        support: {
          kicker: "POWER THE NEXT IDEA", title: "Your support becomes creativity.",
          text: "Support does not always mean money. Watching, sharing and recommending helps just as much.",
          one: ["01", "Watch", "Discover videos, music and projects."],
          two: ["02", "Share", "Show Silituz to people who may enjoy it."],
          three: ["03", "Direct support", "If you want to do more, safe options are waiting below."]
        },
        contact: {
          kicker: "OPEN CHANNEL", title: "What is it about?",
          text: "Choose the right route and then write your message directly.",
          one: ["PROJECT", "Creative collaboration", "Ideas, music, visuals or shared projects."],
          two: ["COMMUNITY", "Questions & exchange", "General questions about Silituz and the content."],
          three: ["FEEDBACK", "Website ideas", "Bugs, wishes or new feature ideas."]
        },
        shoutout: {
          kicker: "SILITUZ HALL OF LEGENDS", title: "The people behind the journey.",
          text: "Not an anonymous list, but a stage for the people who inspired, helped, laughed and made this journey special.",
          enter: "Enter the Hall of Legends", honor: "CREATIVITY · LOYALTY · COMMUNITY"
        }
      },
      es: {
        about: {
          kicker: "LA PERSONA DETRÁS DE SILITUZ", title: "Las ideas se convierten en mundos.",
          text: "La estética anime, el arte con IA, la música y la comunidad se unen en un universo creativo, curioso y lleno de soluciones.",
          one: ["✦", "Visión", "Una pequeña idea se convierte en una experiencia con ambiente propio."],
          two: ["音", "Sonido", "La música expresa lo que las imágenes no pueden decir solas."],
          three: ["∞", "Comunidad", "Los mejores proyectos crecen junto a otras personas."]
        },
        generators: {
          kicker: "SILITUZ CREATIVE LAB", title: "Prueba. Crea. Sorpréndete.",
          text: "Una entrada directa a juegos, generadores y herramientas creativas.",
          one: ["PLAY", "Minijuegos", "Reacción, ritmo y pequeños retos.", "#sili-play"],
          two: ["CREATE", "Generadores", "Personajes, contraseñas e ideas nuevas.", "#sili-create"],
          three: ["ORGANIZE", "Organizer", "Organiza tus proyectos creativos fácilmente.", "#sili-organize"]
        },
        socials: {
          kicker: "SILITUZ SIGNAL HUB", title: "Encuéntrame en todas partes.",
          text: "Directos, música, vídeos cortos y comunidad: elige tu señal.",
          live: "DIRECTOS Y CORTOS", music: "MÚSICA", community: "COMUNIDAD"
        },
        support: {
          kicker: "POWER THE NEXT IDEA", title: "Tu apoyo se convierte en creatividad.",
          text: "Apoyar no siempre significa dinero. Ver, compartir y recomendar ayuda muchísimo.",
          one: ["01", "Ver", "Descubre vídeos, música y proyectos."],
          two: ["02", "Compartir", "Muestra Silituz a personas que podrían disfrutarlo."],
          three: ["03", "Apoyo directo", "Si quieres hacer más, encontrarás opciones seguras abajo."]
        },
        contact: {
          kicker: "OPEN CHANNEL", title: "¿De qué se trata?",
          text: "Elige la ruta adecuada y después escribe directamente tu mensaje.",
          one: ["PROYECTO", "Colaboración creativa", "Ideas, música, imágenes o proyectos conjuntos."],
          two: ["COMUNIDAD", "Preguntas e intercambio", "Preguntas generales sobre Silituz y su contenido."],
          three: ["FEEDBACK", "Ideas para la web", "Errores, deseos o nuevas funciones."]
        },
        shoutout: {
          kicker: "SILITUZ HALL OF LEGENDS", title: "Las personas detrás del viaje.",
          text: "No es una lista anónima, sino un escenario para quienes inspiraron, ayudaron, rieron e hicieron especial este camino.",
          enter: "Entrar en la Hall of Legends", honor: "CREATIVIDAD · LEALTAD · COMUNIDAD"
        }
      }
    };
    const data = (copies[language] || copies.de)[page];
    if (!data) return;

    const section = document.createElement("section");
    section.dataset.siliPageFeature = page;
    section.className = "sili-page-feature sili-glass";

    function featureCard(item, href) {
      const tag = href ? "a" : "article";
      const link = href ? ' href="' + href + '"' : "";
      return "<" + tag + link + ' class="sili-feature-card"><i>' + item[0] + "</i><h3>" + item[1] + "</h3><p>" + item[2] + "</p></" + tag + ">";
    }

    if (page === "about") {
      section.classList.add("sili-about-feature");
      const aboutSections = Array.from(main.children).filter(function (element) { return element.tagName === "SECTION"; }).slice(1); aboutSections.forEach(function (element, index) { element.classList.add("sili-about-story", "sili-about-story-" + (index + 1)); }); section.innerHTML = '<div class="sili-about-intro"><div class="sili-feature-copy"><span class="sili-kicker">' + data.kicker + '</span><h2 class="sili-gradient-text">' + data.title + '</h2><p>' + data.text + '</p><span class="sili-about-signature">SILITUZ · CREATOR · STORYTELLER</span></div><div class="sili-about-portrait" aria-hidden="true"><span class="sili-about-ring"></span><img src="/assets/images/about-right.svg" alt=""><b>MAKE IT YOUR WORLD</b></div></div><div class="sili-feature-grid">' + featureCard(data.one) + featureCard(data.two) + featureCard(data.three) + "</div>";
    }

    if (page === "generators") {
      const sections = Array.from(main.children).filter(function (element) { return element.tagName === "SECTION"; });
      if (sections[1]) sections[1].id = "sili-play";
      if (sections[2]) sections[2].id = "sili-create";
      if (sections[3]) sections[3].id = "sili-organize";
      section.classList.add("sili-lab-feature");
      section.innerHTML = '<div class="sili-feature-copy"><span class="sili-kicker">' + data.kicker + '</span><h2 class="sili-gradient-text">' + data.title + '</h2><p>' + data.text + '</p></div><div class="sili-feature-grid">' + featureCard(data.one, data.one[3]) + featureCard(data.two, data.two[3]) + featureCard(data.three, data.three[3]) + "</div>";
    }

    if (page === "socials") {
      section.classList.add("sili-signal-feature");
      section.innerHTML = '<div class="sili-feature-copy"><span class="sili-kicker">' + data.kicker + '</span><h2 class="sili-gradient-text">' + data.title + '</h2><p>' + data.text + '</p></div><div class="sili-signal-orbit" aria-label="Silituz social links"><span class="sili-signal-core"><img src="/assets/images/lil-sili-social.svg" alt="Lil Sili"></span><a class="signal-tiktok" href="https://www.tiktok.com/@silituz" target="_blank" rel="noopener"><i class="fa-brands fa-tiktok"></i><b>TikTok</b><small>' + data.live + '</small></a><a class="signal-spotify" href="https://open.spotify.com/artist/0l3OqhrDQ7No2fPCIP0i5h" target="_blank" rel="noopener"><i class="fa-brands fa-spotify"></i><b>Spotify</b><small>' + data.music + '</small></a><a class="signal-youtube" href="https://www.youtube.com/@silituz" target="_blank" rel="noopener"><i class="fa-brands fa-youtube"></i><b>YouTube</b><small>' + data.live + '</small></a><a class="signal-instagram" href="https://www.instagram.com/silituz" target="_blank" rel="noopener"><i class="fa-brands fa-instagram"></i><b>Instagram</b><small>' + data.community + '</small></a><a class="signal-discord" href="https://discord.gg/ypzW8RmGfT" target="_blank" rel="noopener"><i class="fa-brands fa-discord"></i><b>Discord</b><small>' + data.community + "</small></a></div>";
    }

    if (page === "support") {
      section.classList.add("sili-support-feature");
      section.innerHTML = '<div class="sili-feature-copy"><span class="sili-kicker">' + data.kicker + '</span><h2 class="sili-gradient-text">' + data.title + '</h2><p>' + data.text + '</p></div><div class="sili-feature-grid">' + featureCard(data.one, "/music/") + featureCard(data.two, "/socials/") + featureCard(data.three, "#tipeeeButton") + "</div>";
    }

    if (page === "contact") {
      const form = document.getElementById("contactForm");
      if (form) form.closest("section").id = "sili-contact-form";
      section.classList.add("sili-contact-feature");
      if (form) { form.classList.add("sili-contact-form-modern"); form.closest("section").classList.add("sili-contact-panel"); } section.innerHTML = '<div class="sili-contact-head"><div class="sili-feature-copy"><span class="sili-kicker">' + data.kicker + '</span><h2 class="sili-gradient-text">' + data.title + '</h2><p>' + data.text + '</p></div><div class="sili-contact-beacon" aria-hidden="true"><span></span><b>ONLINE</b><small>SILITUZ CHANNEL</small></div></div><div class="sili-feature-grid">' + featureCard(data.one, "#sili-contact-form") + featureCard(data.two, "#sili-contact-form") + featureCard(data.three, "#sili-contact-form") + "</div>"; section.querySelectorAll(".sili-feature-card").forEach(function (card, index) { const item = [data.one, data.two, data.three][index]; card.dataset.contactTopic = item[1]; card.addEventListener("click", function () { const subject = document.getElementById("subject"); if (subject && !subject.value) subject.value = item[1]; }); });
    }

    if (page === "shoutout") {
      const legendCopy = language === "es" ? {
        presents: "SILITUZ PRESENTA",
        oath: "UNA COMUNIDAD · UNA HISTORIA · INFINITOS RECUERDOS"
      } : language === "en" ? {
        presents: "SILITUZ PRESENTS",
        oath: "ONE COMMUNITY · ONE STORY · ENDLESS MEMORIES"
      } : {
        presents: "SILITUZ PRÄSENTIERT",
        oath: "EINE COMMUNITY · EINE GESCHICHTE · UNENDLICH VIELE MOMENTE"
      };

      const profiles = Array.from(main.querySelectorAll("a")).filter(function (link) {
        return link.querySelector("img[alt]") && !link.closest(".sili-legends-stage");
      });
      profiles.forEach(function (profile) {
        const image = profile.querySelector("img[alt]");
        const heading = profile.querySelector("h3");
        const profileName = heading && heading.textContent.trim() ? heading.textContent.trim() : image.alt.trim();
        profile.classList.add("sili-legend-profile");
        profile.dataset.legendName = profileName;
      });

      const originalSections = Array.from(main.children).filter(function (element) {
        return element.tagName === "SECTION";
      });
      const communitySection = originalSections[1];
      if (communitySection) {
        communitySection.id = "community-legends";
        communitySection.classList.add("sili-community-legends");
      }

      section.classList.add("sili-legends-feature", "sili-legends-overdrive");
      section.innerHTML =
        '<div class="sili-legends-stars" aria-hidden="true"></div>' +
        '<div class="sili-cinematic-beams" aria-hidden="true"><i></i><i></i><i></i></div>' +
        '<div class="sili-legends-frame" aria-hidden="true"><span></span><span></span><span></span><span></span></div>' +
        '<div class="sili-legends-chapters"><span>THE LEGENDARY TRINITY</span><i></i><span>ONE COMMUNITY</span></div>' +
        '<div class="sili-feature-copy">' +
          '<span class="sili-legend-presents"><i></i>' + legendCopy.presents + '<i></i></span>' +
          '<span class="sili-kicker">' + data.kicker + '</span>' +
          '<h2 class="sili-gradient-text">' + data.title + '</h2>' +
          '<p>' + data.text + '</p>' +
          '<strong class="sili-legends-honor">' + legendCopy.oath + '</strong>' +
          '<a class="sili-btn sili-btn--primary sili-legend-enter" href="#community-legends">' + data.enter + ' <span>↓</span></a>' +
        '</div>' +
        '<div class="sili-legends-stage" aria-label="Red Bonita, IceQueen und Wolf">' +
          '<div class="sili-legend-crown" aria-hidden="true"><i></i><i></i><i></i><b>THE LEGENDARY TRINITY</b></div>' +
          '<span class="legend-orbit legend-orbit-one" aria-hidden="true"></span>' +
          '<span class="legend-orbit legend-orbit-two" aria-hidden="true"></span>' +
          '<span class="legend-orbit legend-orbit-three" aria-hidden="true"></span>' +
          '<div class="sili-legend-sigil" aria-hidden="true"><i></i><b>S</b><i></i></div>' +
          '<div class="sili-trinity-links" aria-hidden="true"><i></i><i></i><i></i></div>' +
          '<a class="legend-avatar legend-avatar-red" href="https://www.tiktok.com/@_.eunice16._" target="_blank" rel="noopener" aria-label="Red Bonita auf TikTok">' +
            '<span class="legend-avatar__halo" aria-hidden="true"></span><img src="/assets/images/shoutout/eunice2.svg" alt="Red Bonita"><strong>Red Bonita</strong>' +
          '</a>' +
          '<a class="legend-avatar legend-avatar-ice" href="https://www.tiktok.com/@grozdanic.lule" target="_blank" rel="noopener" aria-label="IceQueen auf TikTok">' +
            '<span class="legend-avatar__halo" aria-hidden="true"></span><img src="/assets/images/shoutout/icequeen2.svg" alt="IceQueen"><strong>IceQueen</strong>' +
          '</a>' +
          '<a class="legend-avatar legend-avatar-wolf" href="https://www.tiktok.com/@wolf_05555" target="_blank" rel="noopener" aria-label="Wolf auf TikTok">' +
            '<span class="legend-avatar__halo" aria-hidden="true"></span><img src="/assets/images/shoutout/wolfpo3.svg" alt="Wolf"><strong>Wolf</strong>' +
          '</a>' +
          '<div class="sili-legend-pedestal" aria-hidden="true"><span></span><span></span><span></span></div>' +
        '</div>' +
        '<div class="sili-legends-marquee" aria-hidden="true"><span>' + legendCopy.oath + ' · ' + legendCopy.oath + ' · </span></div>';

      const canTilt = matchMedia("(pointer:fine)").matches && !matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (canTilt) {
        let targetTiltX = 0;
        let targetTiltY = 0;
        let currentTiltX = 0;
        let currentTiltY = 0;
        let targetSpotX = 76;
        let targetSpotY = 42;
        let currentSpotX = 76;
        let currentSpotY = 42;
        let tiltFrame = 0;

        function animateTilt() {
          currentTiltX += (targetTiltX - currentTiltX) * .09;
          currentTiltY += (targetTiltY - currentTiltY) * .09;
          currentSpotX += (targetSpotX - currentSpotX) * .075;
          currentSpotY += (targetSpotY - currentSpotY) * .075;

          section.style.setProperty("--spot-x", currentSpotX.toFixed(2) + "%");
          section.style.setProperty("--spot-y", currentSpotY.toFixed(2) + "%");
          section.style.setProperty("--tilt-x", currentTiltX.toFixed(3) + "deg");
          section.style.setProperty("--tilt-y", currentTiltY.toFixed(3) + "deg");

          const moving = Math.abs(targetTiltX - currentTiltX) > .01 ||
            Math.abs(targetTiltY - currentTiltY) > .01 ||
            Math.abs(targetSpotX - currentSpotX) > .05 ||
            Math.abs(targetSpotY - currentSpotY) > .05;

          tiltFrame = moving ? requestAnimationFrame(animateTilt) : 0;
        }

        function requestTiltFrame() {
          if (!tiltFrame) tiltFrame = requestAnimationFrame(animateTilt);
        }

        section.addEventListener("pointermove", function (event) {
          const rect = section.getBoundingClientRect();
          const x = Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width));
          const y = Math.max(0, Math.min(1, (event.clientY - rect.top) / rect.height));
          targetSpotX = x * 100;
          targetSpotY = y * 100;
          targetTiltX = (.5 - y) * 5;
          targetTiltY = (x - .5) * 6;
          requestTiltFrame();
        });

        section.addEventListener("pointerleave", function () {
          targetTiltX = 0;
          targetTiltY = 0;
          targetSpotX = 76;
          targetSpotY = 42;
          requestTiltFrame();
        });
      }
    }

    hero.insertAdjacentElement("afterend", section);
  }

  addModernSection();

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