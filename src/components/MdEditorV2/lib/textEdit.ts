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

const wrapBlockCode = (value: string, selection: SelectionRange): TextEditResult => {
    const safeSelection = normalizeSelection(selection, value.length);
    const selectedText = value.slice(safeSelection.start, safeSelection.end);
    const before = value.slice(0, safeSelection.start);
    const after = value.slice(safeSelection.end);
    const prefix = before && !before.endsWith('\n') ? '\n' : '';
    const suffix = after && !after.startsWith('\n') ? '\n' : '';
    const content = selectedText || '代码块';
    const fence = '```';
    const language = 'js';
    const insertText = `${prefix}${fence}${language}\n${content}\n${fence}${suffix}`;
    const contentStart = safeSelection.start + prefix.length + fence.length + language.length + 1;

    return replaceRange(value, safeSelection, insertText, {
        start: contentStart,
        end: contentStart + content.length,
    });
}

const getSelectedLineRange = (value: string, selection: SelectionRange) => {
    const safeSelection = normalizeSelection(selection, value.length);
    const lineStart = safeSelection.start === 0 ? 0 : value.lastIndexOf('\n', safeSelection.start - 1) + 1;
    const lineEndBreak = value.indexOf('\n', safeSelection.end);
    const lineEnd = lineEndBreak === -1 ? value.length : lineEndBreak;

    return {
        start: lineStart,
        end: lineEnd,
    };
}

const LIST_ITEM_PATTERN = /^[ \t]*(?:[-*+]|\d+[.)])[ \t]+/;
const ORDERED_LIST_ITEM_PATTERN = /^([ \t]*)(\d+)([.)])([ \t]+)/;
const UNORDERED_LIST_ITEM_PATTERN = /^([ \t]*)([-*+])([ \t]+)/;
const LIST_INDENT = '    ';

const getLineAtPosition = (value: string, position: number) => {
    const lineStart = position === 0 ? 0 : value.lastIndexOf('\n', position - 1) + 1;
    const lineEndBreak = value.indexOf('\n', position);
    return value.slice(lineStart, lineEndBreak === -1 ? value.length : lineEndBreak);
}

const changeSelectedLines = (
    value: string,
    selection: SelectionRange,
    createChange: (line: string) => { prefix: string; removeLength: number } | null,
): TextEditResult | null => {
    const range = getSelectedLineRange(value, selection);
    const lines = value.slice(range.start, range.end).split('\n');
    const lineStarts: number[] = [];
    const lineOffsets: number[] = [];
    const deltas: number[] = [];
    let offset = 0;
    let cumulativeDelta = 0;
    let changed = false;

    const nextLines = lines.map(line => {
        lineStarts.push(offset);
        lineOffsets.push(cumulativeDelta);
        offset += line.length + 1;

        const change = createChange(line);
        if (!change) {
            deltas.push(0);
            return line;
        }

        const delta = change.prefix.length - change.removeLength;
        deltas.push(delta);
        cumulativeDelta += delta;
        if (delta !== 0) changed = true;
        return `${change.prefix}${line.slice(change.removeLength)}`;
    });

    if (!changed) return null;

    const mapPosition = (position: number) => {
        let lineIndex = 0;
        for (let index = 0; index < lineStarts.length; index += 1) {
            if (range.start + lineStarts[index] <= position) lineIndex = index;
            else break;
        }

        const oldLineStart = range.start + lineStarts[lineIndex];
        const newLineStart = oldLineStart + lineOffsets[lineIndex];
        const lineDelta = deltas[lineIndex];
        const lineOffset = position - oldLineStart;
        const nextLineOffset = lineDelta >= 0
            ? (lineOffset > 0 ? lineOffset + lineDelta : 0)
            : Math.max(0, lineOffset + lineDelta);
        return newLineStart + nextLineOffset;
    }

    return replaceRange(value, range, nextLines.join('\n'), {
        start: mapPosition(selection.start),
        end: mapPosition(selection.end),
    });
}

const isListRelatedLine = (line: string) => {
    if (!line.trim()) return true;
    return LIST_ITEM_PATTERN.test(line) || /^[ \t]+\S/.test(line);
}

const renumberOrderedListItems = (value: string, selection: SelectionRange): TextEditResult => {
    const initialRange = getSelectedLineRange(value, selection);
    let blockStart = initialRange.start;
    let blockEnd = initialRange.end;

    while (blockStart > 0) {
        const previousLineEnd = blockStart - 1;
        const previousLineStart = previousLineEnd === 0 ? 0 : value.lastIndexOf('\n', previousLineEnd - 1) + 1;
        const previousLine = value.slice(previousLineStart, previousLineEnd);
        if (!isListRelatedLine(previousLine)) break;
        blockStart = previousLineStart;
    }

    while (blockEnd < value.length) {
        const nextLineStart = blockEnd + 1;
        const nextLineEndBreak = value.indexOf('\n', nextLineStart);
        const nextLineEnd = nextLineEndBreak === -1 ? value.length : nextLineEndBreak;
        const nextLine = value.slice(nextLineStart, nextLineEnd);
        if (!isListRelatedLine(nextLine)) break;
        blockEnd = nextLineEnd;
    }

    const lines = value.slice(blockStart, blockEnd).split('\n');
    const levels: { indent: number; ordered: boolean; counter: number }[] = [];
    const lineStarts: number[] = [];
    const lineOffsets: number[] = [];
    const lineDeltas: number[] = [];
    const lineChangeStarts: number[] = [];
    let offset = 0;
    let cumulativeDelta = 0;
    let changed = false;

    const nextLines = lines.map(line => {
        lineStarts.push(offset);
        lineOffsets.push(cumulativeDelta);
        offset += line.length + 1;

        const orderedMatch = ORDERED_LIST_ITEM_PATTERN.exec(line);
        const unorderedMatch = orderedMatch ? null : UNORDERED_LIST_ITEM_PATTERN.exec(line);
        if (!orderedMatch && !unorderedMatch) {
            lineDeltas.push(0);
            lineChangeStarts.push(0);
            return line;
        }

        const indent = (orderedMatch?.[1] ?? unorderedMatch?.[1] ?? '').length;
        const ordered = Boolean(orderedMatch);

        while (levels.length > 0 && levels[levels.length - 1].indent > indent) levels.pop();
        let level = levels[levels.length - 1];

        if (!level || level.indent < indent) {
            level = { indent, ordered, counter: 1 };
            levels.push(level);
        } else if (level.ordered !== ordered) {
            level.ordered = ordered;
            level.counter = 1;
        } else if (ordered) {
            level.counter += 1;
        }

        if (!orderedMatch) {
            lineDeltas.push(0);
            lineChangeStarts.push(0);
            return line;
        }

        const numberStart = orderedMatch[1].length;
        const oldNumber = orderedMatch[2];
        const nextNumber = String(level.counter);
        lineChangeStarts.push(numberStart);
        if (nextNumber === oldNumber) {
            lineDeltas.push(0);
            return line;
        }

        const delta = nextNumber.length - oldNumber.length;
        lineDeltas.push(delta);
        cumulativeDelta += delta;
        changed = true;
        return `${line.slice(0, numberStart)}${nextNumber}${line.slice(numberStart + oldNumber.length)}`;
    });

    if (!changed) return { value, selection };

    const mapPosition = (position: number) => {
        let lineIndex = 0;
        for (let index = 0; index < lineStarts.length; index += 1) {
            if (blockStart + lineStarts[index] <= position) lineIndex = index;
            else break;
        }

        const oldLineStart = blockStart + lineStarts[lineIndex];
        const newLineStart = oldLineStart + lineOffsets[lineIndex];
        const lineOffset = position - oldLineStart;
        const lineDelta = lineDeltas[lineIndex];
        const changeStart = lineChangeStarts[lineIndex];
        const nextLineOffset = lineDelta !== 0 && lineOffset > changeStart
            ? Math.max(changeStart, lineOffset + lineDelta)
            : lineOffset;
        return newLineStart + nextLineOffset;
    }

    return replaceRange(value, { start: blockStart, end: blockEnd }, nextLines.join('\n'), {
        start: mapPosition(selection.start),
        end: mapPosition(selection.end),
    });
}

export const indentListItems = (value: string, selection: SelectionRange): TextEditResult | null => {
    if (!LIST_ITEM_PATTERN.test(getLineAtPosition(value, selection.start))) return null;

    const result = changeSelectedLines(value, selection, line => (
        LIST_ITEM_PATTERN.test(line) ? { prefix: LIST_INDENT, removeLength: 0 } : null
    ));
    return result ? renumberOrderedListItems(result.value, result.selection) : null;
}

export const outdentListItems = (value: string, selection: SelectionRange): TextEditResult | null => {
    if (!LIST_ITEM_PATTERN.test(getLineAtPosition(value, selection.start))) return null;

    const result = changeSelectedLines(value, selection, line => {
        if (!LIST_ITEM_PATTERN.test(line)) return null;
        const indent = /^[ \t]{1,4}/.exec(line)?.[0] ?? '';
        return indent ? { prefix: '', removeLength: indent.length } : null;
    });
    return result ? renumberOrderedListItems(result.value, result.selection) : null;
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
            return wrapBlockCode(value, selection);
        case 'table':
            return insertBlock(value, selection, '| 标题 | 标题 |\n| --- | --- |\n| 内容 | 内容 |\n');
        case 'formula':
            return wrapSelection(value, selection, '$', '$', 'E = mc^2');
        case 'undo':
        case 'redo':
        case 'save':
            return null;
    }
}

export const insertTabAtSelection = (value: string, selection: SelectionRange) => {
    return replaceRange(value, selection, '    ');
}
