'use client'

import React from 'react';
import {Button, Input} from 'antd';
import styles from '../index.module.scss';

type FindPanelProps = {
    findQuery: string;
    replaceText: string;
    matchCount: number;
    currentMatchIndex: number;
    onFindQueryChange: (value: string) => void;
    onReplaceTextChange: (value: string) => void;
    onFindInputKeyDown: (event: React.KeyboardEvent<HTMLInputElement>) => void;
    onFindPrevious: () => void;
    onFindNext: () => void;
    onReplaceCurrent: () => void;
    onReplaceAll: () => void;
    onClose: () => void;
};

const FindPanel = (props: FindPanelProps) => {
    const {
        findQuery,
        replaceText,
        matchCount,
        currentMatchIndex,
        onFindQueryChange,
        onReplaceTextChange,
        onFindInputKeyDown,
        onFindPrevious,
        onFindNext,
        onReplaceCurrent,
        onReplaceAll,
        onClose,
    } = props;

    return <div className={styles.findPanel}>
        <Input
            size="small"
            value={findQuery}
            placeholder="查找"
            onChange={(event) => onFindQueryChange(event.target.value)}
            onKeyDown={onFindInputKeyDown}
        />
        <Input
            size="small"
            value={replaceText}
            placeholder="替换为"
            onChange={(event) => onReplaceTextChange(event.target.value)}
            onPressEnter={onReplaceCurrent}
        />
        <span className={styles.findCount}>{matchCount ? `${currentMatchIndex + 1}/${matchCount}` : '0/0'}</span>
        <Button size="small" onClick={onFindPrevious} disabled={!matchCount}>上一个</Button>
        <Button size="small" onClick={onFindNext} disabled={!matchCount}>下一个</Button>
        <Button size="small" onClick={onReplaceCurrent} disabled={!matchCount}>替换</Button>
        <Button size="small" onClick={onReplaceAll} disabled={!matchCount}>全部替换</Button>
        <Button size="small" onClick={onClose}>关闭</Button>
    </div>
}

export default FindPanel;
