import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { NextRequest, NextResponse } from 'next/server';

const ALLOWED_SOURCE_FILES = new Set([
  'src/app/dom-source-lab/line-marker/Fixture.tsx',
  'src/app/dom-source-lab/ast/Fixture.source.tsx',
]);

export async function GET(request: NextRequest) {
  const file = request.nextUrl.searchParams.get('file');
  if (!file || !ALLOWED_SOURCE_FILES.has(file)) {
    return NextResponse.json({ error: '不允许读取该源码文件' }, { status: 403 });
  }

  try {
    const filePath = path.join(process.cwd(), file);
    const content = await readFile(filePath, 'utf8');
    return NextResponse.json({ file, content });
  } catch {
    return NextResponse.json({ error: '源码文件不存在' }, { status: 404 });
  }
}
