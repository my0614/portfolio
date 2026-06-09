'use client';
import React from 'react';

type IconName =
  | 'back' | 'home' | 'grid' | 'user' | 'mail' | 'phone' | 'github'
  | 'chev' | 'chevDown' | 'arrow' | 'link' | 'doc' | 'check' | 'spark'
  | 'target' | 'layers' | 'download' | 'close' | 'sun' | 'moon';

interface IconProps {
  name: IconName;
  size?: number;
  stroke?: number;
  color?: string;
  fill?: string;
}

export function Icon({ name, size = 24, stroke = 2, color = 'currentColor', fill = 'none' }: IconProps) {
  const p = { width: size, height: size, viewBox: '0 0 24 24', fill, stroke: color, strokeWidth: stroke, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, style: { display: 'block' } };

  const paths: Record<IconName, React.ReactNode> = {
    back: <path d="M15 19l-7-7 7-7" />,
    home: <path d="M3 11l9-8 9 8M5 9.5V20h5v-6h4v6h5V9.5" />,
    grid: <><rect x="3.5" y="3.5" width="7" height="7" rx="2" /><rect x="13.5" y="3.5" width="7" height="7" rx="2" /><rect x="3.5" y="13.5" width="7" height="7" rx="2" /><rect x="13.5" y="13.5" width="7" height="7" rx="2" /></>,
    user: <><circle cx="12" cy="8" r="4" /><path d="M4 20c0-3.5 3.5-6 8-6s8 2.5 8 6" /></>,
    mail: <><rect x="3" y="5" width="18" height="14" rx="3" /><path d="M4 7l8 6 8-6" /></>,
    phone: <path d="M5 4h3l2 5-2.5 1.5a11 11 0 005 5L16 13l5 2v3a2 2 0 01-2 2A16 16 0 013 6a2 2 0 012-2z" />,
    github: <path d="M9 19c-4 1.5-4-2.5-6-3m12 5v-3.5c0-1 .1-1.4-.5-2 2.8-.3 5.5-1.4 5.5-6a4.6 4.6 0 00-1.3-3.2 4.3 4.3 0 00-.1-3.2s-1.1-.3-3.5 1.3a12 12 0 00-6.2 0C6.5 2.8 5.4 3.1 5.4 3.1a4.3 4.3 0 00-.1 3.2A4.6 4.6 0 004 9.5c0 4.6 2.7 5.7 5.5 6-.6.6-.6 1.2-.5 2V21" />,
    chev: <path d="M9 6l6 6-6 6" />,
    chevDown: <path d="M6 9l6 6 6-6" />,
    arrow: <path d="M5 12h14M13 6l6 6-6 6" />,
    link: <><path d="M10 13a5 5 0 007 0l2-2a5 5 0 00-7-7l-1 1" /><path d="M14 11a5 5 0 00-7 0l-2 2a5 5 0 007 7l1-1" /></>,
    doc: <><path d="M6 2.5h7l5 5V21a1 1 0 01-1 1H6a1 1 0 01-1-1V3.5a1 1 0 011-1z" /><path d="M13 2.5V8h5" /></>,
    check: <path d="M5 12.5l4.5 4.5L19 7" />,
    spark: <path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3z" />,
    target: <><circle cx="12" cy="12" r="8" /><circle cx="12" cy="12" r="3.5" /></>,
    layers: <><path d="M12 3l9 5-9 5-9-5 9-5z" /><path d="M3 13l9 5 9-5" /></>,
    download: <path d="M12 4v11m0 0l-4-4m4 4l4-4M5 19h14" />,
    close: <path d="M6 6l12 12M18 6L6 18" />,
    sun: <><circle cx="12" cy="12" r="4.2" /><path d="M12 2v2.5M12 19.5V22M4.9 4.9l1.8 1.8M17.3 17.3l1.8 1.8M2 12h2.5M19.5 12H22M4.9 19.1l1.8-1.8M17.3 6.7l1.8-1.8" /></>,
    moon: <path d="M20 14.5A8 8 0 119.5 4a6.5 6.5 0 0010.5 10.5z" />,
  };

  return <svg {...p}>{paths[name] ?? null}</svg>;
}
