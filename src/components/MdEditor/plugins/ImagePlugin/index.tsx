'use client'
import React, {useRef} from 'react';
import { PluginProps } from 'react-markdown-editor-lite';
import Image from "next/image";
import styles from './index.module.scss';
import classNames from "classnames";
import SaveIcon from '../../../../../public/save.svg';
import {apiClient, apiList} from "@/clientApi";

const ImagePlugin = (props: PluginProps) => {
    const { editor } = props;
    const fileInputRef = useRef(null);
    const handleClick = () => {
        // 触发文件输入元素的点击事件
        if (fileInputRef.current)
            fileInputRef.current.click();
    };
    // 处理文件选择事件
    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            console.log('选择的文件：', file.name);
            console.log('文件大小：', file.size, '字节');
            console.log('文件类型：', file.type);
            const formData = new FormData();
            formData.append('file', file);
            editor.insertPlaceholder('![]()', apiClient(apiList.post.protected.article.uploadImage, {
                    method: 'POST',
                    body: formData
                }).then(res => {
                    return `![](https://${res.data.Location})`
                })
            )
        }
    };

    return (
        <span
            className={classNames({
                'button': true,
                [styles.ImagePluginContainer]: true,
            })}
            title="图片"
            onClick={handleClick}
        >
            <Image src={SaveIcon} alt='save' width={18} height={18.5} />
            {/* 隐藏的文件输入元素 */}
            <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                style={{ display: 'none' }}
                onChange={handleFileChange}
            />
    </span>
    );
}
// 如果需要的话，可以在这里定义默认选项
ImagePlugin.defaultConfig = {
    imageUrl: '', // 默认的图片地址
}
ImagePlugin.align = 'left';
ImagePlugin.pluginName = 'image';


export default ImagePlugin;