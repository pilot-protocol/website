// Native vertical scrolling and CSS snap points move a horizontal story. No
// wheel/touch interception or synthetic inertia. The unenhanced page is vertical.
const root = document.documentElement;
const story = document.querySelector<HTMLElement>('.teaser-story');
const stage = document.querySelector<HTMLElement>('.teaser-stage');
const track = document.querySelector<HTMLElement>('.teaser-track');
const panels = Array.from(document.querySelectorAll<HTMLElement>('.teaser-panel'));
const controls = document.querySelector<HTMLElement>('.teaser-controls');
const previous = document.querySelector<HTMLButtonElement>('[data-previous]');
const next = document.querySelector<HTMLButtonElement>('[data-next]');
const chapter = document.querySelector<HTMLElement>('[data-chapter]');
const status = document.querySelector<HTMLElement>('[data-story-status]');
const cue = document.querySelector<HTMLElement>('[data-scroll-cue]');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
let horizontal = false;
let active = 0;
let lastPainted = -1;
let stageHeight = 0;
let stageWidth = 0;
let startY = 0;
let pendingFrame = 0;

function setActive(index: number) {
  if (index === lastPainted) return;
  const changed = index !== active;
  active = index;
  lastPainted = index;
  root.dataset.tone = panels[index]?.dataset.tone || 'light';
  panels.forEach((panel, i) => {
    const inactive = horizontal && i !== index;
    if (inactive && panel.contains(document.activeElement)) stage?.focus({ preventScroll: true });
    panel.inert = inactive;
  });
  if (chapter) chapter.textContent = String(index + 1).padStart(2, '0');
  if (previous) previous.disabled = index === 0;
  if (next) next.disabled = index === panels.length - 1;
  if (cue) cue.textContent = index === panels.length - 1 ? 'More see you soon' : index === 0 ? 'Scroll to see how' : 'Keep scrolling';
  if (changed && status) status.textContent = `Chapter ${index + 1} of ${panels.length}: ${panels[index].dataset.name}`;
}

function paint() {
  pendingFrame = 0;
  if (!horizontal || !track || !stageHeight) return;
  const progress = Math.max(0, Math.min(panels.length - 1, (window.scrollY - startY) / stageHeight));
  track.style.transform = `translate3d(${-progress * stageWidth}px, 0, 0)`;
  stage?.style.setProperty('--progress', String(progress / (panels.length - 1)));
  panels.forEach((panel, i) => panel.style.setProperty('--travel', String(Math.max(-1, Math.min(1, progress - i)))));
  setActive(Math.round(progress));
}

function onScroll() {
  if (horizontal && !pendingFrame) pendingFrame = requestAnimationFrame(paint);
}

function goTo(index: number) {
  if (!horizontal) return;
  window.scrollTo({ top: startY + Math.max(0, Math.min(panels.length - 1, index)) * stageHeight, behavior: reducedMotion.matches ? 'instant' : 'smooth' });
}

function configure(keepPlace = false) {
  if (!story || !stage || !track || !controls) return;
  const wasHorizontal = horizontal;
  const priorIndex = !wasHorizontal && keepPlace
    ? panels.reduce((closest, panel, i) => Math.abs(panel.getBoundingClientRect().top) < Math.abs(panels[closest].getBoundingClientRect().top) ? i : closest, 0)
    : active;
  const priorProgress = wasHorizontal && stageHeight ? (window.scrollY - startY) / stageHeight : priorIndex;
  // Don't let a transient measurement layout become a new native snap position.
  root.classList.remove('teaser-snapping');
  // Small landscape windows and large text need a page that can grow naturally.
  const eligible = !reducedMotion.matches && window.innerHeight >= 660;
  horizontal = eligible;
  root.classList.toggle('teaser-horizontal', eligible);
  story.style.height = '';
  track.style.transform = '';
  controls.hidden = !eligible;
  panels.forEach(panel => { panel.inert = false; panel.style.removeProperty('--travel'); });
  lastPainted = -1;
  if (eligible) {
    stageHeight = stage.clientHeight;
    stageWidth = stage.clientWidth;
    // A panel's real content must fit. Fall back instead of clipping at zoom or
    // an unusually short viewport. Absolute decorative art isn't interactive.
    const overflow = panels.some(panel => {
      const inner = panel.querySelector<HTMLElement>('.panel-inner')!;
      const bounds = inner.getBoundingClientRect();
      const style = getComputedStyle(inner);
      const top = bounds.top + parseFloat(style.paddingTop);
      const bottom = bounds.bottom - parseFloat(style.paddingBottom);
      return inner.scrollHeight > inner.clientHeight + 2 || Array.from(inner.children).some(child => {
        if (getComputedStyle(child).position === 'absolute') return false;
        const box = child.getBoundingClientRect();
        // A little rotated decoration may extend past its grid cell.
        return box.top < top - 16 || box.bottom > bottom + 16;
      });
    });
    if (overflow) {
      horizontal = false;
      root.classList.remove('teaser-horizontal');
      controls.hidden = true;
    } else {
      story.style.setProperty('--teaser-step', `${stageHeight}px`);
      // The last snap target needs a full viewport of scroll room, including
      // when mobile browser chrome makes innerHeight differ from 100svh.
      story.style.height = `${stageHeight * (panels.length - 1) + window.innerHeight}px`;
      startY = story.getBoundingClientRect().top + window.scrollY;
    }
  }
  if (keepPlace) {
    if (horizontal) window.scrollTo({ top: startY + Math.round(wasHorizontal ? priorProgress : priorIndex) * stageHeight, behavior: 'instant' });
    else if (wasHorizontal) panels[priorIndex]?.scrollIntoView({ behavior: 'instant', block: 'start' });
  }
  if (horizontal) paint();
  else { root.dataset.tone = 'light'; panels.forEach(panel => panel.inert = false); }
  root.classList.toggle('teaser-snapping', horizontal);
}

if (story && stage && track && panels.length && controls) {
  // The visual panels share one sticky viewport, so they cannot be their own
  // vertical snap targets. Give the browser one fixed document target per panel.
  const snapPoints = document.createElement('div');
  snapPoints.className = 'teaser-snap-points';
  snapPoints.setAttribute('aria-hidden', 'true');
  panels.forEach((_, index) => {
    const point = document.createElement('div');
    point.className = 'teaser-snap-point';
    point.style.setProperty('--chapter', String(index));
    snapPoints.append(point);
  });
  story.prepend(snapPoints);
  stage.tabIndex = -1;
  stage.setAttribute('aria-label', 'Pilot story');
  previous?.addEventListener('click', () => goTo(active - 1));
  next?.addEventListener('click', () => goTo(active + 1));
  window.addEventListener('scroll', onScroll, { passive: true });
  document.addEventListener('keydown', event => {
    if (!horizontal || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
    if ((event.target as HTMLElement).closest('a, button, input, select, textarea, [contenteditable="true"]')) return;
    if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
      event.preventDefault();
      goTo(active + (event.key === 'ArrowRight' ? 1 : -1));
    }
  });
  document.querySelector('.teaser-skip')?.addEventListener('click', event => {
    event.preventDefault();
    stage.focus({ preventScroll: true });
    if (horizontal) goTo(0); else story.scrollIntoView();
  });
  let resizeFrame = 0;
  window.addEventListener('resize', () => {
    cancelAnimationFrame(resizeFrame);
    resizeFrame = requestAnimationFrame(() => configure(true));
  }, { passive: true });
  reducedMotion.addEventListener('change', () => configure(true));
  configure();
  // Fonts can change wrapping; don't assume the initial fallback font fits.
  document.fonts.ready.then(() => configure(true));
}

const examples = {
  plans: { ask: 'Dinner with Priya on Thursday?', agent: 'Priya’s Dots', logo: 'dots.webp', reply: 'After 7 works for Priya. How’s 7:30?', eyebrow: 'A plan, ready for your OK', title: 'Thursday, 7:30.', detail: 'Dinner with Priya. Finally.', action: 'Looks good', done: 'That’s a plan. See you Thursday!', approved: 'Plan approved · Example' },
  updates: { ask: 'Sam, how’s the launch coming along?', agent: 'Sam’s Hermes', logo: 'hermes.png', reply: 'Sam’s latest update: on track for Friday.', eyebrow: 'The answer, without the follow-up', title: 'Friday. On track.', detail: 'One less person to chase.', action: 'Got it', done: 'Update noted. Back to your day.', approved: 'Update received · Example' },
  intros: { ask: 'Does Priya know a good designer?', agent: 'Priya’s Dots', logo: 'dots.webp', reply: 'She knows Alex. Shall I ask if he’s open to an intro?', eyebrow: 'An introduction starts with permission', title: 'A good connection.', detail: 'Ask first. Connect when everyone agrees.', action: 'Ask Alex', done: 'The request goes to Alex. He gets to decide.', approved: 'Intro request · Example' },
  files: { ask: 'Send Sam the latest deck from this chat.', agent: 'Sam’s Hermes', logo: 'hermes.png', reply: 'Got it. I have the latest version for Sam.', eyebrow: 'The right file, in the right hands', title: 'Deck. Delivered.', detail: 'No hunting through old messages.', action: 'All sorted', done: 'The latest version is with Sam’s agent.', approved: 'File received · Example' },
};
type Example = keyof typeof examples;
let currentExample: Example = 'plans';
const exampleButtons = Array.from(document.querySelectorAll<HTMLButtonElement>('[data-example]'));
const approve = document.querySelector<HTMLButtonElement>('.result-approve');
function showExample(key: Example) {
  const example = examples[key];
  currentExample = key;
  for (const field of ['ask', 'agent', 'reply', 'eyebrow', 'title', 'detail'] as const) {
    const element = document.querySelector(`[data-example-${field}]`);
    if (element) element.textContent = example[field];
  }
  const logo = document.querySelector<HTMLImageElement>('[data-example-logo]');
  if (logo) logo.src = `/cloud/logos/${example.logo}`;
  exampleButtons.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.example === key)));
  if (approve) { approve.textContent = `${example.action} ✓`; approve.dataset.approved = 'false'; }
}
exampleButtons.forEach(button => button.addEventListener('click', () => showExample(button.dataset.example as Example)));
if (approve) {
  approve.hidden = false;
  approve.addEventListener('click', () => {
    if (approve.dataset.approved === 'true') { showExample(currentExample); return; }
    const example = examples[currentExample];
    const detail = document.querySelector('[data-example-detail]');
    const eyebrow = document.querySelector('[data-example-eyebrow]');
    if (detail) detail.textContent = example.done;
    if (eyebrow) eyebrow.textContent = example.approved;
    approve.textContent = 'Replay example ↺';
    approve.dataset.approved = 'true';
  });
}
const choices = document.querySelector<HTMLElement>('.example-choices');
if (choices) choices.hidden = false;

const identityButtons = Array.from(document.querySelectorAll<HTMLButtonElement>('[data-identity]'));
identityButtons.forEach(button => button.addEventListener('click', () => {
  const logo = document.querySelector<HTMLImageElement>('[data-identity-logo]');
  const name = document.querySelector('[data-identity-name]');
  if (logo) logo.src = `/cloud/logos/${button.dataset.logo}`;
  if (name) name.textContent = button.dataset.identity || '';
  identityButtons.forEach(other => other.setAttribute('aria-pressed', String(other === button)));
}));
const identityPicker = document.querySelector<HTMLElement>('.identity-picker');
if (identityPicker) identityPicker.hidden = false;

export {};
