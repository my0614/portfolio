'use client';
import React, { useEffect, useState } from 'react';

interface Contribution {
  date: string;
  count: number;
  level: number;
}

const LIGHT = ['#ebedf0', '#c5dffe', '#7ab8fc', '#3182f6', '#1b64da'];
const DARK  = ['#1e2530', '#16243d', '#1e3a6e', '#2d5db8', '#4d94ff'];
const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

export function GitHubContributions({ username }: { username: string }) {
  const [data, setData] = useState<Contribution[]>([]);
  const [hovered, setHovered] = useState<Contribution | null>(null);
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const sync = () => setDark(document.documentElement.dataset.theme === 'dark');
    sync();
    const mo = new MutationObserver(sync);
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    return () => mo.disconnect();
  }, []);

  useEffect(() => {
    fetch(`https://github-contributions-api.jogruber.de/v4/${username}?y=last`)
      .then(r => r.json())
      .then(d => setData(d.contributions))
      .catch(() => {});
  }, [username]);

  if (!data.length) {
    return <div className="gh-skeleton" />;
  }

  const colors = dark ? DARK : LIGHT;

  const weeks: Contribution[][] = [];
  for (let i = 0; i < data.length; i += 7) {
    weeks.push(data.slice(i, i + 7));
  }

  const monthLabels: { label: string; col: number }[] = [];
  weeks.forEach((week, wi) => {
    const d = new Date(week[0].date);
    if (d.getDate() <= 7) {
      monthLabels.push({ label: MONTHS[d.getMonth()], col: wi });
    }
  });

  return (
    <div className="gh-contrib">
      <div className="gh-months-row" style={{ position: 'relative', height: 16 }}>
        {monthLabels.map((m, i) => (
          <span
            key={i}
            style={{ position: 'absolute', left: `${(m.col / weeks.length) * 100}%`, fontSize: 10, color: 'var(--text-4)', fontWeight: 600, letterSpacing: '.04em', textTransform: 'uppercase' }}
          >
            {m.label}
          </span>
        ))}
      </div>

      <div className="gh-grid">
        {weeks.map((week, wi) => (
          <div key={wi} className="gh-week">
            {week.map((day, di) => (
              <div
                key={di}
                className={`gh-day${hovered?.date === day.date ? ' sel' : ''}`}
                style={{ background: colors[day.level] }}
                onMouseEnter={() => setHovered(day)}
                onMouseLeave={() => setHovered(null)}
                aria-label={`${day.date}: ${day.count}개 커밋`}
              />
            ))}
          </div>
        ))}
      </div>

      <div className={`gh-info${hovered ? ' visible' : ''}`}>
        {hovered ? (
          <>
            <span className="gh-info-date">{hovered.date}</span>
            <span className="gh-info-count">{hovered.count}개 커밋</span>
          </>
        ) : (
          <span className="gh-info-hint">날짜에 마우스를 올리면 커밋 수를 확인할 수 있어요</span>
        )}
      </div>
    </div>
  );
}
