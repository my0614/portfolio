'use client';
import React, { useState } from 'react';
import { BLOG_CATEGORIES, BLOG_POSTS, BlogCategory } from '@/data/blog';
import { useReveal } from './hooks';

type FilterKey = 'all' | BlogCategory;

export function BlogSection({ onOpen }: { onOpen: (id: string) => void }) {
  const [filter, setFilter] = useState<FilterKey>('all');
  const ref = useReveal();
  const shown = BLOG_POSTS.filter(p => filter === 'all' ? true : p.category === filter);

  return (
    <section id="blog" className="sec-pad">
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
              const card = (
                <>
                  {cat && <span className="blog-cat-tag">{cat.label}</span>}
                  <h3 className="blog-card-title">{post.title}</h3>
                  <p className="blog-card-excerpt">{post.excerpt}</p>
                  <span className="blog-card-date">{post.date}</span>
                </>
              );
              if (post.content) {
                return (
                  <button key={post.id} className="blog-card" onClick={() => onOpen(post.id)}>
                    {card}
                  </button>
                );
              }
              return (
                <a key={post.id} href={post.link ?? '#'} target={post.link ? '_blank' : undefined} rel={post.link ? 'noreferrer' : undefined} className="blog-card">
                  {card}
                </a>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
