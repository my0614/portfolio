'use client';
import React from 'react';
import { PROFILE } from '@/data/portfolio';
import { Icon } from '@/components/phone/Icon';
import { useReveal } from './hooks';



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
            <a className="btn btn-ghost" href="/resume.pdf" download="김민영_이력서.pdf">
              이력서 다운로드 <Icon name="download" size={18} stroke={2.2} />
            </a>
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

