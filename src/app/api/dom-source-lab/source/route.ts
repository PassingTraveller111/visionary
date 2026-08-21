import { NextRequest, NextResponse } from 'next/server';
import sourceFilesJson from '@/app/dom-source-lab/_generated/source-files.json';

const sourceFiles = sourceFilesJson as Record<string, { content: string }>;

export async function GET(request: NextRequest) {
  const file = request.nextUrl.searchParams.get('file');
  const source = file ? sourceFiles[file] : null;

  if (!file || !source) {
    return NextResponse.json({ error: '不允许读取该源码文件' }, { status: 403 });
  }

  return NextResponse.json({ file, content: source.content });
}
