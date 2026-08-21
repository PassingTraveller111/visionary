import Link from 'next/link';
import type { ReactNode } from 'react';
import styles from './lab.module.scss';

const strategies = [
  { href: '/dom-source-lab/line-marker', label: '行号标记', available: true },
  { href: '/dom-source-lab/ast', label: 'AST 映射', available: true },
  { href: '/dom-source-lab/source-map', label: 'Source Map', available: false },
  { href: '/dom-source-lab/runtime', label: '运行时匹配', available: false },
  { href: '/dom-source-lab/compare', label: '方案对比', available: false },
];

export default function DomSourceLabLayout({ children }: { children: ReactNode }) {
  return (
    <div className={styles.lab}>
      <header className={styles.header}>
        <Link className={styles.brand} href="/dom-source-lab">
          <span>DOM / SOURCE</span>
          <strong>Mapping Lab</strong>
        </Link>
        <nav className={styles.nav} aria-label="源码映射方案">
          {strategies.map((strategy) =>
            strategy.available ? (
              <Link key={strategy.href} href={strategy.href}>{strategy.label}</Link>
            ) : (
              <span key={strategy.href} aria-disabled="true">
                {strategy.label}<small>soon</small>
              </span>
            ),
          )}
        </nav>
      </header>
      {children}
    </div>
  );
}
