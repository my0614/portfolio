'use client';
import React from 'react';
import { PROFILE, PROJECTS } from '@/data/portfolio';
import { AppBar } from './AppBar';
import { Avatar } from './Avatar';
import { Icon } from './Icon';
import { useScrolled, useReveal } from './hooks';

interface HomeScreenProps {
  openProject: (id: string) => void;
  goTab: (tab: string) => void;
}

export function HomeScreen({ openProject, goTab }: HomeScreenProps) {
  const [ref, scrolled] = useScrolled();
  const [reveal, revIn] = useReveal();
  const featured = [PROJECTS[0], PROJECTS[2], PROJECTS[3]];

  return (
    <div className={'screen' + (revIn ? ' in' : '')} ref={reveal} data-active>
      <AppBar title={PROFILE.name} scrolled={scrolled} />
      <div className="scroll" ref={ref}>
        {/* hero */}
        <div className="pad" style={{ paddingTop: 8, paddingBottom: 28 }}>
          <div className="rise" style={{ animationDelay: '.02s' }}>
            <div className="chip accent" style={{ display: 'inline-block', marginBottom: 16 }}>5년차 · {PROFILE.roleShort}</div>
            <div className="h1">
              안녕하세요,<br />
              {PROFILE.role.split(' · ')[0]} 개발자<br />
              <span style={{ color: 'var(--accent)' }}>{PROFILE.name}</span>입니다
            </div>
          </div>
          <div className="rise" style={{ animationDelay: '.10s', marginTop: 22, display: 'flex', alignItems: 'center', gap: 14 }}>
            <Avatar src={PROFILE.photo} size={56} />
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)' }}>
                {PROFILE.name}{' '}
                <span style={{ color: 'var(--text-3)', fontWeight: 600, fontSize: 13 }}>{PROFILE.nameEn}</span>
              </div>
              <div style={{ fontSize: 13, color: 'var(--text-2)', marginTop: 3, display: 'flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap' }}>
                <span style={{ width: 7, height: 7, borderRadius: 99, background: 'var(--green)', display: 'inline-block', flex: 'none' }} />
                Open for opportunities
              </div>
            </div>
          </div>
          <p className="body rise" style={{ animationDelay: '.16s', marginTop: 20 }}>{PROFILE.intro[0]}</p>
        </div>

        <div className="divider" />

        {/* metrics */}
        <div className="pad" style={{ paddingTop: 26, paddingBottom: 26 }}>
          <div className="section-label rise">대표 성과</div>
          <div className="metric-row rise" style={{ animationDelay: '.04s' }}>
            <div className="metric">
              <div className="mv accent">4시간→2분</div>
              <div className="ml">핫딜 등록 작업 시간</div>
            </div>
          </div>
          <div className="metric-row rise" style={{ animationDelay: '.08s', marginTop: 10 }}>
            <div className="metric">
              <div className="mv">61→75%</div>
              <div className="ml">객체 탐지 mAP</div>
            </div>
            <div className="metric">
              <div className="mv">3→20<span style={{ fontSize: 16 }}>+</span></div>
              <div className="ml">DFLOW 지원 모델</div>
            </div>
          </div>
        </div>

        <div className="divider" />

        {/* projects preview */}
        <div className="pad" style={{ paddingTop: 24, paddingBottom: 8 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
            <div className="section-label rise" style={{ marginBottom: 4 }}>대표 프로젝트</div>
            <button
              className="rise"
              onClick={() => goTab('projects')}
              style={{ border: 'none', background: 'none', color: 'var(--accent)', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}
            >
              전체 {PROJECTS.length}개 보기
            </button>
          </div>
        </div>
        <div className="pad" style={{ paddingBottom: 24 }}>
          {featured.map((pr, i) => (
            <button
              key={pr.id}
              className="row rise"
              style={{ animationDelay: (i * 0.05 + 0.05) + 's' }}
              onClick={() => openProject(pr.id)}
            >
              <Avatar src={pr.thumb} size={52} />
              <div className="r-body">
                <div className="r-title">{pr.title}</div>
                <div className="r-sub">{pr.company} · {pr.year}</div>
              </div>
              <Icon name="chev" size={18} color="var(--text-4)" />
            </button>
          ))}
        </div>

        <div className="divider" />

        {/* skills */}
        <div className="pad" style={{ paddingTop: 26, paddingBottom: 30 }}>
          <div className="section-label rise">기술 스택</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {PROFILE.skills.map((g, i) => (
              <div key={g.category} className="rise" style={{ animationDelay: (i * 0.03) + 's' }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-4)', marginBottom: 8 }}>{g.category}</div>
                <div className="chips">
                  {g.skills.map(s => <span key={s} className="chip">{s}</span>)}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="pad" style={{ paddingBottom: 36, display: 'flex', gap: 10 }}>
          <button className="btn btn-weak rise" style={{ flex: 1 }} onClick={() => goTab('about')}>About</button>
          <button className="btn btn-primary rise" style={{ flex: 1.4 }} onClick={() => goTab('contact')}>연락하기</button>
        </div>
      </div>
    </div>
  );
}
