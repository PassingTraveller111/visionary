'use client';

import { useState } from 'react';
import styles from '../_components/demo.module.scss';

const SOURCE_FILE = 'src/app/dom-source-lab/line-marker/Fixture.tsx';

function sourceMarker(line: number, id: string, column = 7) {
  return {
    'data-source-file': SOURCE_FILE,
    'data-source-line': line,
    'data-source-column': column,
    'data-source-id': id,
  };
}

export function LineMarkerFixture() {
  const [items, setItems] = useState(['Alpha']);

  return (
    <div className={styles.fixture}>
      <section className={styles.fixtureHero} {...sourceMarker(22, 'fixture-hero')}>
        <span {...sourceMarker(23, 'fixture-kicker', 9)}>MARKED INTERFACE</span>
        <h2 {...sourceMarker(24, 'fixture-title', 9)}>每一个界面节点，都留下源码坐标。</h2>
        <p {...sourceMarker(25, 'fixture-copy', 9)}>选择标题、文字或卡片，右侧将定位到这个文件中的对应行。</p>
      </section>

      <div className={styles.fixtureGrid}>
        <article className={styles.metricCard} {...sourceMarker(29, 'metric-card', 9)}>
          <span {...sourceMarker(30, 'metric-label', 11)}>Mapping confidence</span>
          <strong {...sourceMarker(31, 'metric-value', 11)}>100%</strong>
          <p {...sourceMarker(32, 'metric-copy', 11)}>显式标记无需运行时猜测。</p>
        </article>

        <article className={styles.messageCard} {...sourceMarker(35, 'message-card', 9)}>
          <div className={styles.avatar} {...sourceMarker(36, 'message-avatar', 11)}>V</div>
          <div>
            <span {...sourceMarker(38, 'message-label', 13)}>Nested nodes</span>
            <h3 {...sourceMarker(39, 'message-title', 13)}>选择嵌套层级</h3>
            <p {...sourceMarker(40, 'message-copy', 13)}>每个节点可以拥有自己的位置，也可以回退到最近的已标记祖先。</p>
          </div>
        </article>
      </div>

      <section className={styles.dynamicSection} {...sourceMarker(45, 'dynamic-section')}>
        <div>
          <span {...sourceMarker(47, 'dynamic-label', 11)}>DYNAMIC INSTANCES</span>
          <h3 {...sourceMarker(48, 'dynamic-title', 11)}>一个源码节点，多个运行时实例</h3>
        </div>
        <button
          type="button"
          {...sourceMarker(50, 'add-instance', 9)}
          onClick={() => setItems((current) => [...current, `Node ${current.length + 1}`])}
        >
          添加实例
        </button>
        <div className={styles.instanceList}>
          {items.map((item, index) => (
            <div key={`${item}-${index}`} {...sourceMarker(59, 'dynamic-instance', 13)}>
              <span>{String(index + 1).padStart(2, '0')}</span>
              <strong>{item}</strong>
            </div>
          ))}
        </div>
      </section>

      <div className={styles.unmarkedArea}>
        这是一个无标记节点，用于验证映射失败状态。
      </div>
    </div>
  );
}
