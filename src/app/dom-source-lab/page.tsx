import Link from 'next/link';
import styles from './lab.module.scss';

const plannedStrategies = [
  ['01', '行号标记', '通过 DOM 上的 data-source-* 属性直接读取源码位置。', '可体验'],
  ['02', 'AST 映射', '编译阶段解析源码、生成节点 ID，并输出独立映射表。', '计划中'],
  ['03', 'Source Map', '从生成代码位置继续回溯到原始 TSX 或模板。', '计划中'],
  ['04', '运行时匹配', '在无法改造构建流程时，根据 DOM 特征推断源码位置。', '计划中'],
];

export default function DomSourceLabPage() {
  return (
    <main className={styles.overview}>
      <section className={styles.hero}>
        <p>EXPERIMENT 001</p>
        <h1>从页面元素<br />回到源码现场</h1>
        <div className={styles.heroFooter}>
          <p>在同一套交互和测试场景下，逐步验证不同 DOM 源码映射方案的精度、成本与边界。</p>
          <Link href="/dom-source-lab/line-marker">启动行号标记 Demo →</Link>
        </div>
      </section>

      <section className={styles.strategyList} aria-label="方案列表">
        {plannedStrategies.map(([index, name, description, status]) => (
          <article key={index}>
            <span>{index}</span>
            <h2>{name}</h2>
            <p>{description}</p>
            <strong>{status}</strong>
          </article>
        ))}
      </section>
    </main>
  );
}
