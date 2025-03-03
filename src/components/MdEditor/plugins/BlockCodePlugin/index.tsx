'use client'
import React, {useCallback, useEffect} from 'react';
import { PluginProps } from 'react-markdown-editor-lite';
import styles from './index.module.scss';
import Icon from '../../../../../public/icon/pluginIcon/blockCode.svg';
import PluginIcon from "@/components/MdEditor/PluginIcon";
import { Tooltip } from "antd";
import classNames from "classnames";
import { insertToPreAndLast } from "@/components/MdEditor/plugins/utils";
import { PluginTitle } from "@/components/MdEditor/PluginTitle";
import {useEditorOnKeyDown} from "@/components/MdEditor/plugins/hooks";

const BlockCodePlugin = (props: PluginProps) => {
    const { editor } = props;
    useEditorOnKeyDown(editor, 'blockCode', (e) => {
        e.preventDefault(); // 阻止默认事件，这个快捷键会触发浏览器默认事件
        insert();
    })
    const insert = () => {
        insertToPreAndLast(editor, '\n```codeType\n', '\n```\n');
    }
    return <Tooltip
            title={<PluginTitle title='代码块' keyName='blockCode'/>}
        >
            <span
                className={classNames({
                    'button': true,
                    [styles.BlockPluginContainer]: true,
                })}
                onClick={() => {
                    insert()
                }}
            >
                <PluginIcon defaultIcon={Icon} width={17} height={17}/>
            </span>
        </Tooltip>
}

BlockCodePlugin.align = 'left';
BlockCodePlugin.pluginName = 'BlockCodePlugin';


export default BlockCodePlugin;