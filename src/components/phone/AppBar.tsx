'use client';
import React from 'react';
import { Icon } from './Icon';

interface AppBarProps {
  title: string;
  onBack?: () => void;
  scrolled?: boolean;
  right?: React.ReactNode;
}

export function AppBar({ title, onBack, scrolled, right }: AppBarProps) {
  return (
    <div className={'appbar' + (scrolled ? ' scrolled' : '')}>
      {onBack && (
        <button className="iconbtn" onClick={onBack} aria-label="back">
          <Icon name="back" size={26} />
        </button>
      )}
      <div className="appbar-title" style={{ paddingLeft: onBack ? 0 : 18 }}>{title}</div>
      <div className="appbar-spacer" />
      {right}
    </div>
  );
}
