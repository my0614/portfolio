'use client';
import React from 'react';

export function StatusBar() {
  return (
    <div className="statusbar">
      <span>9:41</span>
      <div className="sb-right">
        <svg width="18" height="12" viewBox="0 0 18 12" fill="currentColor">
          <rect x="0" y="7" width="3" height="5" rx="1"/>
          <rect x="5" y="4.5" width="3" height="7.5" rx="1"/>
          <rect x="10" y="2" width="3" height="10" rx="1"/>
          <rect x="15" y="0" width="3" height="12" rx="1" opacity="0.35"/>
        </svg>
        <svg width="17" height="12" viewBox="0 0 17 12" fill="currentColor">
          <path d="M8.5 2.5c2 0 3.8.8 5.1 2l1.3-1.4A9.3 9.3 0 008.5.5 9.3 9.3 0 002.1 3.1L3.4 4.5a7.3 7.3 0 015.1-2z" opacity="0.9"/>
          <path d="M8.5 6c1.1 0 2.1.4 2.8 1.1l1.3-1.4A6 6 0 008.5 4a6 6 0 00-4.1 1.7l1.3 1.4A4 4 0 018.5 6z"/>
          <circle cx="8.5" cy="10" r="1.6"/>
        </svg>
        <svg width="26" height="12" viewBox="0 0 26 12" fill="none">
          <rect x="0.6" y="0.6" width="21" height="10.8" rx="2.6" stroke="currentColor" strokeOpacity="0.4"/>
          <rect x="2" y="2" width="17" height="8" rx="1.4" fill="currentColor"/>
          <rect x="23" y="3.6" width="1.6" height="4.8" rx="0.8" fill="currentColor" fillOpacity="0.5"/>
        </svg>
      </div>
    </div>
  );
}
