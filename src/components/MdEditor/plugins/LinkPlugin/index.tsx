'use client'
import React from 'react';
import { PluginProps } from 'react-markdown-editor-lite';
import styles from './index.module.scss';
import Icon from '../../../../../public/icon/pluginIcon/link.svg';
import PluginIcon from "@/components/MdEditor/PluginIcon";
import { Tooltip } from "antd";
import classNames from "classnames";
import {insertToPreAndLast} from "@/components/MdEditor/plugins/utils";
import {PluginTitle} from "@/components/MdEditor/PluginTitle";
import {useEditorOnKeyDown} from "@/components/MdEditor/plugins/hooks";

const LinkPlugin = (props: PluginProps) => {
    const { editor } = props;
    useEditorOnKeyDown(editor, 'link', () => insert());
    const insert = () => {
        insertToPreAndLast(editor, "[", "](url)");
    }
    return <Tooltip
            title={<PluginTitle title='链接' keyName='link' />}
        >
            <span
                className={classNames({
                    'button': true,
                    [styles.LinkPluginContainer]: true,
                })}
                onClick={() => {
                    insert()
                }}
            >
                <PluginIcon defaultIcon={Icon} width={17} height={17}/>
            </span>
        </Tooltip>
}
// 如果需要的话，可以在这里定义默认选项
// SavePlugin.defaultConfig = {
//     articleId: 'new',
// }
LinkPlugin.align = 'left';
LinkPlugin.pluginName = 'LinkPlugin';


export default LinkPlugin;