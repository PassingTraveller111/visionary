'use client'
import React, {useState} from 'react';
import { PluginProps } from 'react-markdown-editor-lite';
import styles from './index.module.scss';
import onlyEditorIcon from '../../../../../public/icon/pluginIcon/onlyEditor.svg';
import onlyPreviewIcon from '../../../../../public/icon/pluginIcon/onlyPreview.svg';
import PluginIcon from "@/components/MdEditor/PluginIcon";
import { Tooltip } from "antd";
import classNames from "classnames";

type modeType = 'all' | 'onlyEditor' | 'onlyPreview';

const ModeChangePlugin = (props: PluginProps) => {
    const { editor } = props;
    const [mode, setMode] = useState<modeType>('all');
    const [] = useState('all');
    const changeMode = (mode: modeType) => {
        setMode(mode);
        editor.setView({
            md: mode === 'all' || mode === 'onlyEditor',
            html: mode === 'all' || mode === 'onlyPreview',
        })
    }
    return <>
        <Tooltip
            title={ mode === 'onlyEditor' ? '恢复默认' : '仅编辑区' }
        >
            <span className={classNames({
                'button': true,
                [styles.ModeChangePluginContainer]: true,
                [styles.selected]: mode === 'onlyEditor',
            })}
                  onClick={() => {
                      changeMode(mode === 'onlyEditor' ? 'all' : 'onlyEditor');
                  }}
            >
                <PluginIcon defaultIcon={onlyEditorIcon} />
            </span>
        </Tooltip>
        <Tooltip
            title={ mode === 'onlyPreview' ? '恢复默认' : '仅预览区' }
        >
            <span className={classNames({
                'button': true,
                [styles.ModeChangePluginContainer]: true,
                [styles.selected]: mode === 'onlyPreview',
            })}
                  onClick={() => {
                      changeMode(mode === 'onlyPreview' ? 'all' : 'onlyPreview');
                  }}
            >
                <PluginIcon defaultIcon={onlyPreviewIcon} />
            </span>
        </Tooltip>
    </>

}

ModeChangePlugin.align = 'right';
ModeChangePlugin.pluginName = 'ModeChangePlugin';


export default ModeChangePlugin;