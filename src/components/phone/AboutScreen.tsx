'use client';
import React from 'react';
import { PROFILE } from '@/data/portfolio';
import { AppBar } from './AppBar';
import { Avatar } from './Avatar';
import { Icon } from './Icon';
import { useScrolled, useReveal } from './hooks';

interface AboutScreenProps {
  goTab: (tab: string) => void;
}

export function AboutScreen({ goTab }: AboutScreenProps) {
  const [ref, scrolled] = useScrolled(20);
  const [reveal, revIn] = useReveal();

  return (
    <div className={'screen' + (revIn ? ' in' : '')} ref={reveal} data-active>
      <AppBar title="About" scrolled={scrolled} />
      <div className="scroll" ref={ref}>
        <div className="pad" style={{ paddingTop: 4, paddingBottom: 24 }}>
          <div className="h1 rise">About</div>
          <div className="rise" style={{ animationDelay: '.05s', marginTop: 20, display: 'flex', alignItems: 'center', gap: 16 }}>
            <Avatar src={PROFILE.photo} size={68} />
            <div>
              <div style={{ fontSize: 19, fontWeight: 800, color: 'var(--text)', letterSpacing: '-0.02em' }}>{PROFILE.name}</div>
              <div style={{ fontSize: 13, color: 'var(--text-3)', fontWeight: 600, marginTop: 1 }}>{PROFILE.nameEn}</div>
              <div style={{ fontSize: 13.5, color: 'var(--accent)', fontWeight: 700, marginTop: 5 }}>{PROFILE.role}</div>
            </div>
          </div>
          {PROFILE.intro.map((t, i) => (
            <p key={i} className="body rise" style={{ animationDelay: (0.1 + i * 0.04) + 's', marginTop: 16 }}>{t}</p>
          ))}
        </div>

        <div className="divider" />

        <div className="pad" style={{ paddingTop: 26, paddingBottom: 24 }}>
          <div className="section-label rise">System Info</div>
          <div className="rise" style={{ animationDelay: '.04s' }}>
            {PROFILE.systemInfo.map(([k, v]) => (
              <div key={k} className="row" style={{ cursor: 'default', padding: '13px 0' }}>
                <div className="r-body">
                  <span style={{ fontSize: 14, color: 'var(--text-3)', fontWeight: 600, fontFamily: 'ui-monospace, monospace' }}>{k}</span>
                </div>
                <div className="r-val" style={{ fontSize: 14 }}>{v}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="divider" />

        <div className="pad" style={{ paddingTop: 26, paddingBottom: 30 }}>
          <div className="section-label rise">Skills</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {PROFILE.skills.map((g, i) => (
              <div key={g.category} className="rise" style={{ animationDelay: (i * 0.03) + 's' }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-4)', marginBottom: 8 }}>{g.category}</div>
                <div className="chips">
                  {g.skills.map(sk => <span key={sk} className="chip">{sk}</span>)}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="pad" style={{ paddingBottom: 36 }}>
          <button className="btn btn-weak rise" onClick={() => goTab('contact')}>
            <Icon name="mail" size={18} stroke={2} /> 연락처 보기
          </button>
        </div>
      </div>
    </div>
  );
}
