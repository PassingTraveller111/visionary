'use client'
import React from 'react';
import { PluginProps } from 'react-markdown-editor-lite';
import styles from './index.module.scss';
import delIcon from '../../../../../public/icon/pluginIcon/del.svg';
import PluginIcon from "@/components/MdEditor/PluginIcon";
import { Tooltip } from "antd";
import classNames from "classnames";
import {insertToPreAndLast} from "@/components/MdEditor/plugins/utils";

const DelPlugin = (props: PluginProps) => {
    const { editor } = props;
    const insertDel = () => {
        insertToPreAndLast(editor, "~~", "~~");
    }
    return <Tooltip
        title='删除'
    >
            <span
                className={classNames({
                    'button': true,
                    [styles.BoldPluginContainer]: true,
                })}
                onClick={() => {
                    insertDel();
                }}
            >
                <PluginIcon defaultIcon={delIcon} width={17} height={16} />
            </span>
    </Tooltip>
}
// 如果需要的话，可以在这里定义默认选项
// SavePlugin.defaultConfig = {
//     articleId: 'new',
// }
DelPlugin.align = 'left';
DelPlugin.pluginName = 'DelPlugin';


export default DelPlugin;