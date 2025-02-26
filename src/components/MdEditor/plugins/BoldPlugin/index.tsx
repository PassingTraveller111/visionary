'use client'
import React from 'react';
import { PluginProps } from 'react-markdown-editor-lite';
import styles from './index.module.scss';
import boldIcon from '../../../../../public/icon/pluginIcon/bold.svg';
import PluginIcon from "@/components/MdEditor/PluginIcon";
import { Tooltip } from "antd";
import classNames from "classnames";
import {insertToPreAndLast} from "@/components/MdEditor/plugins/utils";

const BoldPlugin = (props: PluginProps) => {
    const { editor } = props;
    const insertBold = () => {
        insertToPreAndLast(editor, "**", "**")
    }
    return <Tooltip
            title='加粗'
        >
            <span
                className={classNames({
                    'button': true,
                    [styles.BoldPluginContainer]: true,
                })}
                onClick={() => {
                    insertBold()
                }}
            >
                <PluginIcon defaultIcon={boldIcon} width={17} height={17}/>
            </span>
        </Tooltip>
}
// 如果需要的话，可以在这里定义默认选项
// SavePlugin.defaultConfig = {
//     articleId: 'new',
// }
BoldPlugin.align = 'left';
BoldPlugin.pluginName = 'BoldPlugin';


export default BoldPlugin;