'use client';
import { useRef, useState, useEffect } from 'react';

export function useScrolled(threshold = 40) {
  const ref = useRef<HTMLDivElement>(null);
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onScroll = () => setScrolled(el.scrollTop > threshold);
    el.addEventListener('scroll', onScroll, { passive: true });
    return () => el.removeEventListener('scroll', onScroll);
  }, [threshold]);
  return [ref, scrolled] as const;
}

export function useReveal() {
  const ref = useRef<HTMLDivElement>(null);
  const [on, setOn] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (el) {
      el.querySelectorAll<HTMLElement>('.rise').forEach(n => {
        if (n.style.animationDelay) n.style.transitionDelay = n.style.animationDelay;
      });
    }
    const id = setTimeout(() => setOn(true), 30);
    return () => clearTimeout(id);
  }, []);
  return [ref, on] as const;
}
