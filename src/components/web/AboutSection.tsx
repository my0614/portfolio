'use client';
import React from 'react';
import { PROFILE } from '@/data/portfolio';
import { useReveal } from './hooks';

export function AboutSection() {
  const ref = useReveal();
  return (
    <section id="about" className="sec-pad">
      <div className="container" ref={ref as React.RefObject<HTMLDivElement>}>
        <div className="reveal" style={{ marginBottom: 48 }}>
          <div className="eyebrow">About</div>
          <h2 className="sec-title">소개</h2>
        </div>
        <div className="about-grid">
          <div className="reveal">
            {PROFILE.intro.map((t, i) => (
              <p key={i} style={{ fontSize: 17, lineHeight: 1.75, color: 'var(--text-2)', marginBottom: 18 }}>{t}</p>
            ))}
            <div className="info-list" style={{ marginTop: 30 }}>
              {PROFILE.systemInfo.map(([k, v]) => (
                <div className="info-row" key={k}>
                  <span className="ik">{k}</span>
                  <span className="iv">{v}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="about-skills reveal" style={{ transitionDelay: '.08s' }}>
            <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--text)', marginBottom: 4 }}>기술 스택</div>
            {PROFILE.skills.map(g => (
              <div className="skill-group" key={g.category}>
                <div className="sg-label">{g.category}</div>
                <div className="chips">
                  {g.skills.map(sk => <span className="chip" key={sk}>{sk}</span>)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
