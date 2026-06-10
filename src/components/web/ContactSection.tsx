'use client';
import React, { useState } from 'react';
import { PROFILE } from '@/data/portfolio';
import { Icon } from '@/components/phone/Icon';
import { useReveal } from './hooks';

const iconFor: Record<string, 'phone' | 'mail' | 'github'> = {
  phone: 'phone', mail: 'mail', github: 'github',
};

export function ContactSection() {
  const ref = useReveal();
  const [sent, setSent] = useState(false);

  return (
    <section id="contact" className="contact sec-pad">
      <div className="container" ref={ref as React.RefObject<HTMLDivElement>}>
        <div className="reveal" style={{ marginBottom: 48 }}>
          <div className="eyebrow">Contact</div>
          <h2 className="sec-title">함께 일해요</h2>
          <p className="sec-sub">새로운 기회나 협업 제안은 언제든 환영이에요. 편하게 연락 주세요.</p>
        </div>
        <div className="contact-grid">
          <div className="contact-cards reveal">
            {PROFILE.contact.map(c => (
              <a className="contact-card" key={c.kind} href={c.href} target="_blank" rel="noreferrer">
                <div className="contact-ico">
                  <Icon name={iconFor[c.kind]} size={22} stroke={1.9} />
                </div>
                <div style={{ minWidth: 0 }}>
                  <div className="cc-kind">{c.kind}</div>
                  <div className="cc-label">{c.label}</div>
                </div>
              </a>
            ))}
          </div>
          <form
            className="contact-form reveal"
            style={{ transitionDelay: '.08s' }}
            onSubmit={(e) => { e.preventDefault(); setSent(true); setTimeout(() => setSent(false), 2400); }}
          >
            <input className="field" placeholder="회신 받을 이메일" type="email" required />
            <textarea className="field contact-textarea" placeholder="전하고 싶은 메시지를 남겨주세요" required />
            <button className="btn btn-primary contact-btn" type="submit">
              {sent ? '전송되었어요 ✓' : '메시지 보내기'}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}

export function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-in">
        <div className="fl">© 2026 {PROFILE.name} ({PROFILE.nameEn}) · ML / MLOps Engineer</div>
        <div style={{ display: 'flex', gap: 8 }}>
          {PROFILE.contact.map(c => (
            <a
              key={c.kind}
              className="icon-toggle"
              href={c.href}
              target="_blank"
              rel="noreferrer"
              aria-label={c.kind}
              style={{ width: 40, height: 40, border: '1px solid var(--border)', borderRadius: 11, background: 'var(--surface)', display: 'grid', placeItems: 'center', color: 'var(--text-2)' }}
            >
              <Icon name={iconFor[c.kind]} size={19} stroke={1.9} />
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}
