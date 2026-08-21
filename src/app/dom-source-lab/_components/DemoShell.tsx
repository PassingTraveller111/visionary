'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { DomPicker } from '@/lib/dom-picker';
import type { DomSourceMapper, SourceLocation } from '../_lib/types';
import { SourcePanel } from './SourcePanel';
import styles from './demo.module.scss';

type DemoShellProps = {
  mapper: DomSourceMapper;
  title: string;
  description: string;
  children: ReactNode;
};

type Selection = {
  tag: string;
  selector: string;
  location: SourceLocation | null;
};

function describeElement(element: Element) {
  const id = element.id ? `#${element.id}` : '';
  const classes = Array.from(element.classList)
    .slice(0, 2)
    .map((className) => `.${className}`)
    .join('');
  return `${element.tagName.toLowerCase()}${id}${classes}`;
}

export function DemoShell({ mapper, title, description, children }: DemoShellProps) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const pickerRef = useRef<DomPicker | null>(null);
  const [isPicking, setIsPicking] = useState(false);
  const [hoveredTag, setHoveredTag] = useState('none');
  const [selection, setSelection] = useState<Selection | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const picker = new DomPicker({
      root: canvasRef.current,
      onHover: (element) => setHoveredTag(element?.tagName.toLowerCase() ?? 'none'),
      onSelect: async (element) => {
        const location = await mapper.locate(element);
        setSelection({
          tag: element.tagName.toLowerCase(),
          selector: describeElement(element),
          location,
        });
        setIsPicking(false);
      },
      onCancel: () => setIsPicking(false),
    });

    pickerRef.current = picker;
    return () => picker.destroy();
  }, [mapper]);

  const startPicking = () => {
    pickerRef.current?.start();
    setIsPicking(true);
  };

  const stopPicking = () => {
    pickerRef.current?.stop();
    setIsPicking(false);
    setHoveredTag('none');
  };

  return (
    <main className={styles.page}>
      <section className={styles.intro}>
        <div>
          <p>STRATEGY / {mapper.name}</p>
          <h1>{title}</h1>
        </div>
        <p>{description}</p>
      </section>

      <section className={styles.toolbar}>
        <div className={styles.actions}>
          <button type="button" onClick={startPicking} disabled={isPicking}>
            {isPicking ? '选择模式已开启' : '开始选择元素'}
          </button>
          <button type="button" onClick={stopPicking} disabled={!isPicking}>停止</button>
        </div>
        <div className={styles.status}>
          <span className={isPicking ? styles.activeDot : styles.dot} />
          {isPicking ? `悬停 <${hoveredTag}>，点击查看源码` : '等待开始'}
        </div>
      </section>

      <div className={styles.workspace}>
        <section className={styles.canvasSection}>
          <div className={styles.canvasHeader}>
            <span>INTERACTIVE CANVAS</span>
            <strong>{isPicking ? 'PICKING' : 'IDLE'}</strong>
          </div>
          <div ref={canvasRef} className={styles.canvas}>{children}</div>
        </section>

        <aside className={styles.inspector}>
          <div className={styles.selectionSummary}>
            <span>SELECTED ELEMENT</span>
            {selection ? (
              <>
                <code>{selection.selector}</code>
                {selection.location ? (
                  <p>{selection.location.file}:{selection.location.start.line}:{selection.location.start.column}</p>
                ) : (
                  <p>该元素及其祖先没有源码标记</p>
                )}
              </>
            ) : (
              <p>尚未选择元素</p>
            )}
          </div>
          <SourcePanel location={selection?.location ?? null} />
        </aside>
      </div>
    </main>
  );
}
