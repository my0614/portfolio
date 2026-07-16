import React from 'react';
import { BLOG_CATEGORIES, BlogBlock, BlogPost } from '@/data/blog';
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

export function BlogPostBody({ post }: { post: BlogPost }) {
  const cat = BLOG_CATEGORIES.find(c => c.key === post.category);
  return (
    <>
      {cat && <span className="blog-cat-tag">{cat.label}</span>}
      <h1 className="dt-title-lg" style={{ marginTop: 14 }}>{post.title}</h1>
      <div className="blog-card-date" style={{ marginTop: 10 }}>{post.date}</div>
      <p className="dt-summary">{post.excerpt}</p>
      <div className="dt-section" style={{ marginTop: 40 }}>
        {post.content?.map((block, i) => <Block key={i} block={block} />)}
      </div>
    </>
  );
}
