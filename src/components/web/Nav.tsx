'use client';
import React, { useState, useEffect } from 'react';
import { PROFILE } from '@/data/portfolio';
import { Icon } from '@/components/phone/Icon';

interface NavProps {
  theme: string;
  toggleTheme: () => void;
}

export function Nav({ theme, toggleTheme }: NavProps) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    const close = () => setMenuOpen(false);
    window.addEventListener('scroll', close, { passive: true, once: true });
    return () => window.removeEventListener('scroll', close);
  }, [menuOpen]);

  const closeMenu = () => setMenuOpen(false);

  return (
    <nav className={'nav' + (scrolled ? ' scrolled' : '')}>
      <div className="container">
        <a className="nav-brand" href="#top" onClick={closeMenu}>
          <span className="dot" />
          {PROFILE.name}
          <span style={{ color: 'var(--text-4)', fontWeight: 600, fontSize: 14 }}>.dev</span>
        </a>
        <div className="nav-links">
          <a href="#about">About</a>
          <a href="#projects">프로젝트</a>
          <a href="#blog">블로그</a>
          <a href="#contact">Contact</a>
        </div>
        <div className="nav-actions">
          <button
            className="nav-hamburger"
            onClick={() => setMenuOpen(o => !o)}
            aria-label="메뉴"
            aria-expanded={menuOpen}
          >
            {menuOpen
              ? <Icon name="close" size={20} stroke={2} />
              : <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round"><path d="M4 6h16M4 12h16M4 18h16" /></svg>
            }
          </button>
          <button
            className="icon-toggle"
            onClick={toggleTheme}
            aria-label="theme"
            style={{ border: '1px solid var(--border)', borderRadius: 11, width: 40, height: 40, background: 'var(--surface)', cursor: 'pointer', color: 'var(--text-2)', display: 'grid', placeItems: 'center' }}
          >
            <Icon name={theme === 'dark' ? 'sun' : 'moon'} size={19} stroke={1.9} />
          </button>
        </div>
      </div>
      <div className={'nav-mobile' + (menuOpen ? ' open' : '')}>
        <a href="#about" onClick={closeMenu}>About</a>
        <a href="#projects" onClick={closeMenu}>프로젝트</a>
        <a href="#blog" onClick={closeMenu}>블로그</a>
        <a href="#contact" onClick={closeMenu}>Contact</a>
      </div>
    </nav>
  );
}
