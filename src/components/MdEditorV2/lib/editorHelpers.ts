import type {FindMatch, HighlightRange, ImageTarget, SelectionRange} from '../types';
import {replaceRange} from './textEdit';

type EditorStyles = Record<string, string>;

export const getRandomId = () => globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`;

export const escapeHtmlAttribute = (value: string) => value.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

export const getLineColumn = (value: string, cursor: number) => {
    const safeCursor = Math.max(0, Math.min(cursor, value.length));
    const beforeCursor = value.slice(0, safeCursor);
    const lines = beforeCursor.split('\n');
    return {
        line: lines.length,
        column: lines[lines.length - 1].length + 1,
    };
}

export const formatSavedAt = (date?: Date | null) => {
    if (!date) return '';
    return date.toLocaleTimeString('zh-CN', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
    });
}

export const findMatches = (value: string, query: string): FindMatch[] => {
    if (!query) return [];
    const matches: FindMatch[] = [];
    const normalizedValue = value.toLowerCase();
    const normalizedQuery = query.toLowerCase();
    let index = normalizedValue.indexOf(normalizedQuery);

    while (index !== -1) {
        matches.push({ start: index, end: index + query.length });
        index = normalizedValue.indexOf(normalizedQuery, index + Math.max(query.length, 1));
    }

    return matches;
}

const collectRegexRanges = (value: string, regex: RegExp, className: string) => {
    const ranges: HighlightRange[] = [];
    let match: RegExpExecArray | null;

    while ((match = regex.exec(value))) {
        if (!match[0]) continue;
        ranges.push({
            start: match.index,
            end: match.index + match[0].length,
            className,
        });
    }

    return ranges;
}

export const collectMarkdownHighlightRanges = (value: string, styles: EditorStyles) => {
    return [
        ...collectRegexRanges(value, /^#{1,6}\s.+$/gm, styles.syntaxHeading),
        ...collectRegexRanges(value, /^>\s?.+$/gm, styles.syntaxQuote),
        ...collectRegexRanges(value, /^\s*(?:[-*+]\s+|\d+\.\s+).+$/gm, styles.syntaxList),
        ...collectRegexRanges(value, /^\|.*\|$/gm, styles.syntaxTable),
        ...collectRegexRanges(value, /```[\s\S]*?```/g, styles.syntaxBlockCode),
        ...collectRegexRanges(value, /`[^`\n]+`/g, styles.syntaxInlineCode),
        ...collectRegexRanges(value, /\$\$[\s\S]*?\$\$/g, styles.syntaxFormula),
        ...collectRegexRanges(value, /\$[^$\n]+\$/g, styles.syntaxFormula),
        ...collectRegexRanges(value, /!?\[[^\]\n]+\]\([^\s)]+\)/g, styles.syntaxLink),
        ...collectRegexRanges(value, /(\*\*|__)(?=\S)([\s\S]*?\S)\1/g, styles.syntaxBold),
        ...collectRegexRanges(value, /(~~)(?=\S)([\s\S]*?\S)\1/g, styles.syntaxDelete),
        ...collectRegexRanges(value, /(^|[^*])\*[^*\n]+\*/g, styles.syntaxItalic),
        ...collectRegexRanges(value, /<img\s+[^>]*>/gi, styles.syntaxLink),
    ];
}

const getImageAttribute = (text: string, attribute: string) => {
    const match = new RegExp(`${attribute}=["']([^"']*)["']`, 'i').exec(text);
    return match?.[1] ?? '';
}

export const findImageTarget = (value: string, cursor: number): ImageTarget | null => {
    const candidates: ImageTarget[] = [];
    const markdownImageRegex = /!\[([^\]]*)\]\(([^)\s]+)\)/g;
    const htmlImageRegex = /<img\s+[^>]*src=["'][^"']+["'][^>]*>/gi;
    let match: RegExpExecArray | null;

    while ((match = markdownImageRegex.exec(value))) {
        candidates.push({
            range: { start: match.index, end: match.index + match[0].length },
            url: match[2],
            alt: match[1],
            width: '',
        });
    }

    while ((match = htmlImageRegex.exec(value))) {
        const html = match[0];
        candidates.push({
            range: { start: match.index, end: match.index + html.length },
            url: getImageAttribute(html, 'src'),
            alt: getImageAttribute(html, 'alt'),
            width: getImageAttribute(html, 'width'),
        });
    }

    if (candidates.length === 0) return null;
    const target = candidates.find(candidate => cursor >= candidate.range.start && cursor <= candidate.range.end);
    if (target) return target;

    return candidates
        .map(candidate => ({ candidate, distance: Math.min(Math.abs(cursor - candidate.range.start), Math.abs(cursor - candidate.range.end)) }))
        .sort((a, b) => a.distance - b.distance)[0].candidate;
}

export const getEnterContinuation = (value: string, selection: SelectionRange) => {
    if (selection.start !== selection.end) return null;
    const cursor = selection.start;
    const lineStart = value.lastIndexOf('\n', Math.max(0, cursor - 1)) + 1;
    const currentLineBeforeCursor = value.slice(lineStart, cursor);
    const unorderedMatch = /^(\s*)([-*+])\s+(.*)$/.exec(currentLineBeforeCursor);
    const orderedMatch = /^(\s*)(\d+)\.\s+(.*)$/.exec(currentLineBeforeCursor);
    const quoteMatch = /^(\s*>\s?)(.*)$/.exec(currentLineBeforeCursor);

    if (unorderedMatch) {
        if (!unorderedMatch[3].trim()) return replaceRange(value, { start: lineStart, end: cursor }, '');
        const prefix = `${unorderedMatch[1]}${unorderedMatch[2]} `;
        return replaceRange(value, selection, `\n${prefix}`);
    }

    if (orderedMatch) {
        if (!orderedMatch[3].trim()) return replaceRange(value, { start: lineStart, end: cursor }, '');
        const prefix = `${orderedMatch[1]}${Number(orderedMatch[2]) + 1}. `;
        return replaceRange(value, selection, `\n${prefix}`);
    }

    if (quoteMatch) {
        if (!quoteMatch[2].trim()) return replaceRange(value, { start: lineStart, end: cursor }, '');
        return replaceRange(value, selection, `\n${quoteMatch[1]}`);
    }

    return null;
}

export const createMarkdownTable = (rows: number, columns: number) => {
    const header = Array.from({ length: columns }, (_, index) => `标题 ${index + 1}`);
    const separator = Array.from({ length: columns }, () => '---');
    const body = Array.from({ length: rows }, () => Array.from({ length: columns }, () => '内容'));
    const stringifyRow = (cells: string[]) => `| ${cells.join(' | ')} |`;

    return [
        stringifyRow(header),
        stringifyRow(separator),
        ...body.map(stringifyRow),
    ].join('\n') + '\n';
}
