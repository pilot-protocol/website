export const motionChangeEvent = 'pilot:motion-change';

export const motionEnabled = () => document.documentElement.dataset.motion === 'running';

const activeAnimations = new Set<Animation>();

export function animateArrival(element: Element, delay = 0) {
  if (!motionEnabled() || document.hidden || typeof element.animate !== 'function') return;
  const animation = element.animate([
    { transform: 'translateY(18px)' },
    { transform: 'translateY(0)' },
  ], { duration: 650, delay, easing: 'cubic-bezier(.16, 1, .3, 1)' });
  activeAnimations.add(animation);
  animation.onfinish = animation.oncancel = () => activeAnimations.delete(animation);
}

export function greetPuppy(element: Element) {
  if (!motionEnabled() || document.hidden || typeof element.animate !== 'function') return;
  const animation = element.animate([
    { transform: 'translateY(0) rotate(0)' },
    { transform: 'translateY(-8px) rotate(-5deg)', offset: .3 },
    { transform: 'translateY(-3px) rotate(4deg)', offset: .55 },
    { transform: 'translateY(-5px) rotate(-2deg)', offset: .75 },
    { transform: 'translateY(0) rotate(0)' },
  ], { duration: 1000, easing: 'ease-in-out' });
  activeAnimations.add(animation);
  animation.onfinish = animation.oncancel = () => activeAnimations.delete(animation);
}

export function initCloudMotion() {
  const root = document.documentElement;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const control = document.querySelector<HTMLButtonElement>('[data-motion-toggle]');
  const controller = new AbortController();
  const options = { signal: controller.signal };
  const videos = [...document.querySelectorAll<HTMLVideoElement>('[data-motion-video]')];
  let activeScene: HTMLElement | null = null;
  let paused = false;
  try { paused = localStorage.getItem('pilot-cloud-motion') === 'paused'; } catch { /* Private browsing still works. */ }
  const cancelAnimations = () => activeAnimations.forEach((animation) => animation.cancel());
  const syncVideos = () => videos.forEach((video) => {
    if (!motionEnabled() || document.hidden || !activeScene?.contains(video)) {
      video.pause();
      return;
    }
    // Keep the poster visible without fetching video until its scene is active.
    if (!video.dataset.loaded) {
      video.querySelectorAll<HTMLSourceElement>('source[data-src]').forEach((source) => { source.src = source.dataset.src!; });
      video.muted = true;
      video.load();
      video.dataset.loaded = 'true';
    }
    void video.play().catch(() => { /* A blocked autoplay keeps the static poster. */ });
  });
  const update = () => {
    const enabled = !paused && !reducedMotion.matches;
    root.dataset.motion = enabled ? 'running' : 'paused';
    root.dataset.pageVisible = String(!document.hidden);
    if (!enabled || document.hidden) cancelAnimations();
    syncVideos();
    if (control) {
      control.hidden = false;
      control.disabled = reducedMotion.matches;
      const label = reducedMotion.matches ? 'Reduced motion is enabled on your device' : enabled ? 'Reduce motion' : 'Enable motion';
      control.setAttribute('aria-label', label);
      control.textContent = label;
      control.title = label;
    }
    document.dispatchEvent(new CustomEvent(motionChangeEvent, { detail: { enabled } }));
  };
  control?.addEventListener('click', () => {
    paused = !paused;
    try { localStorage.setItem('pilot-cloud-motion', paused ? 'paused' : 'running'); } catch { /* Session-only preference is fine. */ }
    update();
  }, options);
  reducedMotion.addEventListener('change', update, options);
  document.addEventListener('visibilitychange', update, options);
  update();

  // Content stays visible in HTML/CSS. Entrances are temporary animations, never
  // an opacity-zero gate that could strand content if JS or observation fails.
  const arrivals = [...document.querySelectorAll<HTMLElement>('.hero-copy, .hero-story, .compatibility, .proof-card, .section-intro, .step, .together-copy, .identity-demo, .reassurance > div, .faq-intro, .faq-list, .close-card')];
  const observer = new IntersectionObserver((entries) => entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    observer.unobserve(entry.target);
    const siblings = entry.target.matches('.step, .reassurance > div') ? [...entry.target.parentElement!.children] : [entry.target];
    animateArrival(entry.target, siblings.indexOf(entry.target) * 85);
    const puppy = entry.target.querySelector('.step-top img, .faq-intro > img');
    if (puppy) greetPuppy(puppy);
  }), { threshold: .12, rootMargin: '0px 0px -20px 0px' });
  arrivals.forEach((element) => observer.observe(element));

  // Only one decorative scene loops at a time, and only while it is visible.
  const scenes = [...document.querySelectorAll<HTMLElement>('.hero-story, .profile-avatar, .close-card')];
  const visibility = new Map<Element, number>();
  const ambient = new IntersectionObserver((entries) => {
    entries.forEach((entry) => visibility.set(entry.target, entry.isIntersecting ? entry.intersectionRatio : 0));
    const nearest = [...visibility].sort((a, b) => b[1] - a[1])[0];
    activeScene = nearest && nearest[1] > 0 ? nearest[0] as HTMLElement : null;
    scenes.forEach((scene) => scene.classList.toggle('is-ambient', activeScene === scene));
    syncVideos();
  }, { threshold: [0, .1, .25, .5, .75, 1] });
  scenes.forEach((scene) => ambient.observe(scene));

  document.querySelectorAll<HTMLElement>('.step, .identity-card, .faq-intro').forEach((card) => {
    card.addEventListener('pointerenter', (event) => {
      if (event.pointerType === 'touch') return;
      const puppy = card.querySelector('.profile-avatar') ?? card.querySelector('img[src*="/pups/"]');
      if (puppy) greetPuppy(puppy);
    }, options);
  });
  document.addEventListener('astro:before-swap', () => {
    cancelAnimations();
    observer.disconnect();
    ambient.disconnect();
    videos.forEach((video) => video.pause());
    controller.abort();
  }, { once: true, signal: controller.signal });
}
