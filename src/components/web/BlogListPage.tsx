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
  const [query, setQuery] = useState('');
  const ref = useReveal();
  const q = query.trim().toLowerCase();
  const shown = posts
    .filter(p => filter === 'all' ? true : p.category === filter)
    .filter(p => q === '' ? true : (p.title + p.excerpt + p.content).toLowerCase().includes(q));

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

            <div className="blog-search reveal">
              <svg className="blog-search-icon" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                className="blog-search-input"
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="제목이나 내용으로 검색"
                aria-label="블로그 글 검색"
              />
            </div>

            {shown.length === 0 ? (
              <div className="blog-empty reveal">
                {posts.length === 0
                  ? '아직 작성된 글이 없어요. 곧 첫 글을 올릴 예정이에요.'
                  : '검색 결과가 없어요. 다른 검색어로 시도해 보세요.'}
              </div>
            ) : (
              <div className="blog-grid">
                {shown.map(post => {
                  const cat = BLOG_CATEGORIES.find(c => c.key === post.category);
                  return (
                    <Link key={post.id} href={`/blog/${post.id}`} className="blog-card">
                      {cat && <span className="blog-cat-tag">{cat.label}</span>}
                      <h3 className="blog-card-title">{post.title}</h3>
                      <p className="blog-card-excerpt">{post.excerpt}</p>
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
