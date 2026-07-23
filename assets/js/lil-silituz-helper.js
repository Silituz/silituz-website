(function () {
  const root = document.querySelector('[data-lil-sili]');
  if (!root) return;

  const panel = root.querySelector('.lil-sili__panel');
  const title = root.querySelector('#lilSiliTitle');
  const trigger = root.querySelector('[data-lil-sili-trigger]');
  const close = root.querySelector('[data-lil-sili-close]');
  const copy = root.querySelector('[data-helper-copy]');
  const hint = root.querySelector('[data-helper-hint]');
  const routes = root.querySelector('[data-helper-routes]');
  const form = root.querySelector('[data-helper-form]');
  const input = root.querySelector('[data-helper-input]');
  const answer = root.querySelector('[data-helper-answer]');
  const label = root.querySelector('[data-helper-label]');
  const submit = root.querySelector('[data-helper-submit]');
  const helperContent = root.querySelector('[data-helper-content]');
  const languageGroup = root.querySelector('.lil-sili__languages');
  const langButtons = Array.from(root.querySelectorAll('[data-helper-lang]'));
  const STORAGE_KEY = 'silituz-language';
  const NEWS_URL = 'https://anime-pulse-news.silituz.chatgpt.site';

  const dictionaries = {
    de: {
      intro: 'Hi! Ich bin Lil Silituz. Was möchtest du entdecken?',
      hint: 'Bereit zu helfen',
      placeholder: 'Zum Beispiel: Musik, Bilder oder Kontakt …',
      languageLabel: 'Sprache wählen',
      close: 'Helfer schließen',
      submit: 'Ziel suchen',
      noMatch: 'Das habe ich noch nicht sicher erkannt. Versuch es mit News, Musik, Galerie, Support, Über mich, Socials, Kontakt oder Generatoren.',
      found: 'Hab’s gefunden — ich bringe dich hin!',
      routes: [
        ['💚 Silituz unterstützen', '/support/', 'support'],
        ['✦ News entdecken', 'https://anime-pulse-news.silituz.chatgpt.site', 'news'],
        ['♫ Meine Musik', '/music/', 'music'],
        ['▧ Galerie', '/gallery/', 'gallery'],
        ['⚙ Generatoren & mehr', '/generators/', 'tools'],
        ['→ Über mich', '/about/', 'about']
      ]
    },
    en: {
      intro: 'Hi! I’m Lil Silituz. What would you like to discover?',
      hint: 'Ready to help',
      placeholder: 'For example: music, pictures or contact …',
      languageLabel: 'Choose language',
      close: 'Close helper',
      submit: 'Find destination',
      noMatch: 'I’m not completely sure yet. Try news, music, gallery, support, about, socials, contact or generators.',
      found: 'Found it — I’ll take you there!',
      routes: [
        ['💚 Support Silituz', '/en/support/', 'support'],
        ['✦ Discover news', 'https://anime-pulse-news.silituz.chatgpt.site', 'news'],
        ['♫ My music', '/en/music/', 'music'],
        ['▧ Gallery', '/en/gallery/', 'gallery'],
        ['⚙ Generators & more', '/en/generators/', 'tools'],
        ['→ About me', '/en/about/', 'about']
      ]
    },
    es: {
      intro: '¡Hola! Soy Lil Silituz. ¿Qué te gustaría descubrir?',
      hint: 'Listo para ayudar',
      placeholder: 'Por ejemplo: música, imágenes o contacto …',
      languageLabel: 'Elegir idioma',
      close: 'Cerrar asistente',
      submit: 'Buscar destino',
      noMatch: 'Aún no estoy completamente seguro. Prueba con noticias, música, galería, apoyo, sobre mí, redes, contacto o generadores.',
      found: '¡Lo encontré! Te llevo allí.',
      routes: [
        ['💚 Apoyar a Silituz', '/es/support/', 'support'],
        ['✦ Descubrir noticias', 'https://anime-pulse-news.silituz.chatgpt.site', 'news'],
        ['♫ Mi música', '/es/music/', 'music'],
        ['▧ Galería', '/es/gallery/', 'gallery'],
        ['⚙ Generadores y más', '/es/generators/', 'tools'],
        ['→ Sobre mí', '/es/about/', 'about']
      ]
    }
  };

  const keywords = {
    support: ['support', 'unterstütz', 'spenden', 'donate', 'apoy', 'donar', 'tipeee'],
    news: ['news', 'anime', 'manga', 'game', 'gaming', 'kpop', 'jpop', 'jrock', 'noticias'],
    music: ['musik', 'music', 'música', 'song', 'lied', 'spotify', 'apple'],
    gallery: ['galerie', 'gallery', 'galería', 'bild', 'picture', 'imagen', 'foto'],
    tools: ['generator', 'tool', 'werkzeug', 'herramienta', 'game', 'spiel'],
    about: ['über mich', 'about', 'sobre mí', 'silituz', 'wer bist'],
    socials: ['social', 'instagram', 'tiktok', 'youtube', 'discord', 'redes'],
    contact: ['kontakt', 'contact', 'contacto', 'mail', 'email']
  };

  const fixedRoutes = {
    de: { socials: '/socials/', contact: '/contact/' },
    en: { socials: '/en/socials/', contact: '/en/contact/' },
    es: { socials: '/es/socials/', contact: '/es/contact/' }
  };

  function languageFromPage() {
    const code = (document.documentElement.lang || '').toLowerCase();
    if (code.startsWith('es') || location.pathname.startsWith('/es/')) return 'es';
    if (code.startsWith('en') || location.pathname.startsWith('/en/')) return 'en';
    return 'de';
  }

  function storedLanguage() {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      return saved === 'de' || saved === 'en' || saved === 'es' ? saved : null;
    } catch (_) {
      return null;
    }
  }

  function rememberLanguage(nextLanguage) {
    try {
      window.localStorage.setItem(STORAGE_KEY, nextLanguage);
    } catch (_) {
      // The selected language still works for this visit when storage is blocked.
    }
  }

  function stripLanguage(pathname) {
    return pathname.replace(/^\/(?:de|en|es)(?:\/|$)/i, '/').replace(/^\/index\.html$/i, '/');
  }

  function pagePathFor(nextLanguage) {
    const clean = stripLanguage(location.pathname || '/');
    if (nextLanguage === 'en') return '/en' + (clean === '/' ? '/' : clean);
    if (nextLanguage === 'es') return '/es' + (clean === '/' ? '/' : clean);
    return clean || '/';
  }

  function newsUrl(nextLanguage) {
    const url = new URL(NEWS_URL);
    url.searchParams.set('lang', nextLanguage);
    return url.toString();
  }

  const savedLanguage = storedLanguage();
  let needsLanguageChoice = !savedLanguage;
  let language = savedLanguage || languageFromPage();

  function routeHref(href, kind) {
    return kind === 'news' ? newsUrl(language) : href;
  }

  function render() {
    const dictionary = dictionaries[language];
    root.classList.toggle('is-choosing-language', needsLanguageChoice);
    helperContent.hidden = needsLanguageChoice;
    languageGroup.setAttribute('aria-label', needsLanguageChoice ? 'Choose your language' : dictionary.languageLabel);
    title.textContent = needsLanguageChoice ? "Hi, I'm Lil Sili!" : 'Lil Sili';
    copy.textContent = needsLanguageChoice
      ? 'Hi! Which language should I speak with you?'
      : dictionary.intro;
    hint.textContent = needsLanguageChoice ? 'Choose your language' : dictionary.hint;
    input.placeholder = dictionary.placeholder;
    close.setAttribute('aria-label', needsLanguageChoice ? 'Close language selection' : dictionary.close);
    submit.setAttribute('aria-label', dictionary.submit);
    label.textContent = dictionary.placeholder;
    answer.textContent = '';
    routes.innerHTML = '';

    dictionary.routes.forEach(([title, href, kind]) => {
      const link = document.createElement('a');
      link.href = routeHref(href, kind);
      link.textContent = title;
      link.dataset.route = kind;
      if (/^https?:/.test(link.href)) link.rel = 'noopener';
      routes.appendChild(link);
    });

    langButtons.forEach((button) => {
      button.setAttribute(
        'aria-pressed',
        !needsLanguageChoice && button.dataset.helperLang === language ? 'true' : 'false'
      );
    });
  }

  function openPanel() {
    panel.hidden = false;
    trigger.setAttribute('aria-expanded', 'true');
    window.requestAnimationFrame(() => panel.classList.add('is-open'));
  }

  function closePanel() {
    panel.classList.remove('is-open');
    trigger.setAttribute('aria-expanded', 'false');
    window.setTimeout(() => {
      if (!panel.classList.contains('is-open')) panel.hidden = true;
    }, 180);
    trigger.focus();
  }

  function targetFor(kind) {
    const direct = dictionaries[language].routes.find((route) => route[2] === kind);
    if (direct) return routeHref(direct[1], direct[2]);
    return fixedRoutes[language][kind];
  }

  trigger.addEventListener('click', () => {
    if (panel.hidden) openPanel();
    else closePanel();
  });
  close.addEventListener('click', closePanel);
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && !panel.hidden) closePanel();
  });

  langButtons.forEach((button) => {
    button.addEventListener('click', () => {
      language = button.dataset.helperLang;
      needsLanguageChoice = false;
      rememberLanguage(language);
      render();

      const nextPath = pagePathFor(language);
      if (nextPath !== location.pathname) {
        const nextUrl = new URL(location.href);
        nextUrl.pathname = nextPath;
        window.location.assign(nextUrl.toString());
      }
    });
  });

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const query = input.value.trim().toLocaleLowerCase(language);
    const match = Object.entries(keywords).find(([, words]) => words.some((word) => query.includes(word)));
    if (!match) {
      answer.textContent = dictionaries[language].noMatch;
      return;
    }

    const href = targetFor(match[0]);
    answer.textContent = dictionaries[language].found;
    window.setTimeout(() => {
      window.location.href = href;
    }, 380);
  });

  render();
  if (needsLanguageChoice) {
    window.setTimeout(openPanel, 260);
  }
})();
