'use client'
import React from 'react';
import { PluginProps } from 'react-markdown-editor-lite';
import styles from './index.module.scss';
import Icon from '../../../../../public/icon/pluginIcon/divider.svg';
import PluginIcon from "@/components/MdEditor/PluginIcon";
import { Tooltip } from "antd";
import classNames from "classnames";

const DividerPlugin = (props: PluginProps) => {
    const { editor } = props;
    const insertDivider = () => {
        editor.insertText('\n\n---\n');
    }
    return <Tooltip
        title='分割线'
    >
        <span className={classNames({
            'button': true,
            [styles.DividerPluginContainer]: true,
        })}
              onClick={() => {
                  insertDivider();
              }}
        >
            <PluginIcon defaultIcon={Icon} />
        </span>
    </Tooltip>
}
// 如果需要的话，可以在这里定义默认选项
// SavePlugin.defaultConfig = {
//     articleId: 'new',
// }
DividerPlugin.align = 'left';
DividerPlugin.pluginName = 'DividerPlugin';


export default DividerPlugin;