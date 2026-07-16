'use client';
import React from 'react';

const PY_KEYWORDS = new Set([
  'def', 'class', 'from', 'import', 'return', 'if', 'elif', 'else', 'try', 'except', 'finally',
  'for', 'while', 'in', 'not', 'and', 'or', 'is', 'None', 'True', 'False', 'async', 'await',
  'with', 'as', 'raise', 'pass', 'break', 'continue', 'lambda', 'yield', 'global', 'nonlocal', 'del', 'assert',
]);

const TOKEN_RE = /(#.*)|("""(?:[^"\\]|\\.)*"""|'''(?:[^'\\]|\\.)*'''|"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*')|(@[A-Za-z_]\w*)|(\b[A-Za-z_]\w*\b)|(\b\d+\.?\d*\b)/g;

function highlightLine(line: string) {
  const nodes: React.ReactNode[] = [];
  let last = 0;
  let prevKeyword: string | null = null;
  let key = 0;
  TOKEN_RE.lastIndex = 0;
  let m: RegExpExecArray | null;
  while ((m = TOKEN_RE.exec(line))) {
    if (m.index > last) nodes.push(line.slice(last, m.index));
    const [full, comment, str, decorator, word, num] = m;
    const endIdx = m.index + full.length;

    if (comment) {
      nodes.push(<span key={key++} className="tok-comment">{comment}</span>);
    } else if (str) {
      nodes.push(<span key={key++} className="tok-string">{str}</span>);
    } else if (decorator) {
      nodes.push(<span key={key++} className="tok-decorator">{decorator}</span>);
      prevKeyword = null;
    } else if (word) {
      if (PY_KEYWORDS.has(word)) {
        nodes.push(<span key={key++} className="tok-keyword">{word}</span>);
        prevKeyword = word;
      } else if (word === 'self') {
        nodes.push(<span key={key++} className="tok-self">{word}</span>);
        prevKeyword = null;
      } else if (prevKeyword === 'def' || prevKeyword === 'class') {
        nodes.push(<span key={key++} className="tok-func">{word}</span>);
        prevKeyword = null;
      } else if (line[endIdx] === '(') {
        nodes.push(<span key={key++} className="tok-call">{word}</span>);
        prevKeyword = null;
      } else {
        nodes.push(word);
        prevKeyword = null;
      }
    } else if (num) {
      nodes.push(<span key={key++} className="tok-number">{num}</span>);
      prevKeyword = null;
    }
    last = endIdx;
  }
  if (last < line.length) nodes.push(line.slice(last));
  return nodes.length ? nodes : [' '];
}

export function CodeBlock({ code }: { code: string }) {
  const lines = code.split('\n');
  return (
    <div className="ide-block">
      <div className="ide-titlebar">
        <span className="ide-dot ide-dot-red" />
        <span className="ide-dot ide-dot-yellow" />
        <span className="ide-dot ide-dot-green" />
      </div>
      <pre className="ide-body">
        <code>
          {lines.map((line, i) => (
            <div className="code-line" key={i}>
              <span className="code-line-num">{i + 1}</span>
              <span className="code-line-content">{highlightLine(line)}</span>
            </div>
          ))}
        </code>
      </pre>
    </div>
  );
}
