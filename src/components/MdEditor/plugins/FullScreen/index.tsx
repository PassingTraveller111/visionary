'use client'
import React, {useState} from 'react';
import { PluginProps } from 'react-markdown-editor-lite';
import styles from './index.module.scss';
import onlyEditorIcon from '../../../../../public/icon/pluginIcon/fullScreen.svg';
import PluginIcon from "@/components/MdEditor/PluginIcon";
import { Tooltip } from "antd";
import classNames from "classnames";


const FullScreenPlugin = (props: PluginProps) => {
    const { editor } = props;
    const [isFull, setIsFull] = useState(false);
    const [] = useState('all');
    const changeScreen = () => {
        editor.fullScreen(!isFull);
        setIsFull(pre => !pre);
    }
    return <Tooltip
            title={ isFull ? '恢复默认' : '全屏' }
            placement={'topRight'}
        >
            <span className={classNames({
                'button': true,
                [styles.FullScreenPluginContainer]: true,
                [styles.selected]: isFull,
            })}
                  onClick={() => {
                      changeScreen();
                  }}
            >
                <PluginIcon defaultIcon={onlyEditorIcon} />
            </span>
        </Tooltip>
}

FullScreenPlugin.align = 'right';
FullScreenPlugin.pluginName = 'FullScreenPlugin';


export default FullScreenPlugin;