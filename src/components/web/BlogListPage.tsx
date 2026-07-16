'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { BLOG_CATEGORIES } from '@/data/blog';
import type { BlogCategory, BlogPost } from '@/data/blog';
import { Nav } from './Nav';
import { Footer } from './ContactSection';
import { useReveal, useTheme } from './hooks';

type FilterKey = 'all' | BlogCategory;

export function BlogListPage({ posts }: { posts: BlogPost[] }) {
  const [theme, toggleTheme] = useTheme();
  const [filter, setFilter] = useState<FilterKey>('all');
  const ref = useReveal();
  const shown = posts.filter(p => filter === 'all' ? true : p.category === filter);

  return (
    <>
      <Nav theme={theme} toggleTheme={toggleTheme} />
      <main>
        <section className="sec-pad" style={{ paddingTop: 150 }}>
          <div className="container" ref={ref as React.RefObject<HTMLDivElement>}>
            <div className="proj-head">
              <div className="reveal">
                <div className="eyebrow">Blog</div>
                <h2 className="sec-title">블로그</h2>
                <p className="sec-sub">프로젝트를 만들며 정리한 기술 노트와 회고를 기록하는 공간이에요.</p>
              </div>
              <div className="filter reveal">
                <button className={filter === 'all' ? 'on' : ''} onClick={() => setFilter('all')}>전체</button>
                {BLOG_CATEGORIES.map(c => (
                  <button key={c.key} className={filter === c.key ? 'on' : ''} onClick={() => setFilter(c.key)}>{c.label}</button>
                ))}
              </div>
            </div>

            {shown.length === 0 ? (
              <div className="blog-empty reveal">아직 작성된 글이 없어요. 곧 첫 글을 올릴 예정이에요.</div>
            ) : (
              <div className="blog-grid">
                {shown.map(post => {
                  const cat = BLOG_CATEGORIES.find(c => c.key === post.category);
                  return (
                    <Link key={post.id} href={`/blog/${post.id}`} className="blog-card">
                      {cat && <span className="blog-cat-tag">{cat.label}</span>}
                      <h3 className="blog-card-title">{post.title}</h3>
                      <p className="blog-card-excerpt">{post.excerpt}</p>
                      <span className="blog-card-date">{post.date}</span>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
