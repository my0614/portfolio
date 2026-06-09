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
            영상 데이터로<br />문제를 푸는<br /><span className="accent">{PROFILE.name}</span>입니다
          </h1>
          <p className="hero-role reveal" style={{ transitionDelay: '.1s' }}>{PROFILE.role}</p>
          <p className="hero-intro reveal" style={{ transitionDelay: '.14s' }}>{PROFILE.intro[0]}</p>
          <div className="hero-cta reveal" style={{ transitionDelay: '.18s' }}>
            <a className="btn btn-primary" href="#projects">
              프로젝트 보기 <Icon name="arrow" size={18} stroke={2.2} />
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

export function Impact() {
  const ref = useReveal();
  const stats = [
    { v: <><span>4시간</span><span className="arrow">→</span><span>2분</span></>, label: '핫딜 등록 작업 시간' },
    { v: <><span>61</span><span className="arrow">→</span><span>75%</span></>, label: '드론 객체 탐지 mAP' },
    { v: <><span>3</span><span className="arrow">→</span><span>20+</span></>, label: 'DFLOW 지원 모델 수' },
    { v: <>24/7</>, label: 'CS 자동 응답 운영' },
  ];
  return (
    <section className="impact sec-pad-sm">
      <div className="container" ref={ref as React.RefObject<HTMLDivElement>}>
        <div className="impact-grid">
          {stats.map((s, i) => (
            <div className="impact-card reveal" key={i} style={{ transitionDelay: i * 0.06 + 's' }}>
              <div className="impact-val">{s.v}</div>
              <div className="impact-label">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
