'use client';

import { useEffect, useRef, useState } from 'react';
import type { SourceLocation } from '../_lib/types';
import styles from './demo.module.scss';

type SourceResponse = {
  content?: string;
  error?: string;
};

export function SourcePanel({ location }: { location: SourceLocation | null }) {
  const [source, setSource] = useState('');
  const [error, setError] = useState('');
  const activeLineRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!location) {
      setSource('');
      setError('');
      return;
    }

    const controller = new AbortController();
    setSource('');
    setError('');

    const query = new URLSearchParams({ file: location.file });
    fetch(`/api/dom-source-lab/source?${query}`, { signal: controller.signal })
      .then(async (response) => {
        const result = await response.json() as SourceResponse;
        if (!response.ok) throw new Error(result.error || '源码读取失败');
        setSource(result.content ?? '');
      })
      .catch((fetchError: Error) => {
        if (fetchError.name !== 'AbortError') setError(fetchError.message);
      });

    return () => controller.abort();
  }, [location]);

  useEffect(() => {
    activeLineRef.current?.scrollIntoView({ block: 'center' });
  }, [source, location]);

  if (!location) {
    return <div className={styles.sourceEmpty}>选择带标记的元素后，这里会显示真实源码。</div>;
  }

  if (error) return <div className={styles.sourceEmpty}>{error}</div>;
  if (!source) return <div className={styles.sourceEmpty}>正在读取源码…</div>;

  return (
    <div className={styles.sourceViewer}>
      <div className={styles.sourceTitle}>
        <span>{location.file.split('/').at(-1)}</span>
        <code>Ln {location.start.line}, Col {location.start.column}</code>
      </div>
      <div className={styles.code}>
        {source.split('\n').map((line, index) => {
          const lineNumber = index + 1;
          const active = lineNumber === location.start.line;
          return (
            <div
              className={active ? styles.activeLine : styles.codeLine}
              key={lineNumber}
              ref={active ? activeLineRef : undefined}
            >
              <span>{lineNumber}</span>
              <code>{line || ' '}</code>
            </div>
          );
        })}
      </div>
    </div>
  );
}
