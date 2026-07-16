'use client';
import React, { useState, useEffect, useRef } from 'react';
import { BLOG_CATEGORIES, BLOG_POSTS, BlogBlock } from '@/data/blog';
import { Icon } from '@/components/phone/Icon';
import { CodeBlock } from './CodeBlock';

function Block({ block }: { block: BlogBlock }) {
  if (block.type === 'heading') return <h2 className="blog-block-heading">{block.text}</h2>;
  if (block.type === 'subheading') return <h3 className="blog-block-subheading">{block.text}</h3>;
  if (block.type === 'paragraph') return <p className="blog-block-paragraph">{block.text}</p>;
  if (block.type === 'quote') return <blockquote className="blog-quote">{block.text}</blockquote>;
  if (block.type === 'term') {
    return (
      <div className="blog-term">
        <div className="blog-term-name">{block.name}</div>
        <p className="blog-term-desc">{block.description}</p>
      </div>
    );
  }
  if (block.type === 'list') {
    const Tag = block.ordered ? 'ol' : 'ul';
    return (
      <Tag className="blog-list">
        {block.items.map((item, i) => <li key={i}>{item}</li>)}
      </Tag>
    );
  }
  return <CodeBlock code={block.code} />;
}

export function BlogDetailWeb({ id, onClose }: { id: string; onClose: () => void }) {
  const [scrolled, setScrolled] = useState(false);
  const scRef = useRef<HTMLDivElement>(null);
  const post = BLOG_POSTS.find(p => p.id === id);

  useEffect(() => {
    const el = scRef.current;
    if (!el) return;
    const onScroll = () => setScrolled(el.scrollTop > 180);
    el.addEventListener('scroll', onScroll, { passive: true });
    return () => el.removeEventListener('scroll', onScroll);
  }, [id]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  if (!post) return null;
  const cat = BLOG_CATEGORIES.find(c => c.key === post.category);

  return (
    <div className="detail open" ref={scRef}>
      <div className={'detail-bar' + (scrolled ? ' scrolled' : '')}>
        <div style={{ maxWidth: 860, margin: '0 auto', width: '100%', padding: '0 24px', display: 'flex', alignItems: 'center', height: '100%', position: 'relative' }}>
          <span className="dt-title">{post.title}</span>
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}>
            <button className="detail-close" onClick={onClose} aria-label="close">
              <Icon name="close" size={22} />
            </button>
          </div>
        </div>
      </div>
      <div className="detail-inner">
        {cat && <span className="blog-cat-tag">{cat.label}</span>}
        <h1 className="dt-title-lg" style={{ marginTop: 14 }}>{post.title}</h1>
        <div className="blog-card-date" style={{ marginTop: 10 }}>{post.date}</div>
        <p className="dt-summary">{post.excerpt}</p>

        <div className="dt-section" style={{ marginTop: 40 }}>
          {post.content?.map((block, i) => <Block key={i} block={block} />)}
        </div>
      </div>
    </div>
  );
}
