// The livex.earth link a mirror shows: every key in the module's config that isn't the module's
// own becomes a URL parameter, so any view livex.earth can show, a mirror can too, including
// parameters added to livex after this module was released. Where the config is silent, the
// module asks for livex's embedded view (just the globe; `embed: false` brings the full page
// back) without city names, and fills in what MagicMirror's own config already says: its units
// and its clock.
//
// MagicMirror loads this as a plain script in the page (LivexUrl); the tests require it in Node.

(function (root) {
  const DEFAULT_BASE = 'https://livex.earth/';

  /** The keys the module reads itself, which never go into the link. */
  const MODULE_KEYS = new Set([
    'baseUrl', 'width', 'height', 'aspectRatio', 'interactive', 'reloadInterval', 'unloadWhenHidden',
  ]);

  /** A config value as a parameter: `true`/`false` are 1/0, a list is joined with commas. */
  function paramValue(v) {
    if (v === null || v === undefined) return undefined;
    if (typeof v === 'boolean') return v ? '1' : '0';
    if (typeof v === 'number') return Number.isFinite(v) ? String(v) : undefined;
    if (typeof v === 'string') return v;
    if (Array.isArray(v)) return v.map(String).join(',');
    return undefined;
  }

  /**
   * The livex parameters a config sets, in its order, with MagicMirror's own settings where it's
   * silent. `mm` is MagicMirror's global config (`units`, `timeFormat`).
   */
  function livexParams(config, mm) {
    const out = [];
    const set = new Set();
    for (const [key, raw] of Object.entries(config || {})) {
      if (MODULE_KEYS.has(key)) continue;
      const v = paramValue(raw);
      if (v === undefined) continue;
      out.push([key, v]);
      set.add(key);
    }

    const units = mm && mm.units;
    if (!set.has('units') && (units === 'metric' || units === 'imperial')) out.push(['units', units]);
    const hours = mm && String(mm.timeFormat);
    if (!set.has('hours') && (hours === '12' || hours === '24')) out.push(['hours', hours]);
    if (!set.has('clock')) out.push(['clock', 'local']);
    if (!set.has('markers')) out.push(['markers', '0']);
    if (!set.has('embed')) out.push(['embed', '1']);
    return out;
  }

  /** The base must be an http(s) URL; anything else is a config error. */
  function baseUrl(config) {
    const base = (config && config.baseUrl) || DEFAULT_BASE;
    let url;
    try {
      url = new URL(base);
    } catch {
      throw new Error(`baseUrl isn't a URL: ${base}`);
    }
    if (url.protocol !== 'https:' && url.protocol !== 'http:') throw new Error(`baseUrl must be http or https: ${base}`);
    return url;
  }

  function livexUrl(config, mm) {
    const url = baseUrl(config);
    for (const [k, v] of livexParams(config, mm)) url.searchParams.set(k, v);
    return url.toString();
  }

  /** CSS `aspect-ratio` from `16:9`, `16/9`, `1.5` or a number. */
  function aspectRatio(v) {
    if (v === undefined || v === null || v === '') return '1';
    if (typeof v === 'number') return v > 0 ? String(v) : '1';
    const s = String(v).trim();
    const pair = /^(\d+(?:\.\d+)?)\s*[:/x]\s*(\d+(?:\.\d+)?)$/.exec(s);
    if (pair) return Number(pair[2]) > 0 ? `${pair[1]} / ${pair[2]}` : '1';
    return Number(s) > 0 ? s : '1';
  }

  /** A CSS length from a number of pixels or a string as written (`480px`, `100vw`). */
  function cssLength(v) {
    if (typeof v === 'number') return v > 0 ? `${v}px` : '';
    return typeof v === 'string' ? v.trim() : '';
  }

  const api = { DEFAULT_BASE, MODULE_KEYS, paramValue, livexParams, baseUrl, livexUrl, aspectRatio, cssLength };
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.LivexUrl = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
