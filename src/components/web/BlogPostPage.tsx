'use client';
import React from 'react';
import Link from 'next/link';
import { Nav } from './Nav';
import { Footer } from './ContactSection';
import { useTheme } from './hooks';

export function BlogPostPage({ children }: { children: React.ReactNode }) {
  const [theme, toggleTheme] = useTheme();

  return (
    <>
      <Nav theme={theme} toggleTheme={toggleTheme} />
      <main>
        <div className="detail-inner" style={{ paddingTop: 130 }}>
          <Link href="/blog" className="btn btn-ghost btn-sm">← 블로그 목록</Link>
          <div style={{ marginTop: 28 }}>
            {children}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
