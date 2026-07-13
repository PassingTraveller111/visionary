'use client'

import React from 'react';
import {InputNumber, Modal} from 'antd';
import {createMarkdownTable} from '../lib/editorHelpers';
import styles from '../index.module.scss';

type TableModalProps = {
    open: boolean;
    rows: number;
    columns: number;
    onRowsChange: (value: number) => void;
    onColumnsChange: (value: number) => void;
    onOk: () => void;
    onCancel: () => void;
};

const TableModal = (props: TableModalProps) => {
    const { open, rows, columns, onRowsChange, onColumnsChange, onOk, onCancel } = props;

    return <Modal
        open={open}
        title="插入表格"
        okText="插入"
        cancelText="取消"
        onOk={onOk}
        onCancel={onCancel}
    >
        <div className={styles.tableForm}>
            <div className={styles.tableFormItem}>
                <span>行数</span>
                <InputNumber min={1} max={30} value={rows} onChange={(value) => onRowsChange(value ?? 1)} />
            </div>
            <div className={styles.tableFormItem}>
                <span>列数</span>
                <InputNumber min={1} max={12} value={columns} onChange={(value) => onColumnsChange(value ?? 1)} />
            </div>
            <div className={styles.tablePreview}>{createMarkdownTable(rows, columns)}</div>
        </div>
    </Modal>
}

export default TableModal;
