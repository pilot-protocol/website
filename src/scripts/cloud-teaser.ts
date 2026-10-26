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
const progressFill = document.querySelector<HTMLElement>('.story-progress > span');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const touchDevice = window.matchMedia('(hover: none), (pointer: coarse)');
// Let the browser's scrolling thread move the picture, including on iOS.
// Syntax support alone is insufficient: verify the actual track after a scroll
// settles and permanently fall back if a browser accepts but stalls the timeline.
let nativeTimeline = CSS.supports('animation-timeline', 'scroll(root block)') && CSS.supports('animation-range', '0px 1px');
let horizontal = false;
let active = 0;
let lastPainted = -1;
let stageHeight = 0;
let stageWidth = 0;
let startY = 0;
let pendingFrame = 0;
let timelineCheck = 0;

function scrollProgress() {
  return Math.max(0, Math.min(panels.length - 1, (window.scrollY - startY) / stageHeight));
}

function verifyTimeline() {
  timelineCheck = 0;
  if (!horizontal || !nativeTimeline || !track || !stageHeight) return;
  const expectedX = -scrollProgress() * stageWidth;
  const transform = getComputedStyle(track).transform;
  const values = transform.match(/^matrix(3d)?\(([^)]+)\)$/);
  const actualX = values ? Number(values[2].split(',')[values[1] ? 12 : 4]) : 0;
  if (!Number.isFinite(actualX) || Math.abs(actualX - expectedX) > 4) {
    nativeTimeline = false;
    root.classList.remove('teaser-native');
    paint();
  }
}

function setActive(index: number) {
  if (index === lastPainted) return;
  const changed = index !== active;
  active = index;
  lastPainted = index;
  root.dataset.tone = panels[index]?.dataset.tone || 'light';
  root.dataset.chapter = String(index);
  if (progressFill && touchDevice.matches) progressFill.style.transform = `translateX(${index * 100}%)`;
  panels.forEach((panel, i) => {
    const inactive = horizontal && i !== index;
    if (inactive && panel.contains(document.activeElement)) stage?.focus({ preventScroll: true });
    panel.inert = inactive;
  });
  if (chapter) chapter.textContent = String(index + 1).padStart(2, '0');
  if (previous) previous.disabled = index === 0;
  if (next) next.disabled = index === panels.length - 1;
  if (cue) cue.textContent = index === panels.length - 1 ? 'Take your life back' : index === 0 ? 'Scroll to see how' : 'Keep scrolling';
  if (changed && status) status.textContent = `Chapter ${index + 1} of ${panels.length}: ${panels[index].dataset.name}`;
}

function paint() {
  pendingFrame = 0;
  if (!horizontal || !track || !stageHeight) return;
  const progress = scrollProgress();
  // Supported browsers animate the track on their scroll timeline. The JS
  // fallback changes one transform, never inherited styles on every panel.
  if (!nativeTimeline) track.style.transform = `translate3d(${-progress * stageWidth}px, 0, 0)`;
  if (progressFill && !touchDevice.matches) progressFill.style.transform = `translateX(${progress * 100}%)`;
  setActive(Math.round(progress));
}

function onScroll() {
  if (!horizontal) return;
  if (!pendingFrame) pendingFrame = requestAnimationFrame(paint);
  if (nativeTimeline) {
    window.clearTimeout(timelineCheck);
    // No style/layout reads while the finger or native momentum is moving.
    // The timeout also covers older browsers without a scrollend event.
    timelineCheck = window.setTimeout(verifyTimeline, 160);
  }
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
  root.classList.remove('teaser-snapping', 'teaser-native');
  // Small landscape windows and large text need a page that can grow naturally.
  const eligible = !reducedMotion.matches && window.innerHeight >= 600;
  horizontal = eligible;
  root.classList.toggle('teaser-horizontal', eligible);
  story.style.height = '';
  track.style.transform = '';
  controls.hidden = !eligible;
  panels.forEach(panel => { panel.inert = false; });
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
      story.style.setProperty('--teaser-distance', `${stageHeight * (panels.length - 1)}px`);
      story.style.setProperty('--teaser-shift', `${-stageWidth * (panels.length - 1)}px`);
      // Reserve the large viewport once. Collapsing mobile browser chrome must
      // not rebuild the story or make the last chapter unreachable.
      story.style.height = `calc(${stageHeight * (panels.length - 1)}px + 100lvh)`;
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
  root.classList.toggle('teaser-native', horizontal && nativeTimeline);
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
  let resizeTimer = 0;
  let viewportWidth = window.innerWidth;
  let viewportHeight = window.innerHeight;
  window.addEventListener('resize', () => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    if (width === viewportWidth && (touchDevice.matches || height === viewportHeight)) return;
    viewportWidth = width;
    viewportHeight = height;
    window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(() => configure(true), 150);
  }, { passive: true });
  reducedMotion.addEventListener('change', () => configure(true));
  configure();
  // Fonts can change wrapping; don't assume the initial fallback font fits.
  document.fonts.ready.then(() => configure(true));
}

// A local illustration, not a booking or a message sent to another person.
const approve = document.querySelector<HTMLButtonElement>('.result-approve');
if (approve) {
  approve.hidden = false;
  approve.addEventListener('click', () => {
    const approved = approve.dataset.approved !== 'true';
    approve.dataset.approved = String(approved);
    const buttonLabel = approve.querySelector('[data-approve-label]');
    if (buttonLabel) buttonLabel.textContent = approved ? 'Replay example' : 'Looks good';
    approve.querySelector<HTMLElement>('[data-approve-check]')!.hidden = approved;
    approve.querySelector<HTMLElement>('[data-approve-replay]')!.hidden = !approved;
    const label = document.querySelector('.result-label');
    if (label) label.textContent = approved ? 'Approved by you. See you Thursday!' : 'Coffee with Priya';
  });
}

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
