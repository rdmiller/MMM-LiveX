const { test } = require('node:test');
const assert = require('node:assert/strict');
const { livexParams, livexUrl, aspectRatio, cssLength, paramValue } = require('../url.js');

const DEFAULTS = {
  baseUrl: 'https://livex.earth/',
  width: '480px',
  height: '',
  aspectRatio: 1,
  interactive: true,
  reloadInterval: 86400000,
  unloadWhenHidden: true,
};

test('the defaults alone are the embedded globe on the local clock, without city names', () => {
  assert.equal(livexUrl(DEFAULTS), 'https://livex.earth/?clock=local&markers=0&embed=1');
});

test("MagicMirror's units and time format fill in", () => {
  const params = new URLSearchParams(livexUrl(DEFAULTS, { units: 'imperial', timeFormat: 12 }).split('?')[1]);
  assert.equal(params.get('units'), 'imperial');
  assert.equal(params.get('hours'), '12');
  const metric = new URLSearchParams(livexUrl(DEFAULTS, { units: 'metric', timeFormat: 24 }).split('?')[1]);
  assert.equal(metric.get('units'), 'metric');
  assert.equal(metric.get('hours'), '24');
});

test("an older config's units: 'default' (kelvin) leaves livex's own", () => {
  assert.ok(!livexUrl(DEFAULTS, { units: 'default' }).includes('units='));
});

test('every other key is a livex parameter, in the order written, and wins over the defaults', () => {
  const url = livexUrl({ ...DEFAULTS, lat: 44.98, lon: -93.27, mag: 2.6, radar: false, markers: true, embed: false, units: 'metric' }, { units: 'imperial' });
  assert.equal(url, 'https://livex.earth/?lat=44.98&lon=-93.27&mag=2.6&radar=0&markers=1&embed=0&units=metric&clock=local');
});

test("the module's own keys never reach the link", () => {
  const params = livexParams({ ...DEFAULTS, height: '300px', interactive: false });
  for (const [k] of params) assert.ok(!(k in DEFAULTS), k);
});

test('lists are joined with commas, and empty values are left out', () => {
  assert.equal(paramValue(['iss', 'gps']), 'iss,gps');
  assert.equal(paramValue(null), undefined);
  assert.equal(paramValue(Number.NaN), undefined);
  assert.equal(paramValue({ a: 1 }), undefined);
});

test('baseUrl points at another host, and must be http(s)', () => {
  assert.equal(livexUrl({ baseUrl: 'http://localhost:4173/' }), 'http://localhost:4173/?clock=local&markers=0&embed=1');
  assert.throws(() => livexUrl({ baseUrl: 'javascript:alert(1)' }), /http or https/);
  assert.throws(() => livexUrl({ baseUrl: 'livex.earth' }), /isn't a URL/);
});

test('aspect ratios are written as CSS wants them', () => {
  assert.equal(aspectRatio(undefined), '1');
  assert.equal(aspectRatio(1.5), '1.5');
  assert.equal(aspectRatio('16:9'), '16 / 9');
  assert.equal(aspectRatio('4/3'), '4 / 3');
  assert.equal(aspectRatio('0'), '1');
  assert.equal(aspectRatio('wide'), '1');
});

test('a width or height is pixels as a number, or any CSS length as a string', () => {
  assert.equal(cssLength(480), '480px');
  assert.equal(cssLength('100vw'), '100vw');
  assert.equal(cssLength(''), '');
  assert.equal(cssLength(0), '');
});
