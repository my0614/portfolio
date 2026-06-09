'use client';
import { useRef, useEffect } from 'react';

let __revealProbe: boolean | null = null;
function transitionsTick() {
  if (__revealProbe !== null) return __revealProbe;
  try {
    const d = document.createElement('div');
    d.style.cssText = 'position:absolute;left:-9999px;opacity:0;transition:opacity .05s linear';
    document.body.appendChild(d);
    void d.offsetWidth;
    d.style.opacity = '1';
    const v = parseFloat(getComputedStyle(d).opacity);
    __revealProbe = v > 0 && v < 1;
    document.body.removeChild(d);
  } catch (e) { __revealProbe = false; }
  return __revealProbe;
}

export function useReveal() {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const items = el.classList.contains('reveal')
      ? [el]
      : Array.from(el.querySelectorAll<HTMLElement>('.reveal'));
    const animate = transitionsTick() && !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!animate) return;
    document.documentElement.classList.add('reveal-ready');
    let pending = items.slice();
    const revealVisible = () => {
      const vh = window.innerHeight || 800;
      pending = pending.filter(i => {
        const r = i.getBoundingClientRect();
        if (r.top < vh * 0.9 && r.bottom > 0) { i.classList.add('in'); return false; }
        return true;
      });
      if (!pending.length) cleanup();
    };
    const onScroll = () => revealVisible();
    const cleanup = () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    const t0 = setTimeout(revealVisible, 40);
    const t1 = setTimeout(() => { pending.forEach(i => i.classList.add('in')); cleanup(); }, 2400);
    return () => { clearTimeout(t0); clearTimeout(t1); cleanup(); };
  }, []);
  return ref;
}
