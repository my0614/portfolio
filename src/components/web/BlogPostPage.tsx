'use client';
import React from 'react';
import Link from 'next/link';
import { BlogPost } from '@/data/blog';
import { Nav } from './Nav';
import { Footer } from './ContactSection';
import { BlogPostBody } from './BlogPostBody';
import { useTheme } from './hooks';

export function BlogPostPage({ post }: { post: BlogPost }) {
  const [theme, toggleTheme] = useTheme();

  return (
    <>
      <Nav theme={theme} toggleTheme={toggleTheme} />
      <main>
        <div className="detail-inner" style={{ paddingTop: 130 }}>
          <Link href="/blog" className="btn btn-ghost btn-sm">← 블로그 목록</Link>
          <div style={{ marginTop: 28 }}>
            <BlogPostBody post={post} />
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
