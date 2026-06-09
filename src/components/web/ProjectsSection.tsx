'use client';
import React, { useState } from 'react';
import { PROJECTS, ProjectData } from '@/data/portfolio';
import { Icon } from '@/components/phone/Icon';
import { useReveal } from './hooks';

type FilterKey = 'all' | 'company' | 'team' | 'personal';
const SEGS: [FilterKey, string][] = [['all', '전체'], ['company', '회사'], ['team', '팀'], ['personal', '개인']];

function ProjectCard({ pr, onOpen, idx }: { pr: ProjectData; onOpen: (id: string) => void; idx: number }) {
  return (
    <button
      className="proj-card reveal"
      style={{ transitionDelay: (idx % 2) * 0.07 + 's' }}
      onClick={() => onOpen(pr.id)}
    >
      <div className="proj-thumb">
        <img src={pr.thumb} alt="" loading="lazy" />
      </div>
      <div className="proj-body">
        <div className="proj-meta">
          <span className={'proj-tag' + (pr.type !== 'company' ? ' team' : '')}>
            {pr.type === 'team' ? '팀 프로젝트' : pr.type === 'personal' ? '개인 프로젝트' : pr.company}
          </span>
          <span className="proj-year">{pr.year}</span>
        </div>
        <div className="proj-title">{pr.title}</div>
        {pr.subtitle && <div className="proj-subtitle">{pr.subtitle}</div>}
        <p className="proj-summary">{pr.summary}</p>
        <div className="proj-stats">
          {pr.metrics.slice(0, 3).map((m, j) => (
            <div className="proj-stat" key={j}>
              <div className="sv">{m.value}</div>
              <div className="sl">{m.label}</div>
            </div>
          ))}
        </div>
        <span className="proj-more">
          자세히 보기 <Icon name="arrow" size={17} stroke={2.2} />
        </span>
      </div>
    </button>
  );
}

interface ProjectDetailWebProps {
  id: string;
  onClose: () => void;
}

function ProjectDetailWeb({ id, onClose }: ProjectDetailWebProps) {
  const [scrolled, setScrolled] = useState(false);
  const scRef = React.useRef<HTMLDivElement>(null);
  const pr = PROJECTS.find(p => p.id === id);

  React.useEffect(() => {
    const el = scRef.current;
    if (!el) return;
    const onScroll = () => setScrolled(el.scrollTop > 180);
    el.addEventListener('scroll', onScroll, { passive: true });
    return () => el.removeEventListener('scroll', onScroll);
  }, [id]);

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  if (!pr) return null;
  const s = pr.sections;

  return (
    <div className="detail open" ref={scRef}>
      <div className={'detail-bar' + (scrolled ? ' scrolled' : '')}>
        <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px' }}>
          <span className="dt-title">{pr.title}</span>
          <div style={{ display: 'flex', gap: 10 }}>
            {pr.link && (
              <a className="btn btn-ghost btn-sm" href={pr.link} target="_blank" rel="noreferrer">
                <Icon name="link" size={16} /> 서비스
              </a>
            )}
            <button className="detail-close" onClick={onClose} aria-label="close">
              <Icon name="close" size={22} />
            </button>
          </div>
        </div>
      </div>
      <div className="detail-inner">
        <div className="dt-hero-meta">
          <div className={'dt-avatar' + (pr.type !== 'company' ? ' team' : '')}>{pr.initial}</div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700 }}>{pr.company}</div>
            <div style={{ fontSize: 13, color: 'var(--text-3)', fontWeight: 600 }}>{pr.year}</div>
          </div>
        </div>
        {pr.subtitle && <div className="dt-subtitle">{pr.subtitle}</div>}
        <h1 className="dt-title-lg">{pr.title}</h1>
        <p className="dt-summary">{pr.summary}</p>
        <div className="chips" style={{ marginTop: 24 }}>
          {pr.tags.map(t => <span key={t} className="chip">{t}</span>)}
        </div>

        <div className="dt-hero-img"><img src={pr.image.src} alt="" /></div>
        {pr.image.caption && <div className="dt-cap">{pr.image.caption}</div>}

        <div className="dt-section">
          <div className="dt-sec-head">
            <div className="dt-sec-eyebrow">IMPACT</div>
            <div className="dt-sec-title">핵심 성과</div>
          </div>
          <div className="dt-metrics">
            {pr.metrics.map((m, i) => (
              <div className="dt-metric" key={i}>
                <div className="mv">{m.value}</div>
                {m.from && <div className="mfrom">{m.from}</div>}
                <div className="ml">{m.label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="dt-section">
          <div className="dt-sec-head">
            <div className="dt-sec-eyebrow">WHY</div>
            <div className="dt-sec-title">기획 의도</div>
          </div>
          <div className="dt-intent">
            {s.intent.map((t, i) => (
              <div className="dt-intent-row" key={i}>
                <div className="dt-intent-num">{i + 1}</div>
                <p>{t}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="dt-section">
          <div className="dt-sec-head">
            <div className="dt-sec-eyebrow">HOW</div>
            <div className="dt-sec-title">핵심 기술</div>
          </div>
          <div className="dt-tech">
            {s.tech.map((t, i) => (
              <div className="dt-tech-card" key={i}>
                <div className="dt-tech-top">
                  <span className="dt-tech-num">{String(i + 1).padStart(2, '0')}</span>
                  <div className="dt-tech-title">{t.title}</div>
                </div>
                <p className="dt-tech-desc">{t.description}</p>
                {t.points && (
                  <div className="dt-tech-points">
                    {t.points.map((pt, j) => (
                      <div className="dt-point" key={j}>
                        <Icon name="check" size={17} stroke={2.4} />
                        <span>{pt}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {s.arch && (
          <div className="dt-section">
            <div className="dt-sec-head">
              <div className="dt-sec-eyebrow">SYSTEM</div>
              <div className="dt-sec-title">아키텍처</div>
            </div>
            <div className="dt-arch"><img src={s.arch} alt="아키텍처 다이어그램" /></div>
          </div>
        )}

        <div className="dt-section">
          <div className="dt-sec-head">
            <div className="dt-sec-eyebrow">RESULT</div>
            <div className="dt-sec-title">{s.expect ? '기대 효과' : '성과'}</div>
          </div>
          <div className="dt-result">
            {(s.result ?? s.expect ?? []).map((t, i) => (
              <div className="dt-result-row" key={i}>
                <Icon name="check" size={20} stroke={2.4} />
                <p>{t}</p>
              </div>
            ))}
          </div>
        </div>

        {pr.link && (
          <div style={{ marginTop: 56 }}>
            <a className="btn btn-primary" href={pr.link} target="_blank" rel="noreferrer">
              실제 서비스 보기 <Icon name="arrow" size={18} stroke={2.2} />
            </a>
          </div>
        )}
      </div>
    </div>
  );
}

export function ProjectsSection({ onOpen }: { onOpen: (id: string) => void }) {
  const [filter, setFilter] = useState<FilterKey>('all');
  const ref = useReveal();
  const shown = PROJECTS.filter(p => filter === 'all' ? true : p.type === filter);

  return (
    <section id="projects" className="sec-pad">
      <div className="container" ref={ref as React.RefObject<HTMLDivElement>}>
        <div className="proj-head">
          <div className="reveal">
            <div className="eyebrow">Work</div>
            <h2 className="sec-title">프로젝트</h2>
            <p className="sec-sub">데이터 수집부터 모델 개발·배포·운영까지, 직접 설계하고 만든 {PROJECTS.length}개의 프로젝트예요.</p>
          </div>
          <div className="filter reveal">
            {SEGS.map(([k, label]) => (
              <button key={k} className={filter === k ? 'on' : ''} onClick={() => setFilter(k)}>{label}</button>
            ))}
          </div>
        </div>
        <div className="proj-grid">
          {shown.map((pr, i) => <ProjectCard key={pr.id} pr={pr} idx={i} onOpen={onOpen} />)}
        </div>
      </div>
    </section>
  );
}

export { ProjectDetailWeb };
