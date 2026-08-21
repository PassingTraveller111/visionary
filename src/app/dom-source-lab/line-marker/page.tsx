'use client';

import { DemoShell } from '../_components/DemoShell';
import { lineMarkerMapper } from '../_strategies/lineMarker';
import { LineMarkerFixture } from './Fixture';

export default function LineMarkerDemoPage() {
  return (
    <DemoShell
      mapper={lineMarkerMapper}
      title="行号标记映射"
      description="在渲染节点上携带文件、行和列信息。选择器返回原始 Element，映射器沿 DOM 向上寻找最近的源码标记。"
    >
      <LineMarkerFixture />
    </DemoShell>
  );
}
