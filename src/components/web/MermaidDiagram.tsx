'use client';
import React, { useEffect, useState } from 'react';

let mermaidPromise: Promise<typeof import('mermaid')> | null = null;
function loadMermaid() {
  if (!mermaidPromise) mermaidPromise = import('mermaid');
  return mermaidPromise;
}

export function MermaidDiagram({ code }: { code: string }) {
  const [svg, setSvg] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    loadMermaid().then(async ({ default: mermaid }) => {
      mermaid.initialize({ startOnLoad: false, theme: 'neutral', securityLevel: 'strict' });
      const id = 'mermaid-' + Math.random().toString(36).slice(2);
      try {
        const { svg } = await mermaid.render(id, code);
        if (!cancelled) setSvg(svg);
      } catch {
        if (!cancelled) setFailed(true);
      }
    });
    return () => { cancelled = true; };
  }, [code]);

  if (failed) return <pre className="ide-body" style={{ padding: 20 }}>{code}</pre>;
  if (!svg) return <div className="mermaid-loading">다이어그램 렌더링 중...</div>;
  return <div className="mermaid-diagram" dangerouslySetInnerHTML={{ __html: svg }} />;
}
