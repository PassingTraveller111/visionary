'use client'

import React, {useCallback, useDeferredValue, useEffect, useMemo, useRef, useState} from 'react';
import classNames from 'classnames';
import {Button, Divider, Input, InputNumber, Modal, Space, message} from 'antd';
import ReactMarkdown from '@/components/ReactMarkdown';
import {apiClient} from '@/clientApi';
import {useGetDiagramsList, useUpdateDiagram} from '@/hooks/diagrams/useDiagram';
import {useAppSelector} from '@/store';
import {validateImageFile} from '@/utils/imageUpload';
import type {ApiResponse} from '@/shared/api/response';
import type {EditorCommand, EditorMode, SelectionRange} from './types';
import {applyMarkdownCommand, insertTabAtSelection, replaceRange} from './utils';
import MarkdownToolbar from './toolbar';
import styles from './index.module.scss';

type MdEditorV2Props = {
    value: string;
    onChange: (value: string) => void;
    onSaveDraft: (value?: string) => void;
    saveStatus?: 'loading' | 'success' | 'error';
    lastSavedAt?: Date | null;
    hasUnsavedChanges?: boolean;
    onRetrySave?: () => void;
    className?: string;
};

type FindMatch = SelectionRange;

type ImageTarget = {
    range: SelectionRange;
    url: string;
    alt: string;
    width: string;
};

type HighlightRange = SelectionRange & {
    className: string;
};

const getRandomId = () => globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`;

const escapeHtmlAttribute = (value: string) => value.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const getLineColumn = (value: string, cursor: number) => {
    const safeCursor = Math.max(0, Math.min(cursor, value.length));
    const beforeCursor = value.slice(0, safeCursor);
    const lines = beforeCursor.split('\n');
    return {
        line: lines.length,
        column: lines[lines.length - 1].length + 1,
    };
}

const formatSavedAt = (date?: Date | null) => {
    if (!date) return '';
    return date.toLocaleTimeString('zh-CN', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
    });
}

const findMatches = (value: string, query: string): FindMatch[] => {
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

const collectMarkdownHighlightRanges = (value: string) => {
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

const findImageTarget = (value: string, cursor: number): ImageTarget | null => {
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

const getEnterContinuation = (value: string, selection: SelectionRange) => {
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

const createMarkdownTable = (rows: number, columns: number) => {
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

const MdEditorV2 = (props: MdEditorV2Props) => {
    const { value = '', onChange, onSaveDraft, saveStatus = 'success', lastSavedAt, hasUnsavedChanges = false, onRetrySave, className } = props;
    const [mode, setMode] = useState<EditorMode>('split');
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [findPanelOpen, setFindPanelOpen] = useState(false);
    const [findQuery, setFindQuery] = useState('');
    const [debouncedFindQuery, setDebouncedFindQuery] = useState('');
    const [replaceText, setReplaceText] = useState('');
    const [currentMatchIndex, setCurrentMatchIndex] = useState(0);
    const [tableModalOpen, setTableModalOpen] = useState(false);
    const [tableRows, setTableRows] = useState(3);
    const [tableColumns, setTableColumns] = useState(3);
    const [diagramModalOpen, setDiagramModalOpen] = useState(false);
    const [creatingDiagram, setCreatingDiagram] = useState(false);
    const [imageSizeModalOpen, setImageSizeModalOpen] = useState(false);
    const [imageTarget, setImageTarget] = useState<ImageTarget | null>(null);
    const [imageWidth, setImageWidth] = useState('50%');
    const [cursorPosition, setCursorPosition] = useState<SelectionRange>({ start: 0, end: 0 });
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const previewRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const highlightRef = useRef<HTMLPreElement>(null);
    const isSyncingScrollRef = useRef(false);
    const valueRef = useRef(value);
    const [messageApi, contextHolder] = message.useMessage();
    const [diagramsList] = useGetDiagramsList();
    const updateDiagram = useUpdateDiagram();
    const userInfo = useAppSelector(state => state.rootReducer.userReducer.value);
    const deferredValue = useDeferredValue(value);
    const matches = useMemo(() => findMatches(value, debouncedFindQuery), [debouncedFindQuery, value]);
    const currentPosition = getLineColumn(value, cursorPosition.start);

    useEffect(() => {
        valueRef.current = value;
    }, [value]);

    useEffect(() => {
        const html = document.documentElement;
        const previousOverflow = html.style.overflow;
        html.style.overflow = 'hidden';
        return () => {
            html.style.overflow = previousOverflow;
        }
    }, []);

    const getSelection = useCallback((): SelectionRange => {
        const textarea = textareaRef.current;
        if (!textarea) return { start: valueRef.current.length, end: valueRef.current.length };
        return {
            start: textarea.selectionStart,
            end: textarea.selectionEnd,
        };
    }, []);

    const focusSelection = useCallback((selection: SelectionRange) => {
        window.setTimeout(() => {
            const textarea = textareaRef.current;
            if (!textarea) return;
            textarea.focus();
            textarea.setSelectionRange(selection.start, selection.end);
            const lineCount = valueRef.current.slice(0, selection.start).split('\n').length;
            const lineHeight = Number.parseFloat(window.getComputedStyle(textarea).lineHeight) || 28;
            const targetTop = Math.max(0, (lineCount - 1) * lineHeight - textarea.clientHeight / 2);
            textarea.scrollTop = targetTop;
            if (highlightRef.current) {
                highlightRef.current.scrollTop = textarea.scrollTop;
                highlightRef.current.scrollLeft = textarea.scrollLeft;
            }
        });
    }, []);

    const applyChange = useCallback((nextValue: string, selection?: SelectionRange) => {
        valueRef.current = nextValue;
        onChange(nextValue);
        onSaveDraft(nextValue);
        if (selection) focusSelection(selection);
    }, [focusSelection, onChange, onSaveDraft]);

    const updateCursorPosition = useCallback(() => {
        setCursorPosition(getSelection());
    }, [getSelection]);

    const syncHighlightScroll = useCallback(() => {
        const textarea = textareaRef.current;
        const highlight = highlightRef.current;
        if (!textarea || !highlight) return;
        highlight.scrollTop = textarea.scrollTop;
        highlight.scrollLeft = textarea.scrollLeft;
    }, []);

    const syncPreviewFromEditor = useCallback(() => {
        syncHighlightScroll();
        const textarea = textareaRef.current;
        const preview = previewRef.current;
        if (!textarea || !preview || isSyncingScrollRef.current) return;

        const maxEditorScroll = textarea.scrollHeight - textarea.clientHeight;
        const maxPreviewScroll = preview.scrollHeight - preview.clientHeight;
        if (maxEditorScroll <= 0 || maxPreviewScroll <= 0) return;

        isSyncingScrollRef.current = true;
        preview.scrollTop = (textarea.scrollTop / maxEditorScroll) * maxPreviewScroll;
        window.requestAnimationFrame(() => {
            isSyncingScrollRef.current = false;
        });
    }, [syncHighlightScroll]);

    const syncEditorFromPreview = useCallback(() => {
        const textarea = textareaRef.current;
        const preview = previewRef.current;
        if (!textarea || !preview || isSyncingScrollRef.current) return;

        const maxEditorScroll = textarea.scrollHeight - textarea.clientHeight;
        const maxPreviewScroll = preview.scrollHeight - preview.clientHeight;
        if (maxEditorScroll <= 0 || maxPreviewScroll <= 0) return;

        isSyncingScrollRef.current = true;
        textarea.scrollTop = (preview.scrollTop / maxPreviewScroll) * maxEditorScroll;
        syncHighlightScroll();
        window.requestAnimationFrame(() => {
            isSyncingScrollRef.current = false;
        });
    }, [syncHighlightScroll]);

    const insertText = useCallback((insertValue: string) => {
        const result = replaceRange(valueRef.current, getSelection(), insertValue);
        applyChange(result.value, result.selection);
    }, [applyChange, getSelection]);

    const insertTable = useCallback(() => {
        insertText(`\n${createMarkdownTable(tableRows, tableColumns)}\n`);
        setTableModalOpen(false);
    }, [insertText, tableColumns, tableRows]);

    const runCommand = useCallback((command: EditorCommand) => {
        if (command === 'save') {
            onSaveDraft(valueRef.current);
            return;
        }

        const result = applyMarkdownCommand(valueRef.current, getSelection(), command);
        if (!result) return;
        applyChange(result.value, result.selection);
    }, [applyChange, getSelection, onSaveDraft]);

    const selectMatch = useCallback((matchIndex: number, nextMatches = matches) => {
        if (nextMatches.length === 0) return;
        const normalizedIndex = (matchIndex + nextMatches.length) % nextMatches.length;
        setCurrentMatchIndex(normalizedIndex);
        focusSelection(nextMatches[normalizedIndex]);
    }, [focusSelection, matches]);

    const findNext = useCallback(() => {
        selectMatch(currentMatchIndex + 1);
    }, [currentMatchIndex, selectMatch]);

    const findPrevious = useCallback(() => {
        selectMatch(currentMatchIndex - 1);
    }, [currentMatchIndex, selectMatch]);

    const onFindInputKeyDown = useCallback((event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key !== 'Enter') return;
        event.preventDefault();
        if (event.shiftKey) findPrevious();
        else findNext();
    }, [findNext, findPrevious]);

    const replaceCurrent = useCallback(() => {
        const match = matches[currentMatchIndex];
        if (!match) return;
        const result = replaceRange(valueRef.current, match, replaceText);
        applyChange(result.value, result.selection);
        const nextMatches = findMatches(result.value, debouncedFindQuery);
        selectMatch(Math.min(currentMatchIndex, nextMatches.length - 1), nextMatches);
    }, [applyChange, currentMatchIndex, debouncedFindQuery, matches, replaceText, selectMatch]);

    const replaceAll = useCallback(() => {
        if (!debouncedFindQuery) return;
        const nextValue = valueRef.current.replaceAll(debouncedFindQuery, replaceText);
        applyChange(nextValue, { start: 0, end: 0 });
        setCurrentMatchIndex(0);
    }, [applyChange, debouncedFindQuery, replaceText]);

    useEffect(() => {
        const timer = window.setTimeout(() => {
            setDebouncedFindQuery(findQuery);
            setCurrentMatchIndex(0);
        }, 250);

        return () => window.clearTimeout(timer);
    }, [findQuery]);

    useEffect(() => {
        if (!isFullscreen) return;
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') setIsFullscreen(false);
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [isFullscreen]);

    const uploadImage = useCallback(async (file: File) => {
        const validResult = await validateImageFile(file);
        if ('error' in validResult) {
            messageApi.error(validResult.error);
            return;
        }

        const placeholder = `![uploading-${getRandomId()}]()`;
        const placeholderResult = replaceRange(valueRef.current, getSelection(), placeholder);
        applyChange(placeholderResult.value, placeholderResult.selection);

        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await apiClient('articles/images', {
                method: 'POST',
                body: formData,
            }) as ApiResponse<{ Location?: string }>;

            if (!res.ok || !res.data.Location) {
                messageApi.error('图片上传失败');
                return;
            }

            const currentText = valueRef.current;
            const placeholderStart = currentText.indexOf(placeholder);
            if (placeholderStart === -1) return;

            const imageText = `![](https://${res.data.Location})`;
            const result = replaceRange(currentText, {
                start: placeholderStart,
                end: placeholderStart + placeholder.length,
            }, imageText);
            applyChange(result.value, result.selection);
        } catch (error) {
            console.error('图片上传失败:', error);
            messageApi.error('图片上传失败');
        }
    }, [applyChange, getSelection, messageApi]);

    const onFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) void uploadImage(file);
        event.target.value = '';
    }, [uploadImage]);

    const onPaste = useCallback((event: React.ClipboardEvent<HTMLTextAreaElement>) => {
        const imageItem = Array.from(event.clipboardData.items).find(item => item.type.startsWith('image/'));
        if (!imageItem) return;

        const file = imageItem.getAsFile();
        if (!file) return;
        event.preventDefault();
        void uploadImage(file);
    }, [uploadImage]);

    const onKeyDown = useCallback((event: React.KeyboardEvent<HTMLTextAreaElement>) => {
        const isModKey = event.metaKey || event.ctrlKey;
        if (event.key === 'Enter' && !event.shiftKey && !event.metaKey && !event.ctrlKey && !event.altKey) {
            const result = getEnterContinuation(valueRef.current, getSelection());
            if (result) {
                event.preventDefault();
                applyChange(result.value, result.selection);
                return;
            }
        }

        if (event.key === 'Tab') {
            event.preventDefault();
            const result = insertTabAtSelection(valueRef.current, getSelection());
            applyChange(result.value, result.selection);
            return;
        }

        if (!isModKey) return;
        const key = event.key.toLowerCase();
        if (key === 'b') {
            event.preventDefault();
            runCommand('bold');
        }
        if (key === 'i') {
            event.preventDefault();
            runCommand('italic');
        }
        if (key === 's') {
            event.preventDefault();
            onSaveDraft(valueRef.current);
        }
        if (key === 'f') {
            event.preventDefault();
            setFindPanelOpen(true);
        }
    }, [applyChange, getSelection, onSaveDraft, runCommand]);

    const insertDiagram = useCallback((diagramId: number) => {
        insertText(`\n\`\`\`diagram?id=${diagramId}\n\`\`\`\n`);
        setDiagramModalOpen(false);
    }, [insertText]);

    const createDiagram = useCallback(async (type: 'flow' | 'mindMap') => {
        if (!userInfo.id) {
            messageApi.error('请先登录');
            return;
        }

        setCreatingDiagram(true);
        try {
            const res = await updateDiagram({
                id: 'new',
                type,
                intro: '',
                tags: [],
                title: '新建图表',
                data: '',
                author_id: userInfo.id,
                cover: '',
                create_time: '',
                update_time: '',
            }, userInfo);
            if (typeof res.id === 'number') insertDiagram(res.id);
        } finally {
            setCreatingDiagram(false);
        }
    }, [insertDiagram, messageApi, updateDiagram, userInfo]);

    const openImageSizeModal = useCallback(() => {
        const target = findImageTarget(valueRef.current, getSelection().start);
        if (!target) {
            messageApi.warning('请先把光标放在图片附近');
            return;
        }

        setImageTarget(target);
        setImageWidth(target.width || '50%');
        setImageSizeModalOpen(true);
    }, [getSelection, messageApi]);

    const applyImageSize = useCallback(() => {
        if (!imageTarget) return;
        const width = imageWidth.trim();
        if (!/^\d{1,4}$/.test(width) && !/^(100|[1-9]?\d)%$/.test(width)) {
            messageApi.error('宽度支持 1-9999 或 1%-100%');
            return;
        }

        const alt = imageTarget.alt ? ` alt="${escapeHtmlAttribute(imageTarget.alt)}"` : '';
        const imageText = `<img src="${escapeHtmlAttribute(imageTarget.url)}"${alt} width="${escapeHtmlAttribute(width)}" />`;
        const result = replaceRange(valueRef.current, imageTarget.range, imageText);
        applyChange(result.value, result.selection);
        setImageSizeModalOpen(false);
    }, [applyChange, imageTarget, imageWidth, messageApi]);

    const statusText = saveStatus === 'loading'
        ? '正在保存...'
        : saveStatus === 'error'
            ? '保存失败'
            : hasUnsavedChanges
                ? '有未保存修改'
            : lastSavedAt
                ? `已保存 ${formatSavedAt(lastSavedAt)}`
                : '修改已经保存';

    const highlightedValue = useMemo(() => {
        const ranges: HighlightRange[] = collectMarkdownHighlightRanges(value);

        if (findPanelOpen && debouncedFindQuery && matches.length > 0) {
            matches.forEach((match, index) => {
                ranges.push({
                    ...match,
                    className: classNames(styles.findMark, {
                        [styles.activeFindMark]: index === currentMatchIndex,
                    }),
                });
            });
        }

        if (ranges.length === 0) return value;

        const boundaries = new Set([0, value.length]);
        ranges.forEach(range => {
            boundaries.add(range.start);
            boundaries.add(range.end);
        });
        const sortedBoundaries = Array.from(boundaries).sort((a, b) => a - b);

        return sortedBoundaries.slice(0, -1).map((start, index) => {
            const end = sortedBoundaries[index + 1];
            const text = value.slice(start, end);
            const activeRanges = ranges.filter(range => range.start < end && range.end > start);
            if (activeRanges.length === 0) return text;

            return <span key={`${start}-${end}`} className={classNames(activeRanges.map(range => range.className))}>{text}</span>;
        });
    }, [currentMatchIndex, debouncedFindQuery, findPanelOpen, matches, value]);

    return <div className={classNames(styles.editorContainer, className, {
        [styles.fullscreen]: isFullscreen,
    })}>
        {contextHolder}
        <MarkdownToolbar
            mode={mode}
            isFullscreen={isFullscreen}
            onCommand={runCommand}
            onModeChange={setMode}
            onFindClick={() => setFindPanelOpen(value => !value)}
            onFullscreenClick={() => setIsFullscreen(value => !value)}
            onTableClick={() => setTableModalOpen(true)}
            onImageClick={() => fileInputRef.current?.click()}
            onImageSizeClick={openImageSizeModal}
            onDiagramClick={() => setDiagramModalOpen(true)}
        />
        {findPanelOpen && <div className={styles.findPanel}>
            <Input
                size="small"
                value={findQuery}
                placeholder="查找"
                onChange={(event) => {
                    setFindQuery(event.target.value);
                }}
                onKeyDown={onFindInputKeyDown}
            />
            <Input
                size="small"
                value={replaceText}
                placeholder="替换为"
                onChange={(event) => setReplaceText(event.target.value)}
                onPressEnter={replaceCurrent}
            />
            <span className={styles.findCount}>{matches.length ? `${currentMatchIndex + 1}/${matches.length}` : '0/0'}</span>
            <Button size="small" onClick={findPrevious} disabled={!matches.length}>上一个</Button>
            <Button size="small" onClick={findNext} disabled={!matches.length}>下一个</Button>
            <Button size="small" onClick={replaceCurrent} disabled={!matches.length}>替换</Button>
            <Button size="small" onClick={replaceAll} disabled={!matches.length}>全部替换</Button>
            <Button size="small" onClick={() => setFindPanelOpen(false)}>关闭</Button>
        </div>}
        <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            hidden
            onChange={onFileChange}
        />
        <Modal
            open={tableModalOpen}
            title="插入表格"
            okText="插入"
            cancelText="取消"
            onOk={insertTable}
            onCancel={() => setTableModalOpen(false)}
        >
            <div className={styles.tableForm}>
                <div className={styles.tableFormItem}>
                    <span>行数</span>
                    <InputNumber min={1} max={30} value={tableRows} onChange={(value) => setTableRows(value ?? 1)} />
                </div>
                <div className={styles.tableFormItem}>
                    <span>列数</span>
                    <InputNumber min={1} max={12} value={tableColumns} onChange={(value) => setTableColumns(value ?? 1)} />
                </div>
                <div className={styles.tablePreview}>
                    {createMarkdownTable(tableRows, tableColumns)}
                </div>
            </div>
        </Modal>
        <div className={classNames(styles.body, {
            [styles.editOnly]: mode === 'edit',
            [styles.previewOnly]: mode === 'preview',
        })}>
            <div className={styles.editorPane}>
                <pre ref={highlightRef} className={styles.highlightLayer} aria-hidden="true">
                    {highlightedValue}
                    {'\n'}
                </pre>
                <textarea
                    ref={textareaRef}
                    className={styles.textarea}
                    value={value}
                    placeholder="开始写作，支持 Markdown 语法..."
                    spellCheck={false}
                    onChange={(event) => applyChange(event.target.value)}
                    onKeyDown={onKeyDown}
                    onPaste={onPaste}
                    onClick={updateCursorPosition}
                    onKeyUp={updateCursorPosition}
                    onSelect={updateCursorPosition}
                    onScroll={syncPreviewFromEditor}
                />
            </div>
            <div ref={previewRef} className={styles.previewPane} onScroll={syncEditorFromPreview}>
                {deferredValue.trim() ? <ReactMarkdown>{deferredValue}</ReactMarkdown> : <div className={styles.emptyPreview}>预览会显示在这里</div>}
            </div>
        </div>
        <div className={styles.statusBar}>
            <span>{statusText}</span>
            {saveStatus === 'error' && onRetrySave && <Button size="small" type="link" onClick={onRetrySave}>重试</Button>}
            <span>字数 {value.trim() ? value.trim().length : 0}</span>
            <span>行 {currentPosition.line}，列 {currentPosition.column}</span>
            {isFullscreen && <span>Esc 退出全屏</span>}
        </div>
        <Modal
            open={diagramModalOpen}
            title="插入图表"
            footer={null}
            onCancel={() => setDiagramModalOpen(false)}
            width={680}
        >
            <Space>
                <Button loading={creatingDiagram} onClick={() => void createDiagram('flow')}>新建流程图</Button>
                <Button loading={creatingDiagram} onClick={() => void createDiagram('mindMap')}>新建思维导图</Button>
            </Space>
            <Divider />
            {diagramsList.length ? <div className={styles.diagramList}>
                {diagramsList.map(diagram => <div
                    key={diagram.id}
                    className={styles.diagramItem}
                    onClick={() => insertDiagram(diagram.id)}
                >
                    <div className={styles.diagramTitle}>{diagram.title || '未命名图表'}</div>
                    <div className={styles.diagramMeta}>{diagram.type === 'mindMap' ? '思维导图' : '流程图'} · ID {diagram.id}</div>
                </div>)}
            </div> : <div className={styles.emptyDiagram}>暂无可插入图表</div>}
        </Modal>
        <Modal
            open={imageSizeModalOpen}
            title="调整图片尺寸"
            okText="应用"
            cancelText="取消"
            onOk={applyImageSize}
            onCancel={() => setImageSizeModalOpen(false)}
        >
            <div className={styles.imageSizeForm}>
                <div className={styles.imageUrl}>{imageTarget?.url}</div>
                <Input
                    value={imageWidth}
                    addonBefore="宽度"
                    placeholder="例如 50% 或 640"
                    onChange={(event) => setImageWidth(event.target.value)}
                    onPressEnter={applyImageSize}
                />
            </div>
        </Modal>
    </div>
}

export default MdEditorV2;
