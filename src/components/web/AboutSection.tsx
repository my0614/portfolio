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

        <div className="about-bio reveal" style={{ marginBottom: 48 }}>
          {PROFILE.intro.map((t, i) => (
            <p key={i} style={{ fontSize: 16.5, lineHeight: 1.85, color: 'var(--text-2)', marginBottom: 12 }}>{t}</p>
          ))}
        </div>

        <div className="reveal" style={{ transitionDelay: '.06s', marginBottom: 40 }}>
          <div className="about-col-label">Info</div>
          <div className="info-list">
            {PROFILE.systemInfo.map(([k, v]) => (
              <div className="info-row" key={k}>
                <span className="ik">{k}</span>
                <span className="ik-line" />
                <span className="iv">{v}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="about-skills reveal" style={{ transitionDelay: '.12s' }}>
          <div className="about-col-label">Tech Stack</div>
          {PROFILE.skills.map(g => (
            <div className="skill-group-row" key={g.category}>
              <div className="sg-label">{g.category}</div>
              <div className="chips">
                {g.skills.map(sk => <span className="chip" key={sk}>{sk}</span>)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
