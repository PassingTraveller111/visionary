'use client'

import React from 'react';
import {Button, Dropdown, Space, Tooltip} from 'antd';
import type {MenuProps} from 'antd';
import type {EditorCommand, EditorMode} from '../types';
import styles from '../index.module.scss';

type MarkdownToolbarProps = {
    mode: EditorMode;
    isFullscreen: boolean;
    onCommand: (command: EditorCommand) => void;
    onModeChange: (mode: EditorMode) => void;
    onFindClick: () => void;
    onFullscreenClick: () => void;
    onTableClick: () => void;
    onImageClick: () => void;
    onImageSizeClick: () => void;
    onDiagramClick: () => void;
};

const titleItems: MenuProps['items'] = [
    { key: 'h1', label: '一级标题' },
    { key: 'h2', label: '二级标题' },
    { key: 'h3', label: '三级标题' },
];

const MarkdownToolbar = (props: MarkdownToolbarProps) => {
    const { mode, isFullscreen, onCommand, onModeChange, onFindClick, onFullscreenClick, onTableClick, onImageClick, onImageSizeClick, onDiagramClick } = props;

    return <div className={styles.toolbar}>
        <Space size={6} wrap>
            <Dropdown
                menu={{
                    items: titleItems,
                    onClick: ({ key }) => onCommand(key as EditorCommand),
                }}
            >
                <Button size="small">标题</Button>
            </Dropdown>
            <Tooltip title="加粗 Ctrl/Cmd + B"><Button size="small" onClick={() => onCommand('bold')}>B</Button></Tooltip>
            <Tooltip title="斜体 Ctrl/Cmd + I"><Button size="small" onClick={() => onCommand('italic')}>I</Button></Tooltip>
            <Tooltip title="删除线"><Button size="small" onClick={() => onCommand('delete')}>S</Button></Tooltip>
            <Button size="small" onClick={() => onCommand('ul')}>无序列表</Button>
            <Button size="small" onClick={() => onCommand('ol')}>有序列表</Button>
            <Button size="small" onClick={() => onCommand('taskList')}>任务列表</Button>
            <Button size="small" onClick={() => onCommand('quote')}>引用</Button>
            <Button size="small" onClick={() => onCommand('divider')}>分割线</Button>
            <Button size="small" onClick={() => onCommand('link')}>链接</Button>
            <Button size="small" onClick={() => onCommand('inlineCode')}>行内代码</Button>
            <Button size="small" onClick={() => onCommand('blockCode')}>代码块</Button>
            <Button size="small" onClick={onTableClick}>表格</Button>
            <Button size="small" onClick={() => onCommand('formula')}>公式</Button>
            <Button size="small" onClick={onImageClick}>图片</Button>
            <Button size="small" onClick={onImageSizeClick}>图片尺寸</Button>
            <Button size="small" onClick={onDiagramClick}>图表</Button>
        </Space>
        <Space size={6} className={styles.modeSwitch}>
            <Tooltip title="查找/替换 Ctrl/Cmd + F"><Button size="small" onClick={onFindClick}>查找</Button></Tooltip>
            <Button size="small" type={mode === 'edit' ? 'primary' : 'default'} onClick={() => onModeChange(mode === 'edit' ? 'split' : 'edit')}>仅编辑</Button>
            <Button size="small" type={mode === 'preview' ? 'primary' : 'default'} onClick={() => onModeChange(mode === 'preview' ? 'split' : 'preview')}>仅预览</Button>
            <Button size="small" type={isFullscreen ? 'primary' : 'default'} onClick={onFullscreenClick}>{isFullscreen ? '退出全屏' : '全屏'}</Button>
            <Tooltip title="保存 Ctrl/Cmd + S"><Button size="small" onClick={() => onCommand('save')}>保存</Button></Tooltip>
        </Space>
    </div>
}

export default MarkdownToolbar;
