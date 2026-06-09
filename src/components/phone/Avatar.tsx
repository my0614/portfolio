'use client';
import React from 'react';

interface AvatarProps {
  src?: string;
  initial?: string;
  size?: number;
  font?: number;
  bg?: string;
  color?: string;
}

export function Avatar({ src, initial, size = 56, font = 22, bg = 'var(--bg-gray)', color = 'var(--text-2)' }: AvatarProps) {
  return (
    <div className="squircle" style={{ width: size, height: size, background: bg }}>
      {src
        ? <img src={src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        : <span style={{ fontSize: font, fontWeight: 800, color }}>{initial}</span>}
    </div>
  );
}
