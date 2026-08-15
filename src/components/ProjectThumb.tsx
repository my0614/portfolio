import { ProjectData } from '@/data/portfolio';

const ACCENTS: Record<string, string> = {
  hotdeal:   '#3b82f6',
  cs:        '#6366f1',
  drone:     '#8b5cf6',
  uav:       '#a78bfa',
  dflow:     '#06b6d4',
  pillcare:  '#0ea5e9',
  'dear-me': '#818cf8',
  grandfood: '#B96843',
};

const COMPANY_LOGOS: Record<string, string> = {
  '(주)무무즈':    '/projects/moomooz-logo.jpg',
  '한컴인스페이스': '/projects/hancom-logo.png',
  'GrandFood Team': '/projects/grandfood-mark.svg',
};

interface Props {
  project: ProjectData;
  style?: React.CSSProperties;
  className?: string;
}

export default function ProjectThumb({ project, style, className }: Props) {
  const accent = ACCENTS[project.id] ?? '#3182f6';
  const logo = COMPANY_LOGOS[project.company];

  if (logo) {
    return (
      <div
        className={className}
        style={{
          width: '100%', height: '100%', position: 'relative', overflow: 'hidden',
          background: '#f8f9fa',
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          boxSizing: 'border-box',
          ...style,
        }}
      >
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: accent }} />
        <img
          src={logo}
          alt={project.company}
          style={{ width: '60%', maxHeight: '50%', objectFit: 'contain' }}
        />
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0,
          padding: '12px 18px',
          background: 'linear-gradient(to top, rgba(0,0,0,0.06), transparent)',
        }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#333', letterSpacing: '-0.01em' }}>
            {project.title}
          </div>
        </div>
      </div>
    );
  }

  const tags = project.tags.slice(0, 3);
  return (
    <div
      className={className}
      style={{ width: '100%', height: '100%', position: 'relative', overflow: 'hidden', ...style }}
    >
      <img
        src={project.image.src}
        alt=""
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
      />
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.55)' }} />
      <div style={{
        position: 'absolute', inset: 0,
        background: `linear-gradient(135deg, ${accent}22 0%, transparent 60%)`,
      }} />
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(to top, rgba(0,0,0,0.75) 0%, transparent 50%)',
      }} />
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: accent }} />
      <div style={{
        position: 'absolute', inset: 0,
        display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
        padding: '18px 20px', boxSizing: 'border-box',
      }}>
        <div style={{
          fontSize: 15, fontWeight: 800, color: '#fff',
          lineHeight: 1.35, letterSpacing: '-0.02em', marginBottom: 8,
          textShadow: '0 1px 6px rgba(0,0,0,0.6)',
        }}>
          {project.title}
          {project.subtitle && (
            <div style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.65)', marginTop: 2 }}>
              {project.subtitle}
            </div>
          )}
        </div>
        <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
          {tags.map(t => (
            <span key={t} style={{
              fontSize: 10.5, fontWeight: 600, color: '#fff',
              background: 'rgba(0,0,0,0.45)',
              border: `1px solid ${accent}99`,
              borderRadius: 5, padding: '2px 7px',
              backdropFilter: 'blur(6px)',
            }}>
              {t}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
