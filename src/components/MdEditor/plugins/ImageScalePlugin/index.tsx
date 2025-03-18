'use client'
import React from 'react';
import Editor, { PluginProps } from 'react-markdown-editor-lite';
import styles from './index.module.scss';
import classNames from "classnames";
import {Dropdown, Tooltip} from "antd";
import { IconFont } from "@/components/IconFont";
import {PluginTitle} from "@/components/MdEditor/PluginTitle";

const ImageScalePlugin = (props: PluginProps) => {
    const { editor } = props;
    const handleClick = (width: string) => {
        changeImageScale(editor, width);
    };

    return (
        <Dropdown
            menu={{
                items: [
                    {
                        key: '33%',
                        label: '33%',
                        onClick: () => {
                            handleClick("33%");
                        }
                    },
                    {
                        key: '50%',
                        label: '50%',
                        onClick: () => {
                            handleClick("50%");
                        }
                    },
                    {
                        key: '67%',
                        label: '67%',
                        onClick: () => {
                            handleClick("67%");
                        }
                    },
                    {
                        key: '100%',
                        label: '100%',
                        onClick: () => {
                            handleClick("100%");
                        }
                    },
                ]
            }}
        >
            <Tooltip
                title={<PluginTitle title={'图片缩放'} />}
            >
               <span
                   className={classNames({
                       'button': true,
                       [styles.imageScalePluginContainer]: true,
                   })}
               >
                    <IconFont type='icon-imageScale'/>
                </span>
            </Tooltip>
        </Dropdown>
    );
}
// 如果需要的话，可以在这里定义默认选项
ImageScalePlugin.defaultConfig = {
    imageUrl: '', // 默认的图片地址
}
ImageScalePlugin.align = 'left';
ImageScalePlugin.pluginName = 'ImageScalePlugin';


export default ImageScalePlugin;


const changeImageScale = (editor: Editor, scale: string) => {
    const selection = editor.getSelection();
    let insertText = `<img alt="" src="" width="${scale}" />`;
    if(selection.start !== selection.end) {
        // 选中，识别是否有图片
        const res = parseMarkdownImage(selection.text);
        if(res.isMarkdownImage || res.isHtmlImg){
            insertText = `<img alt="${res.altText}" src="${res.imageUrl}" width="${scale}" />`;
        }
    }
    editor.insertText(insertText, true, {
        start: selection.start,
        end: selection.start + insertText.length,
    });
}

function parseMarkdownImage(markdown: string) {
    // 尝试匹配 Markdown 图片格式
    const markdownRegex = /!\[([^\]]*)\]\(([^)]+)\)/;
    const markdownMatch = markdown.match(markdownRegex);

    if (markdownMatch) {
        const altText = markdownMatch[1];
        const imageUrl = markdownMatch[2];
        return {
            isMarkdownImage: true,
            isHtmlImg: false,
            altText: altText,
            imageUrl: imageUrl
        };
    }

    // 尝试匹配 HTML <img> 标签
    const htmlImgRegex = /<img\s+([^>]*?)\s*\/?>/i;
    const htmlImgMatch = markdown.match(htmlImgRegex);

    if (htmlImgMatch) {
        const attributes = htmlImgMatch[1];
        let imageUrl = null;
        let altText = null;

        const srcRegex = /src\s*=\s*(['"])(.*?)\1/i;
        const srcMatch = attributes.match(srcRegex);
        if (srcMatch) {
            imageUrl = srcMatch[2];
        }

        const altRegex = /alt\s*=\s*(['"])(.*?)\1/i;
        const altMatch = attributes.match(altRegex);
        if (altMatch) {
            altText = altMatch[2];
        }

        if (imageUrl) {
            return {
                isMarkdownImage: false,
                isHtmlImg: true,
                altText: altText || '',
                imageUrl: imageUrl
            };
        }
    }

    return {
        isMarkdownImage: false,
        isHtmlImg: false,
        altText: null,
        imageUrl: null
    };
}
