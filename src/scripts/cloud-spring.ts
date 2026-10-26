import { motionChangeEvent, motionEnabled } from './cloud-motion';

// A damped spring with an exact solution. Retargeting keeps position and velocity;
// rendering frequency doesn't change its feel. Units are seconds, with mass = 1.
export function stepSpring(position: number, velocity: number, target: number, dt: number, stiffness = 280, damping = 26) {
  const decay = damping / 2;
  const frequency = Math.sqrt(stiffness - decay * decay);
  const displacement = position - target;
  const coefficient = (velocity + decay * displacement) / frequency;
  const envelope = Math.exp(-decay * dt);
  const cosine = Math.cos(frequency * dt);
  const sine = Math.sin(frequency * dt);
  const wave = displacement * cosine + coefficient * sine;
  return {
    position: target + envelope * wave,
    velocity: envelope * ((coefficient * frequency - decay * displacement) * cosine - (displacement * frequency + decay * coefficient) * sine),
  };
}

export function attachSpringFeedback(elements: NodeListOf<HTMLElement>) {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const controller = new AbortController();
  const options = { signal: controller.signal };
  const states = [...elements].map((element) => {
    element.dataset.spring = '';
    return { element, hovered: false, pressed: false, y: 0, vy: 0, scale: 1, vs: 0 };
  });
  let frame = 0;
  let previousTime = 0;

  const draw = (state: typeof states[number]) => {
    state.element.style.setProperty('--spring-y', `${state.y.toFixed(3)}px`);
    state.element.style.setProperty('--spring-scale', state.scale.toFixed(5));
  };
  const tick = (time: number) => {
    // Clamp a stalled frame rather than letting background-tab time drive motion.
    const dt = Math.min((time - previousTime) / 1000, 0.064);
    previousTime = time;
    let moving = false;
    states.forEach((state) => {
      const targetY = state.pressed ? 1 : state.hovered ? -2 : 0;
      const targetScale = state.pressed ? 0.97 : state.hovered ? 1.012 : 1;
      const y = stepSpring(state.y, state.vy, targetY, dt);
      const scale = stepSpring(state.scale, state.vs, targetScale, dt);
      state.y = y.position;
      state.vy = y.velocity;
      state.scale = scale.position;
      state.vs = scale.velocity;
      const settled = Math.abs(targetY - state.y) < 0.005 && Math.abs(state.vy) < 0.02 && Math.abs(targetScale - state.scale) < 0.0001 && Math.abs(state.vs) < 0.001;
      if (settled) {
        state.y = targetY;
        state.scale = targetScale;
        state.vy = state.vs = 0;
        delete state.element.dataset.springMoving;
      } else {
        moving = true;
        state.element.dataset.springMoving = '';
      }
      draw(state);
    });
    frame = moving ? requestAnimationFrame(tick) : 0;
  };
  const start = () => {
    if (frame || !motionEnabled() || reducedMotion.matches || document.hidden) return;
    previousTime = performance.now();
    frame = requestAnimationFrame(tick);
  };
  const release = () => {
    states.forEach((state) => { state.pressed = false; });
    start();
  };
  const reset = () => {
    cancelAnimationFrame(frame);
    frame = 0;
    states.forEach((state) => {
      state.hovered = state.pressed = false;
      state.y = state.vy = state.vs = 0;
      state.scale = 1;
      delete state.element.dataset.springMoving;
      draw(state);
    });
  };

  states.forEach((state) => {
    const { element } = state;
    element.addEventListener('pointerenter', (event) => {
      state.hovered = event.pointerType !== 'touch';
      start();
    }, options);
    element.addEventListener('pointerleave', () => {
      state.hovered = state.pressed = false;
      start();
    }, options);
    element.addEventListener('pointerdown', (event) => {
      if (!event.isPrimary || event.button !== 0 || element.matches(':disabled')) return;
      state.pressed = true;
      start();
    }, options);
    element.addEventListener('keydown', (event) => {
      if (event.key !== 'Enter' && event.key !== ' ') return;
      state.pressed = true;
      start();
    }, options);
    element.addEventListener('blur', () => {
      state.pressed = false;
      start();
    }, options);
  });
  window.addEventListener('pointerup', release, options);
  window.addEventListener('pointercancel', release, options);
  window.addEventListener('keyup', release, options);
  window.addEventListener('blur', reset, options);
  document.addEventListener('visibilitychange', reset, options);
  reducedMotion.addEventListener('change', reset, options);
  document.addEventListener(motionChangeEvent, reset, options);
  document.addEventListener('astro:before-swap', () => {
    reset();
    controller.abort();
  }, { once: true, signal: controller.signal });
}
