'use client'
import React from 'react';
import { PluginProps } from 'react-markdown-editor-lite';
import styles from './index.module.scss';
import italicIcon from '../../../../../public/icon/pluginIcon/italic.svg';
import PluginIcon from "@/components/MdEditor/PluginIcon";
import { Tooltip } from "antd";
import classNames from "classnames";
import { insertToPreAndLast } from "@/components/MdEditor/plugins/utils";
import {PluginTitle} from "@/components/MdEditor/PluginTitle";
import {useEditorOnKeyDown} from "@/components/MdEditor/plugins/hooks";

const ItalicPlugin = (props: PluginProps) => {
    const { editor } = props;
    useEditorOnKeyDown(editor, 'italic', () => {
        insertItalic();
    });
    const insertItalic = () => {
        insertToPreAndLast(editor, '*', '*');
    }
    return <Tooltip
                title={<PluginTitle title='斜体' keyName='italic' />}
            >
                    <span className={classNames({
                        'button': true,
                        [styles.ItalicPluginContainer]: true,
                    })}
                        onClick={() => {
                            insertItalic()
                        }}
                    >
                        <PluginIcon defaultIcon={italicIcon} />
                    </span>
            </Tooltip>
}
// 如果需要的话，可以在这里定义默认选项
// SavePlugin.defaultConfig = {
//     articleId: 'new',
// }
ItalicPlugin.align = 'left';
ItalicPlugin.pluginName = 'ItalicPlugin';


export default ItalicPlugin;