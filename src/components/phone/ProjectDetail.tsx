'use client';
import React from 'react';
import { PROJECTS } from '@/data/portfolio';
import { AppBar } from './AppBar';
import { Avatar } from './Avatar';
import { Icon } from './Icon';
import { useScrolled, useReveal } from './hooks';

interface SectionHeadProps {
  label: string;
  title: string;
}

function SectionHead({ label, title }: SectionHeadProps) {
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--accent)', letterSpacing: '.06em', marginBottom: 6 }}>{label}</div>
      <div className="h2">{title}</div>
    </div>
  );
}

interface ProjectDetailProps {
  id: string;
  goBack: () => void;
}

export function ProjectDetail({ id, goBack }: ProjectDetailProps) {
  const [ref, scrolled] = useScrolled(120);
  const [reveal, revIn] = useReveal();
  const pr = PROJECTS.find(p => p.id === id);
  if (!pr) return null;
  const s = pr.sections;

  return (
    <div className={'screen' + (revIn ? ' in' : '')} ref={reveal} data-active>
      <AppBar
        title={pr.title}
        onBack={goBack}
        scrolled={scrolled}
        right={
          pr.link
            ? <a className="iconbtn" href={pr.link} target="_blank" rel="noreferrer" aria-label="link">
                <Icon name="link" size={22} />
              </a>
            : undefined
        }
      />
      <div className="scroll" ref={ref}>
        {/* hero */}
        <div className="pad" style={{ paddingTop: 6, paddingBottom: 22 }}>
          <div className="rise" style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <Avatar
              initial={pr.initial}
              size={36}
              font={15}
              bg={pr.type !== 'company' ? 'var(--accent-bg)' : 'var(--bg-gray)'}
              color={pr.type !== 'company' ? 'var(--accent-dark)' : 'var(--text-2)'}
            />
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)' }}>{pr.company}</div>
              <div style={{ fontSize: 12, color: 'var(--text-3)', fontWeight: 600 }}>{pr.year}</div>
            </div>
          </div>
          {pr.subtitle && (
            <div className="rise" style={{ animationDelay: '.03s', fontSize: 13, fontWeight: 700, color: 'var(--accent)', marginBottom: 6 }}>
              {pr.subtitle}
            </div>
          )}
          <div className="h1 rise" style={{ animationDelay: '.05s' }}>{pr.title}</div>
          <p className="body rise" style={{ animationDelay: '.1s', marginTop: 12 }}>{pr.summary}</p>
          <div className="chips rise" style={{ animationDelay: '.14s', marginTop: 16 }}>
            {pr.tags.map(t => <span key={t} className="chip">{t}</span>)}
          </div>
        </div>

        {/* hero image */}
        <div className="pad rise" style={{ animationDelay: '.18s', paddingBottom: 8 }}>
          <div style={{ borderRadius: 16, overflow: 'hidden', background: 'var(--bg-gray)' }}>
            <img src={pr.image.src} alt="" style={{ width: '100%', display: 'block' }} />
          </div>
          {pr.image.caption && (
            <div style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 8, textAlign: 'center' }}>{pr.image.caption}</div>
          )}
        </div>
        {pr.image2 && (
          <div className="pad rise" style={{ animationDelay: '.22s', paddingBottom: 8 }}>
            <div style={{ borderRadius: 16, overflow: 'hidden', background: 'var(--bg-gray)' }}>
              <img src={pr.image2.src} alt="" style={{ width: '100%', display: 'block' }} />
            </div>
            {pr.image2.caption && (
              <div style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 8, textAlign: 'center' }}>{pr.image2.caption}</div>
            )}
          </div>
        )}
        {pr.image3 && (
          <div className="pad rise" style={{ animationDelay: '.26s', paddingBottom: 8 }}>
            <div style={{ borderRadius: 16, overflow: 'hidden', background: 'var(--bg-gray)' }}>
              <img src={pr.image3.src} alt="" style={{ width: '100%', display: 'block' }} />
            </div>
            {pr.image3.caption && (
              <div style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 8, textAlign: 'center' }}>{pr.image3.caption}</div>
            )}
          </div>
        )}
        {pr.image4 && (
          <div className="pad rise" style={{ animationDelay: '.30s', paddingBottom: 8 }}>
            <div style={{ borderRadius: 16, overflow: 'hidden', background: 'var(--bg-gray)' }}>
              <img src={pr.image4.src} alt="" style={{ width: '100%', display: 'block' }} />
            </div>
            {pr.image4.caption && (
              <div style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 8, textAlign: 'center' }}>{pr.image4.caption}</div>
            )}
          </div>
        )}

        <div className="divider" style={{ marginTop: 18 }} />

        {/* metrics */}
        <div className="pad" style={{ paddingTop: 26, paddingBottom: 28 }}>
          <SectionHead label="IMPACT" title="핵심 성과" />
          <div className="metric-row">
            {pr.metrics.map((m, i) => (
              <div key={i} className="metric">
                <div className={'mv' + (i === 0 ? ' accent' : '')}>{m.value}</div>
                {m.from && <div className="mfrom">{m.from}</div>}
                <div className="ml">{m.label}</div>
              </div>
            ))}
          </div>
        </div>

        {(s.result ?? s.expect ?? []).length > 0 && (
          <>
            <div className="divider" />
            <div className="pad" style={{ paddingTop: 28, paddingBottom: 28 }}>
              <SectionHead label="RESULT" title={s.expect ? '기대 효과' : '성과'} />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {(s.result ?? s.expect ?? []).map((t, i) => (
                  <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                    <span style={{ flex: 'none', marginTop: 2, color: 'var(--green)' }}>
                      <Icon name="check" size={18} stroke={2.6} />
                    </span>
                    <p style={{ fontSize: 14.5, lineHeight: 1.6, color: 'var(--text)', fontWeight: 500 }}>{t}</p>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        <div className="divider" />

        {/* intent */}
        {s.intent && s.intent.length > 0 && (
          <div className="pad" style={{ paddingTop: 28, paddingBottom: 28 }}>
            <SectionHead label="WHY" title="기획 의도" />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {s.intent.map((t, i) => (
                <div key={i} style={{ display: 'flex', gap: 12 }}>
                  <div style={{ flex: 'none', width: 22, height: 22, borderRadius: 99, background: 'var(--accent-bg)', color: 'var(--accent-dark)', fontSize: 12, fontWeight: 800, display: 'grid', placeItems: 'center', marginTop: 1 }}>
                    {i + 1}
                  </div>
                  <p style={{ fontSize: 14.5, lineHeight: 1.6, color: 'var(--text-2)' }}>{t}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {s.flow && (
          <>
            <div className="divider" />
            <div className="pad" style={{ paddingTop: 28, paddingBottom: 28 }}>
              <SectionHead label="FLOW" title="프로젝트 흐름" />
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'stretch', gap: 0 }}>
                {s.flow.map((step, i) => (
                  <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <div style={{ width: '100%', background: 'var(--bg-gray)', border: '1px solid var(--border)', borderRadius: 14, padding: '14px 16px' }}>
                      <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', marginBottom: 6 }}>
                        <span style={{ color: 'var(--accent)', fontFamily: 'ui-monospace, monospace', fontSize: 12, fontWeight: 800, marginRight: 7 }}>
                          {String(i + 1).padStart(2, '0')}
                        </span>
                        {step.title}
                      </div>
                      <p style={{ fontSize: 12.5, lineHeight: 1.6, color: 'var(--text-2)', margin: 0 }}>
                        {step.description}
                      </p>
                    </div>
                    {i < s.flow!.length - 1 && (
                      <div style={{ width: 1, height: 20, background: 'var(--border)', position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <div style={{ width: 0, height: 0, borderLeft: '5px solid transparent', borderRight: '5px solid transparent', borderTop: '6px solid var(--border)', marginTop: 14 }} />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        <div className="divider" />

        {/* tech */}
        <div className="pad" style={{ paddingTop: 28, paddingBottom: 28 }}>
          <SectionHead label="HOW" title="핵심 기술" />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {s.tech.map((t, i) => (
              <div key={i} style={{ border: '1px solid var(--border)', borderRadius: 16, padding: '18px 18px 16px' }}>
                <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                  <span style={{ flex: 'none', fontSize: 13, fontWeight: 800, color: 'var(--accent)', fontFamily: 'ui-monospace, monospace', marginTop: 1 }}>
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <div style={{ fontSize: 15.5, fontWeight: 700, color: 'var(--text)', lineHeight: 1.4, letterSpacing: '-0.01em' }}>{t.title}</div>
                </div>
                <p style={{ fontSize: 13.5, lineHeight: 1.6, color: 'var(--text-2)', marginTop: 10, paddingLeft: 23 }}>{t.description}</p>
                {t.points && (
                  <div style={{ marginTop: 12, paddingLeft: 23, display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {t.points.map((pt, j) => (
                      <div key={j} style={{ display: 'flex', gap: 8 }}>
                        <span style={{ flex: 'none', marginTop: 3, color: 'var(--accent)' }}>
                          <Icon name="check" size={15} stroke={2.6} />
                        </span>
                        <span style={{ fontSize: 13, lineHeight: 1.55, color: 'var(--text-2)' }}>{pt}</span>
                      </div>
                    ))}
                  </div>
                )}
                {t.images && (
                  <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {t.images.map((img, k) => (
                      <div key={k}>
                        <div style={{ borderRadius: 16, overflow: 'hidden', background: 'var(--bg-gray)' }}>
                          <img src={img.src} alt="" style={{ width: '100%', display: 'block' }} />
                        </div>
                        {img.caption && (
                          <div style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 6, textAlign: 'center' }}>{img.caption}</div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
                {t.table && (
                  <div style={{ marginTop: 14, borderRadius: 14, overflow: 'hidden', border: '1px solid var(--border)' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <thead>
                        <tr style={{ background: 'var(--bg-gray)' }}>
                          {t.table.headers.map((h, k) => (
                            <th key={k} style={{ padding: '9px 12px', fontSize: 11, fontWeight: 700, color: 'var(--text-3)', letterSpacing: '.05em', textAlign: k === 0 ? 'left' : 'center', borderBottom: '1px solid var(--border)' }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {t.table.rows.map((row, k) => (
                          <tr key={k} style={{ background: row.highlight ? 'var(--accent-bg)' : 'transparent', borderBottom: k < t.table!.rows.length - 1 ? '1px solid var(--border)' : 'none' }}>
                            {row.cells.map((cell, j) => (
                              <td key={j} style={{
                                padding: '9px 12px',
                                fontSize: 12.5,
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

        <div className="divider" />

        {/* architecture */}
        {s.arch && (
          <>
            <div className="pad" style={{ paddingTop: 28, paddingBottom: 28 }}>
              <SectionHead label="SYSTEM" title="아키텍처" />
              <div style={{ background: 'var(--bg-gray)', borderRadius: 16, padding: 16 }}>
                <img src={s.arch} alt="아키텍처 다이어그램" style={{ width: '100%', display: 'block' }} />
              </div>
            </div>
            <div className="divider" />
          </>
        )}

        {pr.link && (
          <div className="pad" style={{ paddingBottom: 36 }}>
            <a className="btn btn-primary" href={pr.link} target="_blank" rel="noreferrer" style={{ textDecoration: 'none' }}>
              실제 서비스 보기 <Icon name="arrow" size={18} stroke={2.4} />
            </a>
          </div>
        )}
        <div style={{ height: 8 }} />
      </div>
    </div>
  );
}
