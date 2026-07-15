import type {EditorCommand, SelectionRange, TextEditResult} from '../types';

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(value, max));

export const normalizeSelection = (selection: SelectionRange, valueLength: number): SelectionRange => {
    const start = clamp(Math.min(selection.start, selection.end), 0, valueLength);
    const end = clamp(Math.max(selection.start, selection.end), 0, valueLength);
    return { start, end };
}

export const replaceRange = (
    value: string,
    selection: SelectionRange,
    insertText: string,
    nextSelection?: SelectionRange,
): TextEditResult => {
    const safeSelection = normalizeSelection(selection, value.length);
    const nextValue = value.slice(0, safeSelection.start) + insertText + value.slice(safeSelection.end);
    const fallbackCursor = safeSelection.start + insertText.length;

    return {
        value: nextValue,
        selection: nextSelection ?? { start: fallbackCursor, end: fallbackCursor },
    };
}

const wrapSelection = (value: string, selection: SelectionRange, before: string, after = before, placeholder = '文本') => {
    const safeSelection = normalizeSelection(selection, value.length);
    const selectedText = value.slice(safeSelection.start, safeSelection.end);
    const beforeStart = safeSelection.start - before.length;
    const afterEnd = safeSelection.end + after.length;

    if (
        selectedText &&
        beforeStart >= 0 &&
        value.slice(beforeStart, safeSelection.start) === before &&
        value.slice(safeSelection.end, afterEnd) === after
    ) {
        const nextValue = value.slice(0, beforeStart) + selectedText + value.slice(afterEnd);
        return {
            value: nextValue,
            selection: {
                start: beforeStart,
                end: beforeStart + selectedText.length,
            },
        };
    }

    const content = selectedText || placeholder;
    const insertText = `${before}${content}${after}`;
    const start = safeSelection.start + before.length;
    const end = start + content.length;

    return replaceRange(value, safeSelection, insertText, { start, end });
}

const getSelectedLineRange = (value: string, selection: SelectionRange) => {
    const safeSelection = normalizeSelection(selection, value.length);
    const lineStart = value.lastIndexOf('\n', Math.max(0, safeSelection.start - 1)) + 1;
    const lineEndBreak = value.indexOf('\n', safeSelection.end);
    const lineEnd = lineEndBreak === -1 ? value.length : lineEndBreak;

    return {
        start: lineStart,
        end: lineEnd,
    };
}

const prefixSelectedLines = (
    value: string,
    selection: SelectionRange,
    createPrefix: (index: number) => string,
    removablePrefixes: RegExp[],
): TextEditResult => {
    const range = getSelectedLineRange(value, selection);
    const block = value.slice(range.start, range.end);
    const lines = block.split('\n');
    const nextLines = lines.map((line, index) => {
        const removablePrefix = removablePrefixes.find(prefix => prefix.test(line));
        if (removablePrefix) return line.replace(removablePrefix, '');
        return `${createPrefix(index)}${line}`;
    });
    const nextBlock = nextLines.join('\n');

    return replaceRange(value, range, nextBlock, {
        start: range.start,
        end: range.start + nextBlock.length,
    });
}

const toggleTaskList = (value: string, selection: SelectionRange): TextEditResult => {
    const range = getSelectedLineRange(value, selection);
    const block = value.slice(range.start, range.end);
    const lines = block.split('\n');
    const taskPrefix = /^(\s*)[-*+]\s+\[[ xX]\]\s*/;
    const listPrefix = /^(\s*)(?:[-*+]\s+|\d+\.\s+)/;
    const hasContent = lines.some(line => line.trim());
    const allTaskItems = hasContent && lines.every(line => !line.trim() || taskPrefix.test(line));

    const nextLines = lines.map(line => {
        if (allTaskItems) return line.replace(taskPrefix, '$1');

        const listMatch = listPrefix.exec(line);
        if (listMatch) return line.replace(listPrefix, `${listMatch[1]}- [ ] `);

        const indentMatch = /^(\s*)/.exec(line);
        const indent = indentMatch?.[1] ?? '';
        return `${indent}- [ ] ${line.slice(indent.length)}`;
    });
    const nextBlock = nextLines.join('\n');

    return replaceRange(value, range, nextBlock, {
        start: range.start,
        end: range.start + nextBlock.length,
    });
}

const insertBlock = (value: string, selection: SelectionRange, block: string): TextEditResult => {
    const safeSelection = normalizeSelection(selection, value.length);
    const before = value.slice(0, safeSelection.start);
    const after = value.slice(safeSelection.end);
    const prefix = before && !before.endsWith('\n') ? '\n' : '';
    const suffix = after && !after.startsWith('\n') ? '\n' : '';
    const insertText = `${prefix}${block}${suffix}`;
    const cursor = safeSelection.start + insertText.length;

    return replaceRange(value, safeSelection, insertText, { start: cursor, end: cursor });
}

export const applyMarkdownCommand = (
    value: string,
    selection: SelectionRange,
    command: EditorCommand,
): TextEditResult | null => {
    switch (command) {
        case 'h1':
            return prefixSelectedLines(value, selection, () => '# ', [/^#{1,6}\s+/]);
        case 'h2':
            return prefixSelectedLines(value, selection, () => '## ', [/^#{1,6}\s+/]);
        case 'h3':
            return prefixSelectedLines(value, selection, () => '### ', [/^#{1,6}\s+/]);
        case 'bold':
            return wrapSelection(value, selection, '**', '**', '加粗文本');
        case 'italic':
            return wrapSelection(value, selection, '*', '*', '斜体文本');
        case 'delete':
            return wrapSelection(value, selection, '~~', '~~', '删除线文本');
        case 'ul':
            return prefixSelectedLines(value, selection, () => '- ', [/^\s*[-*+]\s+/]);
        case 'ol':
            return prefixSelectedLines(value, selection, index => `${index + 1}. `, [/^\s*\d+\.\s+/]);
        case 'taskList':
            return toggleTaskList(value, selection);
        case 'quote':
            return prefixSelectedLines(value, selection, () => '> ', [/^>\s?/]);
        case 'divider':
            return insertBlock(value, selection, '---\n');
        case 'link':
            return wrapSelection(value, selection, '[', '](https://)', '链接文本');
        case 'inlineCode':
            return wrapSelection(value, selection, '`', '`', 'code');
        case 'blockCode':
            return insertBlock(value, selection, '```\n代码块\n```\n');
        case 'table':
            return insertBlock(value, selection, '| 标题 | 标题 |\n| --- | --- |\n| 内容 | 内容 |\n');
        case 'formula':
            return wrapSelection(value, selection, '$', '$', 'E = mc^2');
        case 'save':
            return null;
    }
}

export const insertTabAtSelection = (value: string, selection: SelectionRange) => {
    return replaceRange(value, selection, '    ');
}
