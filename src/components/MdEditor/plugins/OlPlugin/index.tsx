'use client'
import React from 'react';
import { PluginProps } from 'react-markdown-editor-lite';
import styles from './index.module.scss';
import Icon from '../../../../../public/icon/pluginIcon/ol.svg';
import PluginIcon from "@/components/MdEditor/PluginIcon";
import { Tooltip } from "antd";
import classNames from "classnames";
import { insertToSelectLinePrevious } from "@/components/MdEditor/plugins/utils";

const OlPlugin = (props: PluginProps) => {
    const { editor } = props;
    const insertOl = () => {
        insertToSelectLinePrevious(editor, (lineIndex) => `${lineIndex}. `);
    }
    return <Tooltip
        title='有序列表'
    >
        <span className={classNames({
            'button': true,
            [styles.OlPluginContainer]: true,
        })}
              onClick={() => {
                  insertOl()
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
OlPlugin.align = 'left';
OlPlugin.pluginName = 'OlPlugin';


export default OlPlugin;