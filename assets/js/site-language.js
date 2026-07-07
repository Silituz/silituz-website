/* Shared language helper for Red Bonita and later Silituz ES support. */
(function(){
  function norm(lang){
    lang = String(lang || '').toLowerCase();
    if(lang.indexOf('de') === 0) return 'de';
    if(lang.indexOf('es') === 0 || lang === 'latino') return 'es';
    return 'en';
  }
  function text(dict, lang, key){ return (dict[lang] && dict[lang][key]) || (dict.en && dict.en[key]) || ''; }
  function apply(root, dict, lang){
    document.documentElement.lang = lang === 'es' ? 'es-MX' : lang;
    document.documentElement.dataset.activeLang = lang;
    root.querySelectorAll('[data-i18n]').forEach(function(el){
      var value = text(dict, lang, el.dataset.i18n);
      if(value) el.textContent = value;
    });
    root.querySelectorAll('[data-lang-choice]').forEach(function(btn){
      var active = norm(btn.dataset.langChoice) === lang;
      btn.classList.toggle('is-active', active);
      btn.setAttribute('aria-pressed', String(active));
    });
  }
  function init(root, dict, opts){
    opts = opts || {};
    var key = opts.storageKey || 'silituz:language';
    var lang = norm(localStorage.getItem(key) || opts.defaultLang || root.dataset.defaultLang || 'en');
    function set(next){ lang = norm(next); localStorage.setItem(key, lang); apply(root, dict, lang); }
    root.querySelectorAll('[data-lang-choice]').forEach(function(btn){ btn.addEventListener('click', function(){ set(btn.dataset.langChoice); }); });
    set(lang);
  }
  window.SilituzLanguage = { init:init, apply:apply, normalize:norm };
})();
