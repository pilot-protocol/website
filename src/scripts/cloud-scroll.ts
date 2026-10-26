import { stepSpring } from './cloud-spring';
import { motionChangeEvent, motionEnabled } from './cloud-motion';

// Animate the document's real scroll position. No translated page wrapper, touch
// interception, artificial scrollbars, or continuously running animation loop.
export function attachSpringScroll() {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
  const controller = new AbortController();
  const options = { signal: controller.signal };
  const originalScrollBehavior = document.documentElement.style.scrollBehavior;
  let frame = 0;
  let previousTime = 0;
  let position = window.scrollY;
  let target = position;
  let velocity = 0;

  const limit = () => Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
  const clamp = (value: number) => Math.max(0, Math.min(limit(), value));
  const stop = () => {
    cancelAnimationFrame(frame);
    frame = 0;
    position = target = window.scrollY;
    velocity = 0;
    document.documentElement.style.scrollBehavior = originalScrollBehavior;
  };
  const tick = (time: number) => {
    const dt = Math.min((time - previousTime) / 1000, 0.064);
    previousTime = time;
    target = clamp(target);
    // Almost critically damped: a soft landing without a bouncing reading surface.
    const next = stepSpring(position, velocity, target, dt, 170, 26);
    position = clamp(next.position);
    velocity = next.velocity;
    if (Math.abs(target - position) < 0.3 && Math.abs(velocity) < 3) {
      window.scrollTo({ top: target, behavior: 'instant' });
      frame = 0;
      velocity = 0;
      document.documentElement.style.scrollBehavior = originalScrollBehavior;
      return;
    }
    window.scrollTo({ top: position, behavior: 'instant' });
    frame = requestAnimationFrame(tick);
  };
  const start = () => {
    if (frame) return;
    document.documentElement.style.scrollBehavior = 'auto';
    previousTime = performance.now();
    frame = requestAnimationFrame(tick);
  };
  const nestedScroll = (element: Element | null, delta: number) => {
    for (let node = element; node && node !== document.body; node = node.parentElement) {
      if (!(node instanceof HTMLElement)) continue;
      if (node.matches('textarea, select, input, [contenteditable="true"], [data-native-scroll], [role="dialog"]')) return true;
      if (node.scrollHeight <= node.clientHeight + 1 || !/(auto|scroll)/.test(getComputedStyle(node).overflowY)) continue;
      if (delta < 0 ? node.scrollTop > 0 : node.scrollTop + node.clientHeight < node.scrollHeight - 1) return true;
    }
    return false;
  };

  window.addEventListener('wheel', (event) => {
    if (document.hidden || !motionEnabled() || reducedMotion.matches || !finePointer.matches || event.ctrlKey || event.metaKey || event.shiftKey || !event.cancelable || event.defaultPrevented || Math.abs(event.deltaX) > Math.abs(event.deltaY)) {
      stop();
      return;
    }
    const delta = event.deltaY * (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? window.innerHeight : 1);
    if (!delta || nestedScroll(event.target instanceof Element ? event.target : null, delta)) {
      stop();
      return;
    }
    // Let the browser handle its own edge bounce once the document reaches an edge.
    if ((window.scrollY <= 0 && delta < 0) || (window.scrollY >= limit() - 1 && delta > 0)) {
      stop();
      return;
    }
    if (!frame) position = target = window.scrollY;
    event.preventDefault();
    target = clamp(target + delta);
    start();
  }, { ...options, passive: false });

  document.addEventListener('click', (event) => {
    if (document.hidden || !motionEnabled() || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || reducedMotion.matches) return;
    const link = event.target instanceof Element ? event.target.closest<HTMLAnchorElement>('a[href^="#"]') : null;
    if (!link || link.target || link.hasAttribute('download')) return;
    const id = link.getAttribute('href')?.slice(1);
    const destination = id ? document.getElementById(id) : null;
    if (!destination) return;
    event.preventDefault();
    if (!frame) position = window.scrollY;
    const offset = parseFloat(getComputedStyle(destination).scrollMarginTop) || 0;
    target = clamp(window.scrollY + destination.getBoundingClientRect().top - offset);
    if (!destination.hasAttribute('tabindex')) {
      destination.setAttribute('tabindex', '-1');
      destination.addEventListener('blur', () => destination.removeAttribute('tabindex'), { once: true });
    }
    destination.focus({ preventScroll: true });
    if (window.location.hash !== `#${id}`) history.pushState(null, '', `#${id}`);
    start();
  }, options);

  // Direct manipulation and keyboard navigation always take over immediately.
  window.addEventListener('pointerdown', stop, { ...options, passive: true });
  window.addEventListener('touchstart', stop, { ...options, passive: true });
  window.addEventListener('keydown', (event) => {
    if (['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End', ' ', 'Escape', 'Tab'].includes(event.key)) stop();
  }, options);
  window.addEventListener('popstate', stop, options);
  window.addEventListener('resize', stop, options);
  document.addEventListener('visibilitychange', stop, options);
  reducedMotion.addEventListener('change', stop, options);
  finePointer.addEventListener('change', stop, options);
  document.addEventListener(motionChangeEvent, stop, options);
  document.addEventListener('astro:before-swap', () => {
    stop();
    controller.abort();
  }, { once: true, signal: controller.signal });
}
