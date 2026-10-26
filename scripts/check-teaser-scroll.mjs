// Regression checks for the actual scroll script: mobile toolbar resizes must
// not reset the story, and scroll frames must not invalidate every panel.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { stripTypeScriptTypes } from 'node:module';
import vm from 'node:vm';

const source = stripTypeScriptTypes(readFileSync(new URL('../src/scripts/cloud-teaser.ts', import.meta.url), 'utf8')).replace('export {};', '');
for (const { nativeSupport, touch } of [
  { nativeSupport: true, touch: true }, // iPhone Safari: verify motion, not just syntax.
  { nativeSupport: false, touch: true },
  { nativeSupport: true, touch: false },
  { nativeSupport: false, touch: false },
]) {
  const nativeTimeline = nativeSupport;
  const writes = [];
  const resets = [];
  const scrolls = [];
  const events = {};
  const frames = [];
  let timer;
  let timelineStalled = false;
  let transformReads = 0;
  const style = () => new Proxy({ setProperty(key, value) { writes.push([key, value]); }, removeProperty() {} }, { set(target, key, value) { writes.push([key, value]); target[key] = value; return true; } });
  const element = () => ({ style: style(), dataset: {}, hidden: false, inert: false, contains: () => false, setAttribute() {}, addEventListener() {}, append() {}, prepend() {}, focus() {}, scrollIntoView() {} });
  const root = element();
  const classes = new Set();
  root.classList = { toggle(key, on) { on ? classes.add(key) : classes.delete(key); }, remove(...keys) { resets.push(keys); keys.forEach(key => classes.delete(key)); } };
  const stage = { ...element(), clientHeight: 660, get clientWidth() { return browser.innerWidth; } };
  const story = { ...element(), getBoundingClientRect: () => ({ top: -browser.scrollY }) };
  const track = element();
  const panels = Array.from({ length: 7 }, (_, i) => ({ ...element(), dataset: { name: `Scene ${i}`, tone: 'light' }, querySelector: () => ({ clientHeight: 660, scrollHeight: 660, getBoundingClientRect: () => ({ top: 0, bottom: 660 }), children: [{ getBoundingClientRect: () => ({ top: 150, bottom: 250 }) }] }) }));
  const reduced = { matches: false, addEventListener(type, callback) { this.change = callback; } };
  const browser = { innerWidth: 390, innerHeight: 700, scrollY: 0, matchMedia: query => query.includes('reduced') ? reduced : { matches: touch }, addEventListener: (name, fn) => { events[name] = fn; }, scrollTo: options => { scrolls.push(options); browser.scrollY = options.top; }, clearTimeout() { timer = undefined; }, setTimeout(fn) { timer = fn; return 1; } };
  const nodes = { '.teaser-story': story, '.teaser-stage': stage, '.teaser-track': track, '.teaser-controls': element(), '[data-previous]': element(), '[data-next]': element(), '[data-chapter]': element(), '[data-story-status]': element(), '[data-scroll-cue]': element(), '.story-progress > span': element() };
  const document = { documentElement: root, activeElement: null, querySelector: selector => nodes[selector] ?? null, querySelectorAll: selector => selector === '.teaser-panel' ? panels : [], createElement: element, addEventListener() {}, fonts: { ready: Promise.resolve() } };
  vm.runInNewContext(source, { document, window: browser, CSS: { supports: () => nativeSupport }, requestAnimationFrame: fn => frames.push(fn), getComputedStyle: node => {
    if (node === track) {
      transformReads++;
      const x = timelineStalled ? 0 : -(browser.scrollY / stage.clientHeight) * browser.innerWidth;
      return { transform: touch ? `matrix3d(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, ${x}, 0, 0, 1)` : `matrix(1, 0, 0, 1, ${x}, 0)` };
    }
    return { paddingTop: '80', paddingBottom: '80', position: 'static' };
  } });
  await Promise.resolve();
  assert.equal(classes.has('teaser-horizontal'), true);
  assert.equal(classes.has('teaser-native'), nativeTimeline);
  writes.length = resets.length = scrolls.length = 0;
  if (touch) {
    for (let i = 0; i < 50; i++) { browser.innerHeight = 700 + i; events.resize(); }
    assert.equal(timer, undefined, 'toolbar-only resize must not schedule a layout reset');
  }
  assert.equal(resets.length, 0);
  assert.equal(scrolls.length, 0, 'toolbar resize must not jump or snap the page');
  for (let i = 0; i < 30; i++) { browser.scrollY = i * 8; events.scroll(); frames.splice(0).forEach(fn => fn()); }
  assert.equal(writes.some(([key]) => key.startsWith('--')), false, 'scroll must not write inherited custom properties');
  assert.equal(writes.length, (nativeTimeline ? 0 : 30) + (touch ? 0 : 30), 'only track and desktop progress transforms may change');
  assert.equal(transformReads, 0, 'native movement must not read computed transforms while scrolling');
  if (nativeTimeline) {
    timer();
    assert.equal(transformReads, 1, 'check the actual picture after scrolling settles');
    assert.equal(classes.has('teaser-native'), true, 'a working timeline stays native on touch and desktop');
  }
  for (let index = 1; index < panels.length; index++) {
    browser.scrollY = index * stage.clientHeight;
    events.scroll();
    frames.splice(0).forEach(fn => fn());
    if (!nativeTimeline) assert.equal(track.style.transform, `translate3d(${-index * browser.innerWidth}px, 0, 0)`, 'scrolling must actually move the visible slide, even when touch browsers report timeline support');
    assert.equal(root.dataset.chapter, String(index));
    assert.equal(nodes['.story-progress > span'].style.transform, `translateX(${index * 100}%)`, 'the progress marker must follow the visible chapter');
    assert.equal(nodes['[data-chapter]'].textContent, String(index + 1).padStart(2, '0'));
    assert.equal(panels.every((panel, i) => panel.inert === (i !== index)), true);
  }
  assert.equal(nodes['[data-next]'].disabled, true, 'the final CTA chapter must be reachable');
  browser.innerWidth = 430;
  events.resize();
  assert.equal(typeof timer, 'function', 'a real width change must remeasure the layout');
  timer();
  assert.equal(scrolls.length, 1);
  assert.equal(browser.scrollY, (panels.length - 1) * stage.clientHeight, 'a width change preserves the final chapter');
  if (nativeTimeline) {
    timelineStalled = true;
    events.scroll();
    frames.splice(0).forEach(fn => fn());
    timer();
    assert.equal(classes.has('teaser-native'), false, 'a stalled native timeline must fall back, even when CSS syntax is supported');
    assert.equal(track.style.transform, `translate3d(${-6 * browser.innerWidth}px, 0, 0)`, 'repair the picture immediately without resetting scroll or chapter');
    assert.equal(nodes['[data-chapter]'].textContent, '07');
    browser.scrollY = 5 * stage.clientHeight;
    events.scroll();
    frames.splice(0).forEach(fn => fn());
    assert.equal(track.style.transform, `translate3d(${-5 * browser.innerWidth}px, 0, 0)`, 'fallback must keep following subsequent gestures');
  }
  reduced.matches = true;
  reduced.change();
  assert.equal(classes.has('teaser-horizontal'), false);
  assert.equal(classes.has('teaser-native'), false);
  assert.equal(panels.every(panel => !panel.inert), true);
}
console.log('Teaser scroll checks passed: native touch/desktop motion, no per-frame touch style writes, stalled-timeline recovery, unsupported fallback, toolbar resizing, width changes, reduced motion.');
