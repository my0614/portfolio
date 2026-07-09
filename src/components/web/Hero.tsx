'use client';
import React, { useState, useRef, useEffect } from 'react';
import { PROFILE } from '@/data/portfolio';
import { Icon } from '@/components/phone/Icon';
import { useReveal } from './hooks';

function DownloadMenu() {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onClickOutside = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, [open]);

  return (
    <div ref={wrapRef} style={{ position: 'relative' }}>
      <button
        type="button"
        className="btn btn-ghost"
        onClick={() => setOpen(o => !o)}
        aria-haspopup="true"
        aria-expanded={open}
      >
        다운로드 <Icon name="download" size={18} stroke={2.2} />
      </button>
      {open && (
        <div
          role="menu"
          style={{
            position: 'absolute', top: 'calc(100% + 8px)', left: 0, minWidth: 200, zIndex: 20,
            background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14,
            boxShadow: 'var(--shadow-md)', padding: 6,
          }}
        >
          <a
            role="menuitem"
            href="/projects/김민영_이력서_result.pdf"
            download="김민영_이력서.pdf"
            onClick={() => setOpen(false)}
            style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px', borderRadius: 9, fontSize: 14.5, fontWeight: 600, color: 'var(--text)', textDecoration: 'none' }}
            className="dl-menu-item"
          >
            <Icon name="doc" size={17} stroke={2} /> 이력서
          </a>
          <a
            role="menuitem"
            href="/projects/김민영_포트폴리오.pdf"
            download="김민영_포트폴리오.pdf"
            onClick={() => setOpen(false)}
            style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px', borderRadius: 9, fontSize: 14.5, fontWeight: 600, color: 'var(--text)', textDecoration: 'none' }}
            className="dl-menu-item"
          >
            <Icon name="doc" size={17} stroke={2} /> 포트폴리오
          </a>
        </div>
      )}
    </div>
  );
}

export function Hero() {
  const ref = useReveal();
  return (
    <section id="top" className="hero">
      <div className="container hero-grid" ref={ref as React.RefObject<HTMLDivElement>}>
        <div>
          <div className="hero-badge reveal">
            <span className="dot" />
            5년차 · ML / MLOps Engineer
          </div>
          <h1 className="reveal" style={{ transitionDelay: '.05s' }}>
            안녕하세요,<br />{PROFILE.role.split(' · ')[0]} 개발자<br /><span className="accent">{PROFILE.name}</span>입니다
          </h1>
          <p className="hero-role reveal" style={{ transitionDelay: '.1s' }}>{PROFILE.role}</p>
          <p className="hero-intro reveal" style={{ transitionDelay: '.14s' }}>{PROFILE.introShort}</p>
          <div className="hero-cta reveal" style={{ transitionDelay: '.18s' }}>
            <a className="btn btn-primary" href="#projects">
              프로젝트 보기 <Icon name="arrow" size={18} stroke={2.2} />
            </a>
            <DownloadMenu />
            <a className="btn btn-ghost" href="#contact">연락하기</a>
          </div>
        </div>
        <div className="reveal" style={{ transitionDelay: '.12s' }}>
          <div className="hero-photo">
            <img src={PROFILE.photo} alt={PROFILE.name} />
          </div>
        </div>
      </div>
    </section>
  );
}

