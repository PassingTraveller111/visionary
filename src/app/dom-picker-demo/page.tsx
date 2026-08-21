'use client';

import { useEffect, useRef, useState } from 'react';
import { DomPicker } from '@/lib/dom-picker';
import styles from './page.module.scss';

type ElementDetails = {
  name: string;
  id: string;
  classes: string;
  size: string;
  text: string;
};

function getElementDetails(element: Element): ElementDetails {
  const rect = element.getBoundingClientRect();
  return {
    name: element.tagName.toLowerCase(),
    id: element.id || 'none',
    classes: Array.from(element.classList).join(' ') || 'none',
    size: `${Math.round(rect.width)} × ${Math.round(rect.height)}`,
    text: element.textContent?.replace(/\s+/g, ' ').trim().slice(0, 100) || 'none',
  };
}

export default function DomPickerDemoPage() {
  const pickerRef = useRef<DomPicker | null>(null);
  const [isPicking, setIsPicking] = useState(false);
  const [hoveredTag, setHoveredTag] = useState('none');
  const [selected, setSelected] = useState<ElementDetails | null>(null);
  const [dynamicItems, setDynamicItems] = useState(1);

  useEffect(() => {
    const picker = new DomPicker({
      exclude: '[data-picker-ignore]',
      onHover: (element) => setHoveredTag(element?.tagName.toLowerCase() ?? 'none'),
      onSelect: (element) => {
        setSelected(getElementDetails(element));
        setIsPicking(false);
      },
      onCancel: () => setIsPicking(false),
    });

    pickerRef.current = picker;
    return () => picker.destroy();
  }, []);

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
      <section className={styles.hero}>
        <div>
          <p className={styles.eyebrow}>Framework-agnostic DOM utility</p>
          <h1>DOM Picker Lab</h1>
          <p className={styles.intro}>
            开启选择模式后悬停任意元素，点击确认选择，按 Escape 取消。插件只返回原始 DOM Element，后续映射逻辑保持独立。
          </p>
        </div>
        <div className={styles.heroMark} aria-hidden="true">
          <span>DOM</span>
          <strong>↗</strong>
        </div>
      </section>

      <section className={styles.controlBar} data-picker-ignore>
        <div className={styles.actions}>
          <button className={styles.primaryButton} onClick={startPicking} disabled={isPicking}>
            {isPicking ? '正在选择…' : '开始选择元素'}
          </button>
          <button className={styles.secondaryButton} onClick={stopPicking} disabled={!isPicking}>
            停止
          </button>
        </div>
        <div className={styles.liveStatus}>
          <span className={isPicking ? styles.activeDot : styles.dot} />
          <span>{isPicking ? `悬停：<${hoveredTag}>` : '选择器未启动'}</span>
        </div>
      </section>

      <div className={styles.workspace}>
        <section className={styles.testArea}>
          <div className={styles.sectionHeading}>
            <span>01</span>
            <div>
              <h2>基础元素</h2>
              <p>测试嵌套文本、按钮、表单元素和链接。</p>
            </div>
          </div>

          <div className={styles.cardGrid}>
            <article className={styles.profileCard}>
              <div className={styles.avatar}>V</div>
              <div>
                <p className={styles.cardLabel}>Nested content</p>
                <h3>选择不同层级</h3>
                <p>可以分别选择卡片、头像、标题或这段描述。</p>
              </div>
              <button type="button" className={styles.iconButton} aria-label="收藏">
                ☆
              </button>
            </article>

            <article className={styles.formCard}>
              <label htmlFor="picker-email">测试输入框</label>
              <div className={styles.inputRow}>
                <input id="picker-email" type="email" placeholder="hello@example.com" />
                <button type="button">提交</button>
              </div>
              <a href="#scroll-test">跳到滚动容器测试</a>
            </article>
          </div>

          <div className={styles.sectionHeading}>
            <span>02</span>
            <div>
              <h2>特殊布局</h2>
              <p>测试 SVG、CSS transform 和容器内滚动后的定位刷新。</p>
            </div>
          </div>

          <div className={styles.specialGrid}>
            <div className={styles.transformCard}>
              <span>transform</span>
              <strong>旋转元素</strong>
            </div>

            <div className={styles.svgCard}>
              <svg viewBox="0 0 180 110" role="img" aria-label="测试折线图">
                <defs>
                  <linearGradient id="picker-gradient" x1="0" x2="1">
                    <stop offset="0" stopColor="#ff5c35" />
                    <stop offset="1" stopColor="#ffc857" />
                  </linearGradient>
                </defs>
                <path d="M10 88 C 45 84, 52 24, 88 55 S 135 12, 170 28" fill="none" stroke="url(#picker-gradient)" strokeWidth="8" strokeLinecap="round" />
                <circle cx="88" cy="55" r="8" fill="#151515" />
              </svg>
              <p>SVG path 与 circle 都可单独选中</p>
            </div>

            <div id="scroll-test" className={styles.scrollCard}>
              {Array.from({ length: 8 }, (_, index) => (
                <div key={index} className={styles.scrollItem}>
                  <span>{String(index + 1).padStart(2, '0')}</span>
                  <p>滚动测试项目 {index + 1}</p>
                </div>
              ))}
            </div>
          </div>

          <div className={styles.sectionHeading}>
            <span>03</span>
            <div>
              <h2>动态内容</h2>
              <p>新增节点后无需重新初始化选择器。</p>
            </div>
          </div>

          <button
            type="button"
            className={styles.addButton}
            onClick={() => setDynamicItems((count) => count + 1)}
          >
            添加动态节点
          </button>
          <div className={styles.dynamicGrid}>
            {Array.from({ length: dynamicItems }, (_, index) => (
              <div className={styles.dynamicCard} key={index}>
                <span>NODE {index + 1}</span>
                <strong>运行时节点</strong>
              </div>
            ))}
          </div>
        </section>

        <aside className={styles.resultPanel} data-picker-ignore>
          <p className={styles.panelLabel}>Selection output</p>
          <h2>选中结果</h2>
          {selected ? (
            <dl>
              <div><dt>tag</dt><dd>{selected.name}</dd></div>
              <div><dt>id</dt><dd>{selected.id}</dd></div>
              <div><dt>class</dt><dd>{selected.classes}</dd></div>
              <div><dt>size</dt><dd>{selected.size}</dd></div>
              <div><dt>text</dt><dd>{selected.text}</dd></div>
            </dl>
          ) : (
            <div className={styles.emptyResult}>
              <span>⌁</span>
              <p>尚未选择元素</p>
            </div>
          )}
          <div className={styles.boundaryNote}>
            控制栏和结果面板带有 <code>data-picker-ignore</code>，用于验证排除区域。
          </div>
        </aside>
      </div>
    </main>
  );
}
