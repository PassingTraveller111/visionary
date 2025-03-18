'use client'
import React, {useCallback, useEffect, useRef} from 'react';
import { PluginProps } from 'react-markdown-editor-lite';
import styles from './index.module.scss';
import classNames from "classnames";
import ImageIcon from '../../../../../public/icon/pluginIcon/image.svg';
import {apiClient, apiList} from "@/clientApi";
import { Tooltip } from "antd";
import PluginIcon from "@/components/MdEditor/PluginIcon";
import {PluginTitle} from "@/components/MdEditor/PluginTitle";
import {useEditorOnKeyDown} from "@/components/MdEditor/plugins/hooks";

const ImagePlugin = (props: PluginProps) => {
    const { editor } = props;
    const fileInputRef = useRef<HTMLInputElement>(null);
    useEditorOnKeyDown(editor, 'image', () => {
        handleClick();
    })
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
    const handlePaste = useCallback((event: ClipboardEvent) => {
        const clipboardData = event.clipboardData;
        if (clipboardData && clipboardData.items) {
            for (let i = 0; i < clipboardData.items.length; i++) {
                const item = clipboardData.items[i];
                if (item.type.startsWith('image/')) {
                    // 阻止默认事件，不然会在文章末位插入文件名
                    event.stopPropagation();
                    event.preventDefault();
                    const file = item.getAsFile();
                    if (!file) return;
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
            }
        }
    }, [editor]);
    useEffect(() => {
        const editorElm =  getEditorElm();
        if(editorElm) editorElm.addEventListener('paste', handlePaste);
        return () => {
            if(editorElm) editorElm.removeEventListener('paste', handlePaste);
        }
    }, [handlePaste]);
    return (
        <Tooltip
            title={<PluginTitle title='图片' keyName='image' />}
        >
            <span
                className={classNames({
                    'button': true,
                    [styles.ImagePluginContainer]: true,
                })}
                onClick={handleClick}
            >
                <PluginIcon defaultIcon={ImageIcon} width={17} height={17}/>
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
ImagePlugin.pluginName = 'imagePlugin';


export default ImagePlugin;

// 获取编辑器元素
const getEditorElm = () => {
    const editorElms = document.querySelectorAll('textarea.section-container.input');
    if (editorElms.length > 0) return editorElms[0] as HTMLTextAreaElement;
    else return null;
}