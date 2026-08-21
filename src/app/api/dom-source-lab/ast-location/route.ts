import { NextRequest, NextResponse } from 'next/server';
import sourceMap from '@/app/dom-source-lab/ast/fixture-map.json';
import type { SourceLocation } from '@/app/dom-source-lab/_lib/types';

const locations = sourceMap as Record<string, SourceLocation>;

export async function GET(request: NextRequest) {
  const nodeId = request.nextUrl.searchParams.get('id');
  const location = nodeId ? locations[nodeId] : null;

  if (!location) {
    return NextResponse.json({ error: 'AST 节点映射不存在' }, { status: 404 });
  }

  return NextResponse.json(location);
}
