import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { Element } from 'hast';
import { BLOG_CATEGORIES } from '@/data/blog';
import type { BlogPost } from '@/data/blog';
import { CodeBlock } from './CodeBlock';
import { MermaidDiagram } from './MermaidDiagram';

function extractText(node: Element): string {
  return node.children
    .map((child) => (child.type === 'text' ? child.value : 'children' in child ? extractText(child) : ''))
    .join('');
}

type WithNode<P> = P & { node?: Element };

const components = {
  h2: ({ node, ...props }: WithNode<React.ComponentProps<'h2'>>) => <h2 className="blog-block-heading" {...props} />,
  h3: ({ node, ...props }: WithNode<React.ComponentProps<'h3'>>) => <h3 className="blog-block-subheading" {...props} />,
  p: ({ node, ...props }: WithNode<React.ComponentProps<'p'>>) => <p className="blog-block-paragraph" {...props} />,
  blockquote: ({ node, ...props }: WithNode<React.ComponentProps<'blockquote'>>) => <blockquote className="blog-quote" {...props} />,
  ul: ({ node, ...props }: WithNode<React.ComponentProps<'ul'>>) => <ul className="blog-list" {...props} />,
  ol: ({ node, ...props }: WithNode<React.ComponentProps<'ol'>>) => <ol className="blog-list" {...props} />,
  table: ({ node, ...props }: WithNode<React.ComponentProps<'table'>>) => (
    <div className="blog-table-wrap"><table className="blog-table" {...props} /></div>
  ),
  img: ({ node, ...props }: WithNode<React.ComponentProps<'img'>>) => <img className="blog-img" {...props} />,
  a: ({ node, ...props }: WithNode<React.ComponentProps<'a'>>) => <a target="_blank" rel="noreferrer" {...props} />,
  pre: ({ node }: WithNode<{}>) => {
    const codeNode = node?.children.find((c): c is Element => c.type === 'element' && c.tagName === 'code');
    const code = codeNode ? extractText(codeNode).replace(/\n$/, '') : '';
    const className = codeNode?.properties?.className;
    const classes = Array.isArray(className) ? className.map(String) : [];
    if (classes.includes('language-mermaid')) {
      return <MermaidDiagram code={code} />;
    }
    return <CodeBlock code={code} />;
  },
  code: ({ node, ...props }: WithNode<React.ComponentProps<'code'>>) => <code className="inline-code" {...props} />,
};

export function BlogPostBody({ post }: { post: BlogPost }) {
  const cat = BLOG_CATEGORIES.find(c => c.key === post.category);
  return (
    <>
      {cat && <span className="blog-cat-tag">{cat.label}</span>}
      <h1 className="dt-title-lg" style={{ marginTop: 14 }}>{post.title}</h1>
      <p className="dt-summary" style={{ marginTop: 14 }}>{post.excerpt}</p>
      <div className="dt-section" style={{ marginTop: 40 }}>
        <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
          {post.content}
        </ReactMarkdown>
      </div>
    </>
  );
}
