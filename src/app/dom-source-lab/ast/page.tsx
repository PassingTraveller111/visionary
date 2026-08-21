'use client';

import { DemoShell } from '../_components/DemoShell';
import { astMapper } from '../_strategies/astMapper';
import { AstFixture } from './Fixture.generated';

export default function AstDemoPage() {
  return (
    <DemoShell
      mapper={astMapper}
      title="AST 自动映射"
      description="预编译脚本遍历 TSX AST，为宿主节点注入确定性的短 ID，同时生成独立位置表。DOM 不再暴露文件路径和行号。"
    >
      <AstFixture />
    </DemoShell>
  );
}
