(function (global) {
  'use strict';

  const TEMPLATES = {
    minimal:     { bg: '#0a0a12', card: '#14141e', text: '#e8e8f0', accent: '#3b82f6' },
    vibrant:     { bg: '#1a0a2e', card: '#2d1b4e', text: '#f0e6ff', accent: '#ec4899' },
    dark:        { bg: '#000000', card: '#0d0d0d', text: '#e5e5e5', accent: '#6366f1' },
    ocean:       { bg: '#0a1628', card: '#0d2137', text: '#d4edff', accent: '#06b6d4' },
    sunset:      { bg: '#1a0e08', card: '#2d1a0e', text: '#ffe8d4', accent: '#f97316' },
    cyberpunk:   { bg: '#0a001a', card: '#1a0033', text: '#f0e6ff', accent: '#ec4899' },
    remembrance: { bg: '#1c1917', card: '#292524', text: '#e7e5e4', accent: '#a8a29e' },
  };

  const TEMPLATE_EMOJIS = {
    minimal: '⚪',
    vibrant: '🌈',
    dark: '🌑',
    ocean: '🌊',
    sunset: '🌅',
    cyberpunk: '⚡',
    remembrance: '🕊️',
  };

  const STORAGE_KEY = 'omnipost_theme';
  const CUSTOM = 'custom';

  function createThemeEngine(options) {
    const opts = options || {};
    const inputs = opts.colorInputs || {};
    const onChange = typeof opts.onChange === 'function' ? opts.onChange : function () {};
    const onToast  = typeof opts.onToast  === 'function' ? opts.onToast  : function () {};

    let lastTemplate = null;

    function saveTheme(type) {
      try { localStorage.setItem(STORAGE_KEY, type); } catch (e) {}
    }

    function loadTheme() {
      try { return localStorage.getItem(STORAGE_KEY); } catch (e) { return null; }
    }

    function clearTheme() {
      try { localStorage.removeItem(STORAGE_KEY); } catch (e) {}
    }

    function pickRandom() {
      const keys = Object.keys(TEMPLATES);
      let pool = keys.filter(k => k !== lastTemplate);
      if (pool.length === 0) pool = keys;
      const chosen = pool[Math.floor(Math.random() * pool.length)];
      lastTemplate = chosen;
      return chosen;
    }

    function writeColorsToDOM(t) {
      if (inputs.bg)     inputs.bg.value     = t.bg;
      if (inputs.card)   inputs.card.value   = t.card;
      if (inputs.text)   inputs.text.value   = t.text;
      if (inputs.accent) inputs.accent.value = t.accent;
    }

    function readColorsFromDOM() {
      return {
        bg:     inputs.bg     ? inputs.bg.value     : '#000000',
        card:   inputs.card   ? inputs.card.value   : '#000000',
        text:   inputs.text   ? inputs.text.value   : '#ffffff',
        accent: inputs.accent ? inputs.accent.value : '#2563eb',
      };
    }

    function applyTheme(type, options) {
      const o = options || {};
      const t = TEMPLATES[type];
      if (!t) return false;
      writeColorsToDOM(t);
      lastTemplate = type;
      onChange();
      if (!o.silent) {
        const emoji = TEMPLATE_EMOJIS[type] || '🎨';
        const label = type.charAt(0).toUpperCase() + type.slice(1);
        onToast(`${emoji} Theme: ${label}`);
      }
      return true;
    }

    function shuffle() {
      const chosen = pickRandom();
      applyTheme(chosen);
      saveTheme(chosen);
      return chosen;
    }

    function load(type) {
      if (!applyTheme(type)) return false;
      saveTheme(type);
      return true;
    }

    function markCustom() {
      saveTheme(CUSTOM);
      onChange();
    }

    function getThemeName() { return loadTheme(); }
    function getLastTemplate() { return lastTemplate; }
    function getTemplates() { return TEMPLATES; }
    function getEmoji(type) { return TEMPLATE_EMOJIS[type] || '🎨'; }
    function labelFor(type) {
      return type.charAt(0).toUpperCase() + type.slice(1);
    }

    function init() {
      const saved = loadTheme();

      if (saved === CUSTOM) {
        lastTemplate = CUSTOM;
        return { theme: CUSTOM, source: 'custom' };
      }

      if (saved && TEMPLATES[saved]) {
        applyTheme(saved, { silent: true });
        return { theme: saved, source: 'template' };
      }

      const chosen = pickRandom();
      applyTheme(chosen, { silent: true });
      saveTheme(chosen);
      return { theme: chosen, source: 'random' };
    }

    return {
      init,
      applyTheme,
      shuffle,
      load,
      markCustom,
      saveTheme,
      loadTheme,
      clearTheme,
      readColorsFromDOM,
      getThemeName,
      getLastTemplate,
      getTemplates,
      getEmoji,
      labelFor,
      TEMPLATES,
      CUSTOM,
    };
  }

  global.createThemeEngine = createThemeEngine;
  global.OMNIPOST_TEMPLATES = TEMPLATES;
  global.OMNIPOST_TEMPLATE_EMOJIS = TEMPLATE_EMOJIS;

})(window);