'use client';

import { useState } from 'react';
import styles from '../_components/demo.module.scss';

function StatusBadge({ children }: { children: string }) {
  return <span className={styles.astBadge}>{children}</span>;
}

export function AstFixture() {
  const [items, setItems] = useState(['Parser']);

  return (
    <div className={styles.fixture}>
      <section className={styles.astHero}>
        <StatusBadge>COMPILE-TIME IDENTITY</StatusBadge>
        <h2>源码位置由 AST 自动采集。</h2>
        <p>DOM 只携带短节点 ID，完整文件位置保存在独立映射表中。</p>
        <div className={styles.astFlow}>
          <span>TSX</span><i>→</i><span>AST</span><i>→</i><span>DOM</span><i>→</i><span>SOURCE</span>
        </div>
      </section>

      <div className={styles.fixtureGrid}>
        <article className={styles.astCodeCard}>
          <span>AUTOMATIC INJECTION</span>
          <pre><code>{'<button data-source-id="ast_…">'}</code></pre>
          <p>修改源码行数后重新生成，映射表会自动更新。</p>
        </article>

        <article className={styles.astSvgCard}>
          <svg viewBox="0 0 240 120" role="img" aria-label="AST 节点关系图">
            <path d="M20 88 C 62 12, 98 104, 140 36 S 190 18, 220 62" fill="none" stroke="currentColor" strokeWidth="7" strokeLinecap="round" />
            <circle cx="140" cy="36" r="10" />
          </svg>
          <div>
            <span>SVG HOST NODES</span>
            <h3>宿主节点分别映射</h3>
            <p>选择 SVG、path 或 circle，可以定位到各自的 JSX AST 节点。</p>
          </div>
        </article>
      </div>

      <section className={styles.dynamicSection}>
        <div>
          <span>REPEATED RENDERING</span>
          <h3>同一个 AST 节点，多次渲染</h3>
        </div>
        <button type="button" onClick={() => setItems((current) => [...current, `Node ${current.length + 1}`])}>
          添加实例
        </button>
        <div className={styles.instanceList}>
          {items.map((item, index) => (
            <div key={`${item}-${index}`}>
              <span>{String(index + 1).padStart(2, '0')}</span>
              <strong>{item}</strong>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
