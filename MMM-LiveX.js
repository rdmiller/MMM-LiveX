// MMM-LiveX: a MagicMirror² module showing livex.earth, the live globe, in an iframe. The
// module's config is the view's URL parameters (url.js), and MagicMirror's own units and clock
// fill in the rest.

/* global Module, Log, LivexUrl */

Module.register('MMM-LiveX', {
  defaults: {
    baseUrl: 'https://livex.earth/',
    width: '480px',
    height: '',
    aspectRatio: 1,
    interactive: true,
    reloadInterval: 24 * 60 * 60 * 1000,
    unloadWhenHidden: true,
  },

  getScripts() {
    return [this.file('url.js')];
  },

  getStyles() {
    return [this.file('MMM-LiveX.css')];
  },

  start() {
    this.globe = null;
    this.iframe = null;
    this.unloaded = false;
    try {
      this.url = LivexUrl.livexUrl(this.config, globalThis.config);
    } catch (e) {
      this.error = e.message;
      Log.error(`${this.name}: ${e.message}`);
      return;
    }
    // A mirror runs for weeks; reloading now and then picks up livex's new releases and lets
    // the page start fresh. The data on the globe refreshes itself in between.
    if (this.config.reloadInterval > 0) {
      setInterval(() => this.reload(), Math.max(this.config.reloadInterval, 60 * 1000));
    }
  },

  getDom() {
    if (this.globe) return this.globe;
    const globe = document.createElement('div');
    globe.className = 'livex-globe';
    if (this.error) {
      globe.classList.add('livex-error', 'small', 'dimmed');
      globe.textContent = `MMM-LiveX: ${this.error}`;
      return globe;
    }

    const width = LivexUrl.cssLength(this.config.width);
    const height = LivexUrl.cssLength(this.config.height);
    if (width) globe.style.width = width;
    if (height) globe.style.height = height;
    else globe.style.aspectRatio = LivexUrl.aspectRatio(this.config.aspectRatio);
    if (this.config.interactive === false) globe.classList.add('livex-still');

    const iframe = document.createElement('iframe');
    iframe.title = 'livex.earth';
    iframe.allow = 'fullscreen';
    iframe.referrerPolicy = 'no-referrer';
    iframe.src = this.url;
    globe.append(iframe);
    this.globe = globe;
    this.iframe = iframe;
    return globe;
  },

  /** Loads the page again, unless it's hidden and unloaded. */
  reload() {
    if (!this.iframe || this.unloaded) return;
    this.iframe.src = this.url;
  },

  // Hidden (by a motion sensor's module, or pages), a WebGL page still draws; unloading it
  // leaves a Raspberry Pi's GPU to the modules on show, and it loads afresh when shown.
  suspend() {
    if (!this.iframe || !this.config.unloadWhenHidden) return;
    this.unloaded = true;
    this.iframe.src = 'about:blank';
  },

  resume() {
    if (!this.iframe || !this.unloaded) return;
    this.unloaded = false;
    this.iframe.src = this.url;
  },
});
