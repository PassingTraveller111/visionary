'use client'

import React, {useCallback, useDeferredValue, useEffect, useMemo, useRef, useState} from 'react';
import classNames from 'classnames';
import {Button, message} from 'antd';
import ReactMarkdown from '@/components/ReactMarkdown';
import {apiClient} from '@/clientApi';
import {useGetDiagramsList, useUpdateDiagram} from '@/hooks/diagrams/useDiagram';
import {useAppSelector} from '@/store';
import {validateImageFile} from '@/utils/imageUpload';
import type {ApiResponse} from '@/shared/api/response';
import type {EditorCommand, EditorMode, HighlightRange, ImageTarget, MdEditorV2Props, SelectionRange} from './types';
import {collectMarkdownHighlightRanges, createMarkdownTable, escapeHtmlAttribute, findImageTarget, findMatches, formatSavedAt, getEnterContinuation, getLineColumn, getRandomId} from './lib/editorHelpers';
import {compressImageFile, EDITOR_IMAGE_UPLOAD_LIMIT} from './lib/imageCompression';
import {applyMarkdownCommand, insertTabAtSelection, replaceRange} from './lib/textEdit';
import DiagramModal from './components/DiagramModal';
import FindPanel from './components/FindPanel';
import ImageSizeModal from './components/ImageSizeModal';
import TableModal from './components/TableModal';
import MarkdownToolbar from './components/Toolbar';
import styles from './index.module.scss';

const HISTORY_LIMIT = 100;
const INPUT_HISTORY_GROUP_DELAY = 800;

type EditHistoryEntry = {
    value: string;
    selection: SelectionRange;
};

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
    const undoStackRef = useRef<EditHistoryEntry[]>([]);
    const redoStackRef = useRef<EditHistoryEntry[]>([]);
    const inputHistoryGroupOpenRef = useRef(false);
    const inputHistoryTimerRef = useRef<number | null>(null);
    const selectionBeforeInputRef = useRef<SelectionRange | null>(null);
    const [canUndo, setCanUndo] = useState(false);
    const [canRedo, setCanRedo] = useState(false);
    const [messageApi, contextHolder] = message.useMessage();
    const [diagramsList] = useGetDiagramsList();
    const updateDiagram = useUpdateDiagram();
    const userInfo = useAppSelector(state => state.rootReducer.userReducer.value);
    const deferredValue = useDeferredValue(value);
    const matches = useMemo(() => findMatches(value, debouncedFindQuery), [debouncedFindQuery, value]);
    const currentPosition = getLineColumn(value, cursorPosition.start);

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

    const updateHistoryState = useCallback(() => {
        setCanUndo(undoStackRef.current.length > 0);
        setCanRedo(redoStackRef.current.length > 0);
    }, []);

    const closeInputHistoryGroup = useCallback(() => {
        inputHistoryGroupOpenRef.current = false;
        if (inputHistoryTimerRef.current) {
            window.clearTimeout(inputHistoryTimerRef.current);
            inputHistoryTimerRef.current = null;
        }
    }, []);

    const extendInputHistoryGroup = useCallback(() => {
        if (inputHistoryTimerRef.current) window.clearTimeout(inputHistoryTimerRef.current);
        inputHistoryTimerRef.current = window.setTimeout(closeInputHistoryGroup, INPUT_HISTORY_GROUP_DELAY);
    }, [closeInputHistoryGroup]);

    useEffect(() => {
        if (value !== valueRef.current) {
            undoStackRef.current = [];
            redoStackRef.current = [];
            closeInputHistoryGroup();
            updateHistoryState();
        }
        valueRef.current = value;
    }, [closeInputHistoryGroup, updateHistoryState, value]);

    useEffect(() => closeInputHistoryGroup, [closeInputHistoryGroup]);

    const pushUndoEntry = useCallback((entry: EditHistoryEntry) => {
        undoStackRef.current.push(entry);
        if (undoStackRef.current.length > HISTORY_LIMIT) undoStackRef.current.shift();
        redoStackRef.current = [];
        updateHistoryState();
    }, [updateHistoryState]);

    const applyChange = useCallback((nextValue: string, selection?: SelectionRange, recordHistory = true, historySelection?: SelectionRange) => {
        const previousValue = valueRef.current;
        if (recordHistory && nextValue !== previousValue) {
            pushUndoEntry({
                value: previousValue,
                selection: historySelection ?? getSelection(),
            });
        }

        valueRef.current = nextValue;
        onChange(nextValue);
        onSaveDraft(nextValue);
        if (selection) focusSelection(selection);
    }, [focusSelection, getSelection, onChange, onSaveDraft, pushUndoEntry]);

    const restoreHistoryEntry = useCallback((entry: EditHistoryEntry) => {
        valueRef.current = entry.value;
        onChange(entry.value);
        onSaveDraft(entry.value);
        focusSelection(entry.selection);
    }, [focusSelection, onChange, onSaveDraft]);

    const undo = useCallback(() => {
        closeInputHistoryGroup();
        const entry = undoStackRef.current.pop();
        if (!entry) return;

        redoStackRef.current.push({
            value: valueRef.current,
            selection: getSelection(),
        });
        restoreHistoryEntry(entry);
        updateHistoryState();
    }, [closeInputHistoryGroup, getSelection, restoreHistoryEntry, updateHistoryState]);

    const redo = useCallback(() => {
        closeInputHistoryGroup();
        const entry = redoStackRef.current.pop();
        if (!entry) return;

        undoStackRef.current.push({
            value: valueRef.current,
            selection: getSelection(),
        });
        restoreHistoryEntry(entry);
        updateHistoryState();
    }, [closeInputHistoryGroup, getSelection, restoreHistoryEntry, updateHistoryState]);

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
        closeInputHistoryGroup();
        const result = replaceRange(valueRef.current, getSelection(), insertValue);
        applyChange(result.value, result.selection);
    }, [applyChange, closeInputHistoryGroup, getSelection]);

    const insertTable = useCallback(() => {
        insertText(`\n${createMarkdownTable(tableRows, tableColumns)}\n`);
        setTableModalOpen(false);
    }, [insertText, tableColumns, tableRows]);

    const runCommand = useCallback((command: EditorCommand) => {
        closeInputHistoryGroup();

        if (command === 'undo') {
            undo();
            return;
        }

        if (command === 'redo') {
            redo();
            return;
        }

        if (command === 'save') {
            onSaveDraft(valueRef.current);
            return;
        }

        const result = applyMarkdownCommand(valueRef.current, getSelection(), command);
        if (!result) return;
        applyChange(result.value, result.selection);
    }, [applyChange, closeInputHistoryGroup, getSelection, onSaveDraft, redo, undo]);

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
        closeInputHistoryGroup();
        const result = replaceRange(valueRef.current, match, replaceText);
        applyChange(result.value, result.selection);
        const nextMatches = findMatches(result.value, debouncedFindQuery);
        selectMatch(Math.min(currentMatchIndex, nextMatches.length - 1), nextMatches);
    }, [applyChange, closeInputHistoryGroup, currentMatchIndex, debouncedFindQuery, matches, replaceText, selectMatch]);

    const replaceAll = useCallback(() => {
        if (!debouncedFindQuery) return;
        closeInputHistoryGroup();
        const nextValue = valueRef.current.replaceAll(debouncedFindQuery, replaceText);
        applyChange(nextValue, { start: 0, end: 0 });
        setCurrentMatchIndex(0);
    }, [applyChange, closeInputHistoryGroup, debouncedFindQuery, replaceText]);

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
        let uploadFile = file;

        if (file.size > EDITOR_IMAGE_UPLOAD_LIMIT) {
            try {
                const compressResult = await compressImageFile(file);
                if ('error' in compressResult) {
                    messageApi.error(compressResult.error);
                    return;
                }

                uploadFile = compressResult.file;
                messageApi.info('图片过大，已压缩后上传');
            } catch (error) {
                console.error('图片压缩失败:', error);
                messageApi.error('图片压缩失败');
                return;
            }
        }

        if (uploadFile.size > EDITOR_IMAGE_UPLOAD_LIMIT) {
            messageApi.error('图片压缩后仍超过 1MB，请手动压缩后上传');
            return;
        }

        const validResult = await validateImageFile(uploadFile);
        if ('error' in validResult) {
            messageApi.error(validResult.error);
            return;
        }

        const placeholder = `![uploading-${getRandomId()}]()`;
        const placeholderResult = replaceRange(valueRef.current, getSelection(), placeholder);
        applyChange(placeholderResult.value, placeholderResult.selection);

        const formData = new FormData();
        formData.append('file', uploadFile);

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

    const onBeforeInput = useCallback(() => {
        selectionBeforeInputRef.current = getSelection();
    }, [getSelection]);

    const onTextChange = useCallback((event: React.ChangeEvent<HTMLTextAreaElement>) => {
        const nextValue = event.target.value;
        const previousValue = valueRef.current;
        if (nextValue !== previousValue) {
            if (!inputHistoryGroupOpenRef.current) {
                pushUndoEntry({
                    value: previousValue,
                    selection: selectionBeforeInputRef.current ?? getSelection(),
                });
                inputHistoryGroupOpenRef.current = true;
            }
            extendInputHistoryGroup();
        }

        applyChange(nextValue, undefined, false);
        selectionBeforeInputRef.current = null;
    }, [applyChange, extendInputHistoryGroup, getSelection, pushUndoEntry]);

    const onKeyDown = useCallback((event: React.KeyboardEvent<HTMLTextAreaElement>) => {
        const isModKey = event.metaKey || event.ctrlKey;
        if (event.key === 'Enter' && !event.shiftKey && !event.metaKey && !event.ctrlKey && !event.altKey) {
            const result = getEnterContinuation(valueRef.current, getSelection());
            if (result) {
                event.preventDefault();
                closeInputHistoryGroup();
                applyChange(result.value, result.selection);
                return;
            }
        }

        if (event.key === 'Tab') {
            event.preventDefault();
            closeInputHistoryGroup();
            const result = insertTabAtSelection(valueRef.current, getSelection());
            applyChange(result.value, result.selection);
            return;
        }

        if (!isModKey && (event.key.length === 1 || event.key === 'Backspace' || event.key === 'Delete')) {
            selectionBeforeInputRef.current = getSelection();
        }

        if (!isModKey) return;
        const key = event.key.toLowerCase();
        if (key === 'z') {
            event.preventDefault();
            if (event.shiftKey) redo();
            else undo();
            return;
        }
        if (key === 'y') {
            event.preventDefault();
            redo();
            return;
        }
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
    }, [applyChange, closeInputHistoryGroup, getSelection, onSaveDraft, redo, runCommand, undo]);

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
        const ranges: HighlightRange[] = collectMarkdownHighlightRanges(value, styles);

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
            canUndo={canUndo}
            canRedo={canRedo}
            onCommand={runCommand}
            onModeChange={setMode}
            onFindClick={() => setFindPanelOpen(value => !value)}
            onFullscreenClick={() => setIsFullscreen(value => !value)}
            onTableClick={() => setTableModalOpen(true)}
            onImageClick={() => fileInputRef.current?.click()}
            onImageSizeClick={openImageSizeModal}
            onDiagramClick={() => setDiagramModalOpen(true)}
        />
        {findPanelOpen && <FindPanel
            findQuery={findQuery}
            replaceText={replaceText}
            matchCount={matches.length}
            currentMatchIndex={currentMatchIndex}
            onFindQueryChange={setFindQuery}
            onReplaceTextChange={setReplaceText}
            onFindInputKeyDown={onFindInputKeyDown}
            onFindPrevious={findPrevious}
            onFindNext={findNext}
            onReplaceCurrent={replaceCurrent}
            onReplaceAll={replaceAll}
            onClose={() => setFindPanelOpen(false)}
        />}
        <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            hidden
            onChange={onFileChange}
        />
        <TableModal
            open={tableModalOpen}
            rows={tableRows}
            columns={tableColumns}
            onRowsChange={setTableRows}
            onColumnsChange={setTableColumns}
            onOk={insertTable}
            onCancel={() => setTableModalOpen(false)}
        />
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
                    onBeforeInput={onBeforeInput}
                    onChange={onTextChange}
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
        <DiagramModal
            open={diagramModalOpen}
            diagrams={diagramsList}
            creating={creatingDiagram}
            onCreate={(type) => void createDiagram(type)}
            onInsert={insertDiagram}
            onCancel={() => setDiagramModalOpen(false)}
        />
        <ImageSizeModal
            open={imageSizeModalOpen}
            imageTarget={imageTarget}
            imageWidth={imageWidth}
            onImageWidthChange={setImageWidth}
            onOk={applyImageSize}
            onCancel={() => setImageSizeModalOpen(false)}
        />
    </div>
}

export default MdEditorV2;
