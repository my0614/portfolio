'use client';
import React, { useState, useCallback } from 'react';
import { PROJECTS, ProjectData } from '@/data/portfolio';
import { Icon } from '@/components/phone/Icon';
import { useReveal } from './hooks';

function ImageGallery({ images }: { images: { src: string; caption?: string }[] }) {
  const [current, setCurrent] = useState(0);

  const prev = useCallback(() => setCurrent(i => Math.max(0, i - 1)), []);
  const next = useCallback(() => setCurrent(i => Math.min(images.length - 1, i + 1)), [images.length]);

  return (
    <div style={{ marginTop: 36 }}>
      <div style={{ position: 'relative', borderRadius: 20, overflow: 'hidden', border: '1px solid var(--border-soft)', background: 'var(--bg-gray)' }}>
        <img src={images[current].src} alt="" style={{ width: '100%', display: 'block' }} />

        {images.length > 1 && (
          <>
            <button
              onClick={prev}
              disabled={current === 0}
              style={{
                position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
                width: 36, height: 36, borderRadius: '50%', border: 'none', cursor: 'pointer',
                background: 'rgba(0,0,0,0.45)', color: '#fff', display: 'grid', placeItems: 'center',
                opacity: current === 0 ? 0.25 : 1, transition: 'opacity .2s',
              }}
            >
              <Icon name="back" size={18} />
            </button>
            <button
              onClick={next}
              disabled={current === images.length - 1}
              style={{
                position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%) scaleX(-1)',
                width: 36, height: 36, borderRadius: '50%', border: 'none', cursor: 'pointer',
                background: 'rgba(0,0,0,0.45)', color: '#fff', display: 'grid', placeItems: 'center',
                opacity: current === images.length - 1 ? 0.25 : 1, transition: 'opacity .2s',
              }}
            >
              <Icon name="back" size={18} />
            </button>
          </>
        )}
      </div>

      {images.length > 1 && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, marginTop: 12 }}>
          {images.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              style={{
                width: i === current ? 20 : 7, height: 7, borderRadius: 99,
                border: 'none', background: i === current ? 'var(--accent)' : 'var(--border)',
                cursor: 'pointer', padding: 0, transition: 'all .25s',
              }}
            />
          ))}
        </div>
      )}
      {images[current].caption && (
        <div className="dt-cap" style={{ marginTop: 8 }}>{images[current].caption}</div>
      )}
    </div>
  );
}

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
        <div style={{ maxWidth: 860, margin: '0 auto', width: '100%', padding: '0 24px', display: 'flex', alignItems: 'center', height: '100%', position: 'relative' }}>
          <span className="dt-title">{pr.title}</span>
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}>
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

        <ImageGallery images={[pr.image, ...(pr.image2 ? [pr.image2] : []), ...(pr.image3 ? [pr.image3] : []), ...(pr.image4 ? [pr.image4] : [])]} />

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

        {(s.result ?? s.expect ?? []).length > 0 && (
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
        )}

        {s.intent && s.intent.length > 0 && (
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
        )}

        {s.flow && (
          <div className="dt-section">
            <div className="dt-sec-head">
              <div className="dt-sec-eyebrow">FLOW</div>
              <div className="dt-sec-title">프로젝트 흐름</div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0 }}>
              {s.flow.map((step, i) => (
                <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
                  <div style={{ width: '100%', background: 'var(--bg-gray)', border: '1px solid var(--border)', borderRadius: 16, padding: '20px 24px' }}>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 8 }}>
                      <span style={{ flex: 'none', fontSize: 13, fontWeight: 800, color: 'var(--accent)', fontFamily: 'ui-monospace, monospace' }}>
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)' }}>{step.title}</div>
                    </div>
                    <p style={{ fontSize: 14, lineHeight: 1.7, color: 'var(--text-2)', margin: 0, paddingLeft: 23 }}>
                      {step.description}
                    </p>
                  </div>
                  {i < s.flow!.length - 1 && (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '6px 0' }}>
                      <div style={{ width: 1, height: 14, background: 'var(--border)' }} />
                      <div style={{ width: 0, height: 0, borderLeft: '6px solid transparent', borderRight: '6px solid transparent', borderTop: '7px solid var(--border)' }} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

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
                {t.images && (
                  <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {t.images.map((img, k) => (
                      <div key={k}>
                        <div className="dt-hero-img" style={{ marginTop: 0 }}><img src={img.src} alt="" /></div>
                        {img.caption && <div className="dt-cap">{img.caption}</div>}
                      </div>
                    ))}
                  </div>
                )}
                {t.table && (
                  <div style={{ marginTop: 20, borderRadius: 16, overflow: 'hidden', border: '1px solid var(--border)' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <thead>
                        <tr style={{ background: 'var(--bg-gray)' }}>
                          {t.table.headers.map((h, k) => (
                            <th key={k} style={{ padding: '11px 16px', fontSize: 12, fontWeight: 700, color: 'var(--text-3)', letterSpacing: '.06em', textTransform: 'uppercase', textAlign: k === 0 ? 'left' : 'center', borderBottom: '1px solid var(--border)' }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {t.table.rows.map((row, k) => (
                          <tr key={k} style={{ background: row.highlight ? 'var(--accent-bg)' : 'transparent', borderBottom: k < t.table!.rows.length - 1 ? '1px solid var(--border)' : 'none' }}>
                            {row.cells.map((cell, j) => (
                              <td key={j} style={{
                                padding: '11px 16px',
                                fontSize: 14,
                                fontWeight: j === 0 ? 700 : 400,
                                textAlign: j === 0 ? 'left' : 'center',
                                color: row.highlight ? 'var(--accent)' : j === row.cells.length - 1 ? 'var(--text-3)' : 'var(--text-2)',
                              }}>{cell}</td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
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
