'use client'

import React from 'react';
import {Input, Modal} from 'antd';
import type {ImageTarget} from '../types';
import styles from '../index.module.scss';

type ImageSizeModalProps = {
    open: boolean;
    imageTarget: ImageTarget | null;
    imageWidth: string;
    onImageWidthChange: (value: string) => void;
    onOk: () => void;
    onCancel: () => void;
};

const ImageSizeModal = (props: ImageSizeModalProps) => {
    const { open, imageTarget, imageWidth, onImageWidthChange, onOk, onCancel } = props;

    return <Modal
        open={open}
        title="调整图片尺寸"
        okText="应用"
        cancelText="取消"
        onOk={onOk}
        onCancel={onCancel}
    >
        <div className={styles.imageSizeForm}>
            <div className={styles.imageUrl}>{imageTarget?.url}</div>
            <Input
                value={imageWidth}
                addonBefore="宽度"
                placeholder="例如 50% 或 640"
                onChange={(event) => onImageWidthChange(event.target.value)}
                onPressEnter={onOk}
            />
        </div>
    </Modal>
}

export default ImageSizeModal;
