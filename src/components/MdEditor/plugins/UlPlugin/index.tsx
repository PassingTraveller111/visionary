'use client'
import React from 'react';
import { PluginProps } from 'react-markdown-editor-lite';
import styles from './index.module.scss';
import Icon from '../../../../../public/icon/pluginIcon/ul.svg';
import PluginIcon from "@/components/MdEditor/PluginIcon";
import { Tooltip } from "antd";
import classNames from "classnames";
import { insertToSelectLinePrevious } from "@/components/MdEditor/plugins/utils";

const UlPlugin = (props: PluginProps) => {
    const { editor } = props;
    const insertUl = () => {
        insertToSelectLinePrevious(editor, '- ');
    }
    return <Tooltip
        title='无序列表'
    >
        <span className={classNames({
            'button': true,
            [styles.UlPluginContainer]: true,
        })}
              onClick={() => {
                  insertUl()
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
UlPlugin.align = 'left';
UlPlugin.pluginName = 'UlPlugin';


export default UlPlugin;