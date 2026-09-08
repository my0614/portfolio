'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { BLOG_CATEGORIES } from '@/data/blog';
import type { BlogCategory, BlogPost } from '@/data/blog';
import { Icon } from '@/components/phone/Icon';
import { Nav } from './Nav';
import { Footer } from './ContactSection';
import { useReveal, useTheme } from './hooks';

type FilterKey = 'all' | BlogCategory;

// 한글 기술 글 기준 대략적인 체감 속도(분당 500자)로 어림한 읽기 시간
function readMinutes(content: string) {
  return Math.max(1, Math.round(content.length / 500));
}

// 대표 시리즈 카드는 골라 읽을 수 있게 요약까지, 일반 목록 카드는 제목 위주로 간결하게
function BlogCard({ post, step }: { post: BlogPost; step?: number }) {
  const cat = BLOG_CATEGORIES.find(c => c.key === post.category);
  return (
    <Link href={`/blog/${post.id}`} className={step ? 'blog-card blog-featured-card' : 'blog-card'}>
      <div className="blog-card-meta">
        <span>
          {step && <span className="blog-featured-step">{step}</span>}
          {cat && <span className="blog-cat-tag">{cat.label}</span>}
        </span>
        <span className="blog-card-read">{readMinutes(post.content)}분 읽기</span>
      </div>
      <h3 className="blog-card-title">{post.title}</h3>
      {step && <p className="blog-card-excerpt">{post.excerpt}</p>}
      <span className="blog-card-foot">읽어보기 <Icon name="arrow" size={14} stroke={2.4} /></span>
    </Link>
  );
}

export function BlogListPage({ posts }: { posts: BlogPost[] }) {
  const [theme, toggleTheme] = useTheme();
  const [filter, setFilter] = useState<FilterKey>('all');
  const [query, setQuery] = useState('');
  const ref = useReveal();
  const q = query.trim().toLowerCase();
  const shown = posts
    .filter(p => filter === 'all' ? true : p.category === filter)
    .filter(p => q === '' ? true : (p.title + p.excerpt + p.content).toLowerCase().includes(q));
  // posts is sorted by order ascending (newest first) — reverse so the series reads oldest → newest
  const featured = posts.filter(p => p.featured).slice().reverse();
  const showFeatured = filter === 'all' && q === '' && featured.length > 0;

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

            {showFeatured && (
              <div className="blog-featured reveal">
                <div className="blog-featured-label">대표 시리즈 — EFK 관측 플랫폼에서 SRE까지</div>
                <div className="blog-featured-grid">
                  {featured.map((post, i) => (
                    <BlogCard key={post.id} post={post} step={i + 1} />
                  ))}
                </div>
              </div>
            )}

            {shown.length === 0 ? (
              <div className="blog-empty reveal">
                {posts.length === 0
                  ? '아직 작성된 글이 없어요. 곧 첫 글을 올릴 예정이에요.'
                  : '검색 결과가 없어요. 다른 검색어로 시도해 보세요.'}
              </div>
            ) : (
              <div className="blog-grid">
                {shown.map(post => (
                  <BlogCard key={post.id} post={post} />
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
