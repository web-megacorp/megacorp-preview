(() => {
  'use strict';
  const enabled = matchMedia('(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)');
  let frame = 0;
  let x = 0;
  let y = 0;
  const hide = () => {
    cancelAnimationFrame(frame);
    frame = 0;
    document.body.classList.remove('ambient-cursor-active');
  };
  document.addEventListener('pointermove', event => {
    if (!enabled.matches || event.pointerType !== 'mouse') return;
    x = event.clientX;
    y = event.clientY;
    if (frame) return;
    frame = requestAnimationFrame(() => {
      frame = 0;
      document.body.style.setProperty('--ambient-x', `${x}px`);
      document.body.style.setProperty('--ambient-y', `${y}px`);
      document.body.classList.add('ambient-cursor-active');
    });
  }, {passive: true});
  document.documentElement.addEventListener('pointerleave', hide);
  window.addEventListener('blur', hide);
  document.addEventListener('visibilitychange', () => { if (document.hidden) hide(); });
  enabled.addEventListener('change', hide);
})();
