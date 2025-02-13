'use client'
import React, {useRef} from 'react';
import { PluginProps } from 'react-markdown-editor-lite';
import styles from './index.module.scss';
import classNames from "classnames";
import ImageIcon from '../../../../../public/pluginIcon/image.svg';
import ImageHoverIcon from '../../../../../public/pluginIcon/imageHover.svg';
import {apiClient, apiList} from "@/clientApi";
import {Tooltip} from "antd";
import PluginIcon from "@/components/MdEditor/PluginIcon";

const ImagePlugin = (props: PluginProps) => {
    const { editor } = props;
    const fileInputRef = useRef<HTMLInputElement>(null);
    const handleClick = () => {
        // 触发文件输入元素的点击事件
        if (fileInputRef.current)
            fileInputRef.current.click();
    };
    // 处理文件选择事件
    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if(event.target.files && event.target.files[0]) {
            const file = event.target.files[0];
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
        <Tooltip
            title='图片'
        >
            <span
                className={classNames({
                    'button': true,
                    [styles.ImagePluginContainer]: true,
                })}
                onClick={handleClick}
            >
                <PluginIcon defaultIcon={ImageIcon} hoverIcon={ImageHoverIcon} />
                {/* 隐藏的文件输入元素 */}
                <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    style={{display: 'none'}}
                    onChange={handleFileChange}
                />
            </span>
        </Tooltip>
    );
}
// 如果需要的话，可以在这里定义默认选项
ImagePlugin.defaultConfig = {
    imageUrl: '', // 默认的图片地址
}
ImagePlugin.align = 'left';
ImagePlugin.pluginName = 'image';


export default ImagePlugin;