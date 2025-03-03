'use client'
import React from 'react';
import { PluginProps } from 'react-markdown-editor-lite';
import styles from './index.module.scss';
import Icon from '../../../../../public/icon/pluginIcon/lineCode.svg';
import PluginIcon from "@/components/MdEditor/PluginIcon";
import { Tooltip } from "antd";
import classNames from "classnames";
import { insertToPreAndLast } from "@/components/MdEditor/plugins/utils";
import { PluginTitle } from "@/components/MdEditor/PluginTitle";
import {useEditorOnKeyDown} from "@/components/MdEditor/plugins/hooks";

const LineCodePlugin = (props: PluginProps) => {
    const { editor } = props;
    useEditorOnKeyDown(editor, 'lineCode', () => {
        insert();
    })
    const insert = () => {
        insertToPreAndLast(editor, "`", "`");
    }
    return <Tooltip
            title={<PluginTitle title='行内代码' keyName='lineCode'/>}
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
LineCodePlugin.align = 'left';
LineCodePlugin.pluginName = 'LineCodePlugin';


export default LineCodePlugin;