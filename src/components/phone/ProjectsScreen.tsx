'use client';
import React, { useState } from 'react';
import { PROJECTS } from '@/data/portfolio';
import { AppBar } from './AppBar';
import { useScrolled, useReveal } from './hooks';
import ProjectThumb from '@/components/ProjectThumb';

interface ProjectsScreenProps {
  openProject: (id: string) => void;
}

type FilterKey = 'all' | 'company' | 'team' | 'personal';
const SEGS: [FilterKey, string][] = [['all', '전체'], ['company', '회사'], ['team', '팀'], ['personal', '개인']];

export function ProjectsScreen({ openProject }: ProjectsScreenProps) {
  const [ref, scrolled] = useScrolled(20);
  const [reveal, revIn] = useReveal();
  const [filter, setFilter] = useState<FilterKey>('all');
  const shown = PROJECTS.filter(p => filter === 'all' ? true : p.type === filter);

  return (
    <div className={'screen' + (revIn ? ' in' : '')} ref={reveal} data-active>
      <AppBar title="프로젝트" scrolled={scrolled} />
      <div className="scroll" ref={ref}>
        <div className="pad" style={{ paddingTop: 4, paddingBottom: 18 }}>
          <div className="h1 rise">프로젝트</div>
          <p className="body rise" style={{ animationDelay: '.05s', marginTop: 6, fontSize: 14 }}>
            데이터 수집부터 모델 개발·배포까지, 직접 만든 {PROJECTS.length}개의 프로젝트예요.
          </p>
          <div className="rise" style={{ animationDelay: '.1s', display: 'flex', background: 'var(--bg-gray)', borderRadius: 12, padding: 4, marginTop: 18 }}>
            {SEGS.map(([k, label]) => (
              <button
                key={k}
                onClick={() => setFilter(k)}
                style={{
                  flex: 1, border: 'none', cursor: 'pointer', fontFamily: 'inherit',
                  height: 36, borderRadius: 9, fontSize: 14, fontWeight: 700,
                  background: filter === k ? '#fff' : 'transparent',
                  color: filter === k ? 'var(--text)' : 'var(--text-3)',
                  boxShadow: filter === k ? '0 1px 4px rgba(0,25,54,.10)' : 'none',
                  transition: 'background .2s, color .2s',
                }}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="pad" style={{ paddingBottom: 28, display: 'flex', flexDirection: 'column', gap: 16 }}>
          {shown.map((pr, i) => (
            <button
              key={pr.id}
              className="rise"
              style={{ animationDelay: (i * 0.05) + 's', border: '1px solid var(--border)', background: '#fff', borderRadius: 'var(--r-card)', padding: 0, overflow: 'hidden', cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit' }}
              onClick={() => openProject(pr.id)}
            >
              <div style={{ height: 150, overflow: 'hidden' }}>
                <ProjectThumb project={pr} style={{ height: 150 }} />
              </div>
              <div style={{ padding: '16px 18px 18px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                  <span className={'chip ' + (pr.type !== 'company' ? 'accent' : '')} style={{ fontSize: 11, padding: '4px 8px' }}>
                    {pr.type === 'team' ? '팀 프로젝트' : pr.type === 'personal' ? '개인 프로젝트' : pr.company}
                  </span>
                  <span style={{ fontSize: 12, color: 'var(--text-4)', fontWeight: 600 }}>{pr.year}</span>
                </div>
                <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.02em', lineHeight: 1.3 }}>{pr.title}</div>
                {pr.subtitle && (
                  <div style={{ fontSize: 13, color: 'var(--text-3)', fontWeight: 600, marginTop: 2 }}>{pr.subtitle}</div>
                )}
                <p style={{ fontSize: 14, lineHeight: 1.6, color: 'var(--text-2)', marginTop: 8 }}>{pr.summary}</p>
                <div className="metric-row" style={{ marginTop: 14, gap: 8 }}>
                  {pr.metrics.slice(0, 3).map((m, j) => (
                    <div key={j} style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 17, fontWeight: 800, color: j === 0 ? 'var(--accent)' : 'var(--text)', letterSpacing: '-0.03em', whiteSpace: 'nowrap' }}>{m.value}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-3)', fontWeight: 600, marginTop: 3, lineHeight: 1.3 }}>{m.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
