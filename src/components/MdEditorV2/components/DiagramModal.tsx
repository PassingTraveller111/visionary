'use client'

import React from 'react';
import {Button, Divider, Modal, Space} from 'antd';
import styles from '../index.module.scss';

type DiagramItem = {
    id: number;
    title?: string;
    type?: string;
};

type DiagramModalProps = {
    open: boolean;
    diagrams: DiagramItem[];
    creating: boolean;
    onCreate: (type: 'flow' | 'mindMap') => void;
    onInsert: (diagramId: number) => void;
    onCancel: () => void;
};

const DiagramModal = (props: DiagramModalProps) => {
    const { open, diagrams, creating, onCreate, onInsert, onCancel } = props;

    return <Modal
        open={open}
        title="插入图表"
        footer={null}
        onCancel={onCancel}
        width={680}
    >
        <Space>
            <Button loading={creating} onClick={() => onCreate('flow')}>新建流程图</Button>
            <Button loading={creating} onClick={() => onCreate('mindMap')}>新建思维导图</Button>
        </Space>
        <Divider />
        {diagrams.length ? <div className={styles.diagramList}>
            {diagrams.map(diagram => <div
                key={diagram.id}
                className={styles.diagramItem}
                onClick={() => onInsert(diagram.id)}
            >
                <div className={styles.diagramTitle}>{diagram.title || '未命名图表'}</div>
                <div className={styles.diagramMeta}>{diagram.type === 'mindMap' ? '思维导图' : '流程图'} · ID {diagram.id}</div>
            </div>)}
        </div> : <div className={styles.emptyDiagram}>暂无可插入图表</div>}
    </Modal>
}

export default DiagramModal;
