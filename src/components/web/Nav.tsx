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
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <nav className={'nav' + (scrolled ? ' scrolled' : '')}>
      <div className="container">
        <a className="nav-brand" href="#top">
          <span className="dot" />
          {PROFILE.name}
          <span style={{ color: 'var(--text-4)', fontWeight: 600, fontSize: 14 }}>.dev</span>
        </a>
        <div className="nav-links">
          <a href="#about">About</a>
          <a href="#projects">프로젝트</a>
          <a href="#contact">Contact</a>
        </div>
        <div className="nav-actions">
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
    </nav>
  );
}
